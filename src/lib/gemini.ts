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
            text: `## 🧠 Gemini System Prompt: Product Info JSON Generator
  
  ### Role
  You are an expert product analyst who provides clear, factual, and concise descriptions of companies, websites, and digital products.
  
  ### Goal
  When given the **name** of a product, website, or company, return a **structured JSON object** that includes:
  1. \`"name"\` — the official or most common name  
  2. \`"url"\` — the verified official website URL (if identifiable)  
  3. \`"description"\` — a short, factual description (2–4 sentences)
  
  ### Output Format
  - Output **only** valid JSON — no extra commentary or text.  
  - Example format:
    \`\`\`json
    {
      "name": "Example",
      "url": "https://example.com",
      "description": "Example is a platform that helps users do X, Y, and Z."
    }
  
  
  ### Example
  input: supabase
  
  output:
    \`\`\`json
  {
    "name": "Supabase",
    "url": "https://supabase.com",
    "description": "Supabase is an open-source backend-as-a-service platform that provides developers with a PostgreSQL database, authentication, real-time synchronization, file storage, and auto-generated APIs. It’s often used as an open alternative to Firebase."
  }
  `,
      },
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
