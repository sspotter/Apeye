# 🧠 Prompt: Integrate AI Assistant System into API Key Manager

## 🎯 Goal
Integrate a **context-aware AI Assistant Chat Bubble** into the API Key Manager & Resource Organizer website.  
This assistant uses **Gemini AI** with a comprehensive system prompt to help users:
- Generate API integration code snippets
- Understand their stored API services
- Get best practices for API security
- Organize and document their API keys
- Get contextual help based on the current page/service

---

## 🏗️ Project Context

**Project Name:** API Key Manager & Resource Organizer  
**Actual Tech Stack:**
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Custom theme system
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **AI:** Google Gemini API (via `gem_aiassistante.ts`)
- **Routing:** React Router DOM v6
- **State:** React Context API

**Current Architecture:**
```
src/
├── components/
│   ├── ApiKeysTable.tsx       # Main API keys table
│   ├── ServiceOverview.tsx    # Service grid view
│   ├── WebsitePage.tsx        # Individual service pages
│   ├── MarkdownNotesSection.tsx  # Service documentation
│   └── ...
├── contexts/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── lib/
│   ├── supabase.ts
│   ├── gemini.ts              # Resource organizer AI
│   └── gem_aiassistante.ts    # ⭐ AI Assistant (needs integration)
└── App.tsx
```

**Page Structure:**
- `/` - Dashboard (Service overview grid)
- `/api-keys/:serviceName` - Individual service page (e.g., `/api-keys/OpenAI`)
- `/websites` - Resource organizer
- `/settings` - User settings + theme customization

---

## 🧩 Implementation Tasks

### 1. Create the Floating AI Assistant Component

**Component:** `src/components/AIAssistantBubble.tsx`

**Features:**
- **Fixed Position:** Bottom-right corner (`fixed bottom-6 right-6 z-50`)
- **Bubble Button:**
  - Circular gradient button (purple-blue gradient)
  - Sparkles/AI icon from `lucide-react`
  - Pulse animation when idle
  - Badge showing "AI" or robot emoji 🤖
  
- **Chat Window:**
  - Slides up from bottom-right when opened
  - Width: 400px desktop, full-width mobile
  - Height: 600px max
  - Rounded corners with shadow
  - Theme-aware (adapts to light/dark/custom themes)
  
- **UI Structure:**
  ```tsx
  <ChatWindow>
    <Header>
      - "AI Assistant" title
      - Service context badge (e.g., "OpenAI")
      - Minimize/close button
    </Header>
    
    <MessageArea>
      - Scrollable message list
      - User messages (right-aligned, blue)
      - AI messages (left-aligned, gradient)
      - Typing indicator
      - Code blocks with copy button
      - Markdown rendering
    </MessageArea>
    
    <InputArea>
      - Text input with placeholder
      - Send button (paper plane icon)
      - Quick action buttons:
        * "Generate Code"
        * "Best Practices"
        * "Explain API"
    </InputArea>
  </ChatWindow>
  ```

**Animations:**
- Smooth slide-up/down transition
- Fade in/out overlay
- Typing indicator animation
- Message appear animation

---

### 2. Create AI Assistant Service Module

**File:** `src/lib/aiAssistant.ts`

**Purpose:** Extend `gem_aiassistante.ts` to support chat conversations

**New Functions:**

```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ServiceContext {
  serviceName?: string;
  category?: string;
  apiCount?: number;
  notes?: string;
  currentPage: string;
  userIntent?: 'code' | 'docs' | 'help' | 'organize';
}

/**
 * Send a chat message to AI Assistant with service context
 */
export async function sendChatMessage(
  message: string,
  context: ServiceContext,
  conversationHistory: ChatMessage[]
): Promise<AsyncIterable<string>>;

/**
 * Generate code snippet for specific API service
 */
export async function generateAPICode(
  serviceName: string,
  language: 'javascript' | 'python' | 'typescript',
  useCase?: string
): Promise<string>;

/**
 * Get best practices for API service
 */
export async function getAPIBestPractices(
  serviceName: string
): Promise<string>;
```

---

### 3. Enhanced System Prompt

**Improve the system prompt in `gem_aiassistante.ts`:**

```typescript
systemInstruction: `# 🧠 AI Assistant for API Key Manager

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

## Context You Receive

You'll receive JSON context like:
\`\`\`json
{
  "currentPage": "/api-keys/OpenAI",
  "serviceName": "OpenAI",
  "category": "AI / NLP",
  "apiCount": 3,
  "notes": "Used for GPT-4 text generation",
  "userIntent": "code"
}
\`\`\`

## Capabilities by Intent

### 1. Code Generation (\`userIntent: "code"\`)
When user asks: "How do I use this API?" or "Generate code"

**Provide:**
- Working code snippet (JavaScript/Python/TypeScript)
- Installation commands
- Environment variable setup
- Error handling
- Rate limiting considerations

**Example:**
\`\`\`typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

### 2. Documentation (\`userIntent: "docs"\`)
When user asks: "What is this API?" or "Explain"

**Provide:**
- Service overview
- Common use cases
- Pricing/rate limits
- Authentication methods
- Popular endpoints

### 3. Best Practices (\`userIntent: "help"\`)
When user asks: "How should I organize?" or "Security tips"

**Provide:**
- Key rotation strategies
- Environment variable setup
- Error handling patterns
- Testing approaches
- Monitoring suggestions

### 4. Organization (\`userIntent: "organize"\`)
When user asks: "How should I label?" or "Best way to organize"

**Provide:**
- Naming conventions
- Tag suggestions
- Categorization tips
- Note-taking best practices

## Response Style

✅ **DO:**
- Be concise and developer-friendly
- Use code blocks with language hints
- Provide copy-paste-ready snippets
- Include comments in code
- Reference official docs when helpful
- Use bullet points for clarity

❌ **DON'T:**
- Write long paragraphs
- Use corporate jargon
- Over-explain basics
- Be overly cautious (we know they're developers)

## Code Block Format

Always use proper markdown:
\`\`\`javascript
// Your code here
\`\`\`

## Quick Actions

When user clicks quick buttons:
- **"Generate Code"** → Auto-generate integration code for current service
- **"Best Practices"** → Security & organization tips
- **"Explain API"** → Service overview & use cases

## Context Awareness

Use the provided context:
- If \`serviceName === "OpenAI"\` → Focus on GPT, embeddings, chat
- If \`serviceName === "Stripe"\` → Focus on payments, webhooks, testing
- If \`serviceName === "AWS"\` → Focus on credentials, SDK, regions
- If \`currentPage === "/websites"\` → Help with resource organization

## Example Conversations

**User:** "How do I use OpenAI?"
**You:** 
\`\`\`typescript
// Install the package
npm install openai

// Setup client
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate text
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello!" }]
});
\`\`\`

**User:** "Best practices for API keys?"
**You:**
🔒 **Security Best Practices:**
- Store keys in \`.env\` file (never commit!)
- Use different keys for dev/staging/prod
- Rotate keys every 90 days
- Set up key expiration alerts
- Use environment-specific key scopes
- Monitor API usage for anomalies

**User:** "What's this API for?"
**You:** [Provide service-specific overview based on serviceName]

---

Remember: You're a helpful coding assistant, not a security guard. Be practical, give working code, and trust that developers know how to handle credentials responsibly.
\`