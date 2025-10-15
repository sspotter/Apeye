# 🧠 AI Assistant Integration - Complete Implementation Guide

## Part 4: Implementation Steps

### Step 1: Add Dependencies

```bash
npm install @google/genai
# Already have: lucide-react, react-router-dom, react-hot-toast
```

### Step 2: Create AIAssistantBubble Component

**File:** `src/components/AIAssistantBubble.tsx`

### Step 3: Create Context-Aware Hook

**File:** `src/hooks/useServiceContext.ts`

```typescript
import { useLocation, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ServiceContext {
  serviceName?: string;
  category?: string;
  apiCount?: number;
  notes?: string;
  currentPage: string;
}

export function useServiceContext(): ServiceContext {
  const location = useLocation();
  const { serviceName } = useParams<{ serviceName: string }>();
  const [context, setContext] = useState<ServiceContext>({
    currentPage: location.pathname
  });

  useEffect(() => {
    async function fetchContext() {
      if (serviceName) {
        // Fetch API key count and notes for this service
        const { data } = await supabase
          .from('api_keys')
          .select('*')
          .eq('service_name', decodeURIComponent(serviceName));

        if (data) {
          setContext({
            serviceName: decodeURIComponent(serviceName),
            apiCount: data.length,
            notes: data[0]?.notes || '',
            currentPage: location.pathname
          });
        }
      }
    }

    fetchContext();
  }, [serviceName, location.pathname]);

  return context;
}
```

### Step 4: Update gem_aiassistante.ts

Add chat support to existing `gem_aiassistante.ts`:

```typescript
// Add to existing file
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ServiceContext {
  serviceName?: string;
  category?: string;
  apiCount?: number;
  notes?: string;
  currentPage: string;
  userIntent?: 'code' | 'docs' | 'help' | 'organize';
}

export async function* sendChatMessage(
  message: string,
  context: ServiceContext,
  conversationHistory: ChatMessage[] = []
): AsyncGenerator<string, void, unknown> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key not found');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Build conversation contents
  const contents = conversationHistory.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));

  // Add current message
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const config = {
    systemInstruction: [
      {
        text: `[Enhanced system prompt from the markdown above]
        
Context for this conversation:
${JSON.stringify(context, null, 2)}`
      }
    ],
    tools: [
      { urlContext: {} },
      { googleSearch: {} }
    ]
  };

  const response = await ai.models.generateContentStream({
    model: 'gemini-flash-latest',
    config,
    contents
  });

  for await (const chunk of response) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
```

---

## Part 5: UI/UX Specifications

### Color Scheme
- **Bubble Button:** Gradient `from-purple-600 to-blue-600`
- **User Messages:** Blue `bg-blue-500 text-white`
- **AI Messages:** Gradient `from-purple-50 to-blue-50` (light) / `from-purple-900 to-blue-900` (dark)
- **Code Blocks:** Theme-aware with copy button (reuse from MarkdownNotesSection)

### Animations
```css
/* Bubble pulse animation */
@keyframes pulse-ai {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Chat window slide */
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

### Responsive Design
- **Desktop:** Fixed width 400px, height 600px
- **Tablet:** Width 380px, height 500px
- **Mobile:** Full width, height 80vh

---

## Part 6: Quick Action Buttons

### Button Configurations

```typescript
const quickActions = [
  {
    id: 'code',
    label: 'Generate Code',
    icon: Code,
    prompt: `Generate a working code snippet showing how to use the ${serviceName} API in TypeScript. Include:
- Package installation
- Environment variable setup
- Basic usage example
- Error handling`
  },
  {
    id: 'practices',
    label: 'Best Practices',
    icon: Shield,
    prompt: `What are the security best practices for using ${serviceName} API keys?`
  },
  {
    id: 'explain',
    label: 'Explain API',
    icon: Info,
    prompt: `Explain what ${serviceName} is, what it's used for, and its main features.`
  }
];
```

---

## Part 7: Integration Points

### Add to App.tsx or Layout

```tsx
import { AIAssistantBubble } from './components/AIAssistantBubble';

function App() {
  return (
    <>
      {/* Existing routes and components */}
      <Routes>...</Routes>
      
      {/* AI Assistant available on all pages */}
      <AIAssistantBubble />
    </>
  );
}
```

### Add to Individual Service Pages

The assistant automatically detects context via `useServiceContext()` hook.

On `/api-keys/OpenAI` → Context includes:
- serviceName: "OpenAI"
- apiCount: 3
- currentPage: "/api-keys/OpenAI"

---

## Part 8: Features Checklist

### Core Features
- [ ] Floating bubble button (bottom-right)
- [ ] Click to open chat window
- [ ] Context-aware responses
- [ ] Streaming AI responses
- [ ] Message history
- [ ] Markdown rendering
- [ ] Code block with copy button
- [ ] Quick action buttons
- [ ] Theme-aware styling
- [ ] Mobile responsive
- [ ] Smooth animations

### Advanced Features
- [ ] Conversation history persistence (localStorage)
- [ ] Clear conversation button
- [ ] Minimize (not close) option
- [ ] Typing indicator
- [ ] Error handling
- [ ] Rate limiting UI
- [ ] Export conversation
- [ ] Voice input (future)
- [ ] Share conversation (future)

---

## Part 9: Example Conversation Flow

### Scenario 1: User on OpenAI Service Page

**User Context:**
```json
{
  "serviceName": "OpenAI",
  "apiCount": 3,
  "currentPage": "/api-keys/OpenAI"
}
```

**User:** "How do I use this?"

**AI Response:**
````markdown
Here's how to use OpenAI API in TypeScript:

```typescript
npm install openai

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function chat(message: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: message }]
  });
  
  return response.choices[0].message.content;
}
```

💡 **Tip:** Store your API key in `.env`:
```
OPENAI_API_KEY=sk-proj-...
```
````

---

### Scenario 2: User on Dashboard

**User Context:**
```json
{
  "currentPage": "/",
  "serviceName": null
}
```

**User:** "How should I organize my API keys?"

**AI Response:**
```markdown
🗂️ **API Key Organization Best Practices:**

