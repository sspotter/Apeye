import { GoogleGenAI } from '@google/genai';

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
        text: `Role:
You are an expert product analyst who provides clear, factual, and concise explanations of what a company, product, or website does.

Goal:
When given the name of a website or product, return a short descriptive paragraph (2–4 sentences) explaining what it is, who made it (if known), and what it's used for.

Instructions:

Keep the tone neutral, professional, and informative.

Focus on what it does, its main features, and its purpose.

Do not include marketing slogans or speculation.

If you're unsure, give your best factual summary.

Keep the length around 2–4 lines max.

The name should appear at the start of the description.

Examples:

Input: supabase
Output: Supabase is an open-source backend-as-a-service platform that provides developers with a PostgreSQL database, authentication, real-time data synchronization, file storage, and auto-generated APIs. It's often used as an open alternative to Firebase.

Input: claude ai
Output: Claude AI (or "Claude") is a family of generative AI models developed by Anthropic. It's designed for natural language understanding and generation, helping users with writing, summarization, reasoning, code generation, and more.

Input: vercel
Output: Vercel is a cloud platform for deploying and hosting web applications, especially Next.js projects. It provides automatic builds, global CDN distribution, and developer-friendly tools for fast and scalable frontend deployment.

Input: figma
Output: Figma is a collaborative interface design tool used by designers to create, prototype, and share UI/UX projects in real time. It's browser-based and supports live collaboration between team members.`,
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
