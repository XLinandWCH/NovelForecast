import { Settings } from '../store/useStore';

export function chunkText(text: string, maxChunkSize = 500, overlap = 50): string[] {
  const chunks: string[] = [];
  // Split into sentences roughly
  const sentences = text.match(/[^。！？.!?\n]+[。！？.!?\n]?/g) || [text];
  
  let currentChunk = "";
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    if (currentChunk.length + trimmedSentence.length <= maxChunkSize) {
      currentChunk += (currentChunk ? " " : "") + trimmedSentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        // Create overlap
        const overlapStr = currentChunk.slice(-overlap);
        // Try to snap overlap to the last sentence boundary if possible
        const overlapSentences = overlapStr.match(/[^。！？.!?\n]+[。！？.!?\n]?/g);
        currentChunk = overlapSentences && overlapSentences.length > 0 
          ? overlapSentences[overlapSentences.length - 1].trim() 
          : overlapStr.trim();
      }
      
      // If a single sentence is bigger than maxChunkSize
      if (trimmedSentence.length > maxChunkSize) {
        let i = 0;
        while (i < trimmedSentence.length) {
          chunks.push(trimmedSentence.slice(i, i + maxChunkSize));
          i += maxChunkSize - overlap;
        }
        currentChunk = "";
      } else {
        currentChunk += (currentChunk ? " " : "") + trimmedSentence;
      }
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  return chunks;
}

export async function getEmbeddings(texts: string[], settings: Settings): Promise<number[][]> {
  if (!settings.ragBaseUrl) throw new Error("RAG Base URL is not configured");

  let baseUrl = settings.ragBaseUrl.replace(/\/$/, '');
  
  // Auto-append /v1 for known OpenAI-compatible local providers if missing
  if (!baseUrl.endsWith('/v1') && !baseUrl.endsWith('/api') && !baseUrl.includes('api.openai.com')) {
    if (['Nexa AI', 'LM Studio', 'Ollama', 'OpenAI'].includes(settings.ragProvider)) {
      baseUrl += '/v1';
    }
  }

  // If the user already included /embeddings in the base URL, don't append it again
  let fullUrl = baseUrl;
  if (!baseUrl.endsWith('/embeddings')) {
    fullUrl = `${baseUrl}/embeddings`;
  }

  let fetchUrl = fullUrl;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Bypass ngrok free tier warning
  };

  if (settings.ragApiKey) {
    headers['Authorization'] = `Bearer ${settings.ragApiKey}`;
  }

  // Proxy logic to bypass CORS for all external URLs
  try {
    const urlObj = new URL(fullUrl);
    if (urlObj.origin !== window.location.origin) {
      fetchUrl = `/api/rag${urlObj.pathname}`;
      headers['x-rag-target'] = `${urlObj.protocol}//${urlObj.host}`;
    }
  } catch (e) {
    console.warn("Invalid RAG Base URL format", e);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

  try {
    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        input: texts,
        model: settings.ragModel
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Embedding API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error("Invalid response format from Embedding API");
    }

    // Ensure they are sorted by index to match the input order
    const sortedData = data.data.sort((a: any, b: any) => a.index - b.index);
    return sortedData.map((d: any) => d.embedding);
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Embedding API request timed out after 15 seconds');
    }
    throw error;
  }
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
