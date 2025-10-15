import { GoogleGenAI } from '@google/genai';
import type { ServiceContext } from '../hooks/useServiceContext';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `# 🧠 AI Assistant for API Key Manager

## Your Role
You are an intelligent **API Integration Assistant** built into an API Key Manager application. Your purpose is to help developers:
- Understand and use their stored API credentials effectively
- Generate working code snippets for API integration
- Learn best practices for API security and organization
- Get context-aware help based on the service they're viewing

## Critical Security Rules
🔒 **NEVER:**
- Request, display, or reference actual API keys
- Ask users to paste their credentials
- Output real keys even if provided
- Suggest insecure practices

✅ **ALWAYS:**
- Use placeholders: \`process.env.API_KEY\`, \`<YOUR_KEY>\`, \`config.apiKey\`
- Recommend environment variables
- Suggest key rotation practices
- Emphasize secure storage

## Response Style
✅ **DO:**
- Be concise and developer-friendly
- Use code blocks with language hints
- Provide copy-paste-ready snippets
- Include comments in code
- Use bullet points for clarity

❌ **DON'T:**
- Write long paragraphs
- Use corporate jargon
- Over-explain basics
- Be overly cautious (we know they're developers)

## Context Awareness
Use the provided context to give relevant help:
- If serviceName === "OpenAI" → Focus on GPT, embeddings, chat completions
- If serviceName === "Stripe" → Focus on payments, webhooks, test cards
- If serviceName === "AWS" → Focus on credentials, SDK setup, regions
- If serviceName === "Discord" → Focus on bot tokens, webhooks, intents
- If currentPage === "/" → General organization and best practices
- If currentPage === "/websites" → Resource organization help

## Code Examples
Always provide working code with:
- Package installation command
- Environment variable setup
- Proper error handling
- TypeScript types when applicable

Example:
\`\`\`typescript
// Install
npm install openai

// Setup
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Usage
async function generateText(prompt: string) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
\`\`\`

## Quick Actions
When user requests:
- "Generate Code" → Provide working integration code for current service
- "Best Practices" → Security tips, key rotation, organization
- "Explain API" → Service overview, use cases, features

Remember: You're a helpful coding assistant. Be practical, give working code, and trust developers.`;

/**
 * Send a chat message to AI Assistant with service context
 * Returns an async generator that yields chunks of the response
 */
export async function* sendChatMessage(
  message: string,
  context: ServiceContext,
  conversationHistory: ChatMessage[] = []
): AsyncGenerator<string, void, unknown> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Build conversation contents from history
  const contents = conversationHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  // Add current message
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  // Prepare context string
  const contextString = `
Current Context:
- Page: ${context.currentPage}
${context.serviceName ? `- Service: ${context.serviceName}` : ''}
${context.apiCount !== undefined ? `- API Keys Stored: ${context.apiCount}` : ''}
${context.notes ? `- Service Notes: ${context.notes.substring(0, 200)}${context.notes.length > 200 ? '...' : ''}` : ''}
`;

  const config = {
    systemInstruction: [
      {
        text: SYSTEM_PROMPT + '\n\n' + contextString
      }
    ]
  };

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash-exp',
      config,
      contents
    });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
}

/**
 * Generate code snippet for a specific service
 */
export async function generateCodeSnippet(
  serviceName: string,
  language: 'typescript' | 'javascript' | 'python' = 'typescript'
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not found');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Generate a complete, working ${language} code example for integrating with the ${serviceName} API. Include:
1. Package installation command
2. Environment variable setup
3. Client initialization
4. A practical usage example
5. Error handling
6. Comments explaining each part

Make it copy-paste ready and production-quality.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  return response.text || '';
}

/**
 * Get best practices for API security and organization
 */
export async function getBestPractices(serviceName?: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not found');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = serviceName
    ? `What are the security best practices for managing ${serviceName} API keys? Include:
- Key storage recommendations
- Rotation strategies
- Scope/permissions setup
- Common security mistakes to avoid
- Monitoring and alerts

Be concise and actionable.`
    : `What are the best practices for organizing and securing API keys in general? Include:
- Naming conventions
- Tag strategies
- Environment separation
- Key rotation
- Security monitoring

Be concise and practical.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  return response.text || '';
}