**1. Naming Convention:**
- Use descriptive names: `prod_stripe_payments`, `dev_openai_gpt4`
- Include environment prefix: `prod_`, `dev_`, `staging_`

**2. Tags:**
- Environment tags: `production`, `development`, `test`
- Category tags: `ai`, `payments`, `auth`, `database`
- Priority tags: `critical`, `standard`, `experimental`

**3. Notes:**
- Document what the key is for
- Add expiration dates
- Link to related services

**4. Security:**
- Rotate keys every 90 days
- Use separate keys for each environment
- Never share keys across services
```

---

## Part 10: Testing Plan

### Manual Testing

1. **Bubble Button:**
   - [ ] Appears on all pages
   - [ ] Pulse animation works
   - [ ] Click opens chat
   - [ ] Click outside closes chat

2. **Context Detection:**
   - [ ] On `/api-keys/OpenAI` → Detects "OpenAI"
   - [ ] On `/` → No service context
   - [ ] On `/websites` → Resource context

3. **Message Flow:**
   - [ ] User sends message
   - [ ] AI response streams in
   - [ ] Code blocks render correctly
   - [ ] Copy button works
   - [ ] Markdown renders properly

4. **Quick Actions:**
   - [ ] "Generate Code" → Generates working code
   - [ ] "Best Practices" → Security tips
   - [ ] "Explain API" → Service overview

5. **Theme Compatibility:**
   - [ ] Light theme → Clean and readable
   - [ ] Dark theme → Properly inverted
   - [ ] Emerald theme → Green accents
   - [ ] Custom theme → Uses custom colors

6. **Responsive:**
   - [ ] Desktop → 400px width
   - [ ] Tablet → 380px width
   - [ ] Mobile → Full width

---

## Part 11: Performance Considerations

### Optimization Strategies

1. **Lazy Loading:**
   ```tsx
   const AIAssistantBubble = lazy(() => import('./components/AIAssistantBubble'));
   ```

2. **Debounce Input:**
   - Wait 500ms after user stops typing before showing "generating" state

3. **Stream Responses:**
   - Show partial responses as they arrive
   - Better perceived performance

4. **Cache Responses:**
   - Cache common queries in sessionStorage
   - Reduce API calls for repeated questions

5. **Rate Limiting:**
   - Max 10 messages per minute
   - Show friendly error if limit exceeded

---

## Part 12: Error Handling

### Error Scenarios

```typescript
// API key not found
if (!apiKey) {
  showError("AI Assistant unavailable. Please configure Gemini API key.");
}

// Network error
catch (error) {
  if (error.code === 'ECONNREFUSED') {
    showError("Connection error. Please check your internet.");
  }
}

// Rate limit
if (response.status === 429) {
  showError("Too many requests. Please wait a moment.");
}

// Invalid response
if (!response.text) {
  showError("AI response was empty. Please try again.");
}
```

---

## Part 13: Future Enhancements

### Phase 2 Features
- [ ] **Conversation History** - Store in Supabase
- [ ] **Favorites** - Save useful responses
- [ ] **Share** - Export conversation as markdown
- [ ] **Voice Input** - Speech-to-text
- [ ] **Multi-language** - Support i18n
- [ ] **Suggested Questions** - Based on context
- [ ] **Code Execution** - Run snippets in sandbox
- [ ] **Integration Testing** - Test API keys

### Phase 3 Features
- [ ] **Team Sharing** - Share conversations with team
- [ ] **Analytics** - Track popular questions
- [ ] **Custom Prompts** - User-defined shortcuts
- [ ] **Plugin System** - Extend capabilities
- [ ] **Offline Mode** - Cached responses
- [ ] **API Playground** - Test API calls directly

---

## ✅ Implementation Status

### Ready to Build:
1. ✅ System prompt defined
2. ✅ gem_aiassistante.ts exists
3. ✅ Tech stack compatible
4. ✅ UI/UX designed
5. ✅ Context detection planned

### Next Steps:
1. Create `AIAssistantBubble.tsx`
2. Create `useServiceContext.ts` hook
3. Update `gem_aiassistante.ts` with chat support
4. Add to `App.tsx`
5. Test and iterate

---

**Ready to start implementation! 🚀**
