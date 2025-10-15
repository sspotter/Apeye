import { GoogleGenAI } from '@google/genai';

export interface ProductInfo {
  name: string;
  url: string;
  description: string;
}

/**
 * Generate a short description for a website or product using Gemini AI
 * @param websiteName - The name or URL of the website/product
 * @returns A promise that resolves to the generated description
 */
export async function generateDescription(
  websiteName: string
): Promise<string> {
  if (!websiteName.trim()) {
    throw new Error('Website name or URL is required');
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key not found in environment variables. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  const tools = [
    { urlContext: {} },
    {
      googleSearch: {},
    },
  ];

  const config = {
    thinkingConfig: {
      thinkingBudget: 0,
    },
    tools,
    systemInstruction: [
        {
          text: `# 🧠 System Prompt: API Vault AI Assistant Integration

## Role & Purpose
You are the **AI Assistant** integrated inside the **Developer API Vault**.  
Your role is to help users understand, organize, and use their stored API credentials effectively — **without ever exposing or transmitting sensitive keys**.

You act as an intelligent **developer companion** that provides:
- Context-aware suggestions,
- Code generation snippets,
- API usage guidance,
- Documentation summaries,
- Organizational insights.

---

## 🎯 Core Objectives
1. **Understand context:**
   - You have access to metadata about the user’s selected API service (e.g., “OpenAI”, “Stripe”, “Discord”).
   - You can see non-sensitive fields like service name, description, category, and notes.
   - You cannot view or output actual API keys, passwords, or encrypted data.

2. **Assist developer workflow by:**
   - Generating code snippets showing how to authenticate or use that service’s API.
   - Explaining what each API key is typically used for (based on its label/notes).
   - Suggesting naming conventions, categorization, or documentation improvements.
   - Summarizing large note sections into concise documentation blocks.
   - Recommending best practices (security, key rotation, usage scopes, etc.).

3. **Maintain data safety:**
   - Never request or display full API keys or credentials.
   - Replace sensitive tokens with placeholders like \`<API_KEY>\` or \`<SECRET>\`.
   - Keep all suggestions and examples generic and safe for copy/paste.

---

## 🧩 Context You Receive
When the assistant is invoked, you will be given:
\`\`\`json
{
  "serviceName": "OpenAI",
  "category": "AI / NLP",
  "notes": "Used for GPT-5 text generation and embeddings",
  "apiCount": 4,
  "sampleKeyLabel": "prod_gpt5",
  "documentationURL": "https://platform.openai.com/docs"
}`,
        }
    ],
  };
  
  const model = 'gemini-flash-latest';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: websiteName,
        },
      ],
    },
  ];

  try {
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let fullText = '';
    for await (const chunk of response) {
      if (chunk.text) {
        fullText += chunk.text;
      }
    }

    return fullText.trim();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate description. Please check your API key and try again.');
  }
}

/**
 * Generate complete product information (name, url, description) using Gemini AI
 * @param websiteName - The name or URL of the website/product
 * @returns A promise that resolves to a ProductInfo object
 */
export async function generateProductInfo(
  websiteName: string
): Promise<ProductInfo> {
  const rawResponse = await generateDescription(websiteName);
  
  try {
    // Extract JSON from the response (handle markdown code blocks)
    let jsonString = rawResponse;
    
    // Remove markdown code blocks if present
    const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    } else {
      // Try to find JSON object in the response
      const objectMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonString = objectMatch[0];
      }
    }
    
    const parsed = JSON.parse(jsonString.trim()) as ProductInfo;
    
    // Validate the response has required fields
    if (!parsed.name || !parsed.url || !parsed.description) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    return parsed;
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    console.error('Raw response:', rawResponse);
    throw new Error('Failed to parse product information. The AI response was not in the expected format.');
  }
}
