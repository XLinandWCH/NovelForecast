import { GoogleGenAI } from '@google/genai';
import { Settings, Message } from '../store/useStore';

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
      const ai = new GoogleGenAI({ apiKey: settings.aiApiKey || process.env.GEMINI_API_KEY });
      
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
        const lines = chunk.split('\\n').filter(line => line.trim() !== '');
        
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

