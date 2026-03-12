import { GoogleGenAI } from '@google/genai';
import { Settings, Message } from '../store/useStore';

export async function generateGraphData(
  content: string,
  settings: Settings
): Promise<any> {
  const systemPrompt = `你是一个顶级的小说人物关系提取专家。请根据以下小说文本片段，提取尽可能全面、丰富的人物及其之间的关系，并输出为严格的JSON格式。
要求：
1. 以主角为中心，尽可能多地提取与主角相关的人物，以及这些人物之间的交叉关系。
2. 包含 nodes 和 links 两个数组。
3. nodes 元素格式: {"id": "人物ID", "name": "人物姓名", "group": 1(主角)/2(反派)/3(重要配角)/4(普通角色), "val": 重要程度(1-20，主角必须是20)}
4. links 元素格式: {"source": "源人物ID", "target": "目标人物ID", "label": "关系描述(如师徒、夫妻、生死大仇、暗恋等，尽量生动详细)", "polarity": "positive"(友好/亲密)/"negative"(敌对/仇恨)/"neutral"(中立/复杂)}
5. 只输出纯JSON，不要包含任何Markdown标记（如 \`\`\`json ），也不要任何解释性文字。

文本内容：
${content.substring(0, 15000)} // 限制长度避免超长
`;

  try {
    if (settings.aiProvider === 'Gemini') {
      const defaultApiKey = typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : '';
      const ai = new GoogleGenAI({ apiKey: settings.aiApiKey || defaultApiKey });
      
      const response = await ai.models.generateContent({
        model: settings.aiModel || 'gemini-3-flash-preview',
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      return JSON.parse(response.text || '{}');
    } else {
      const response = await fetch(`${settings.aiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.aiApiKey}`
        },
        body: JSON.stringify({
          model: settings.aiModel,
          messages: [{ role: 'user', content: systemPrompt }],
          temperature: 0.1,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const contentStr = data.choices[0]?.message?.content || '{}';
      return JSON.parse(contentStr);
    }
  } catch (error: any) {
    console.error('Graph Generation Error:', error);
    throw new Error(error.message || '生成图谱失败');
  }
}
export async function streamAI(
  messages: Message[],
  settings: Settings,
  context: string,
  onChunk: (text: string) => void
): Promise<string> {
  const systemPrompt = `你是一个小说预测助手。请根据提供的知识库上下文和用户的提问进行回答。
如果知识库中没有相关信息，请结合你的知识进行合理的预测和续写。

知识库上下文：
${context}
`;

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }))
  ];

  try {
    if (settings.aiProvider === 'Gemini') {
      // Use Gemini SDK
      // Safely access process.env for browser environments (like Cloudflare Pages)
      const defaultApiKey = typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : '';
      const ai = new GoogleGenAI({ apiKey: settings.aiApiKey || defaultApiKey });
      
      const geminiMessages = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const responseStream = await ai.models.generateContentStream({
        model: settings.aiModel || 'gemini-3-flash-preview',
        contents: geminiMessages as any,
        config: {
          systemInstruction: systemPrompt,
        }
      });

      let fullText = '';
      for await (const chunk of responseStream) {
        if (chunk.text) {
          fullText += chunk.text;
          onChunk(fullText);
        }
      }
      return fullText;
    } else {
      // Use OpenAI compatible endpoint
      const response = await fetch(`${settings.aiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.aiApiKey}`
        },
        body: JSON.stringify({
          model: settings.aiModel,
          messages: formattedMessages,
          temperature: 0.7,
          stream: true,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.replace(/^data: /, '').trim() === '[DONE]') {
            return fullText;
          }
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace(/^data: /, ''));
              const content = data.choices[0]?.delta?.content;
              if (content) {
                fullText += content;
                onChunk(fullText);
              }
            } catch (e) {
              console.error('Error parsing stream chunk', e);
            }
          }
        }
      }
      return fullText;
    }
  } catch (error: any) {
    console.error('AI Call Error:', error);
    throw new Error(error.message || '调用大模型失败');
  }
}

