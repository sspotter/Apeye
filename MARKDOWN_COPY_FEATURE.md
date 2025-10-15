# Markdown Copy Feature - User Guide

## 🎯 Overview

All code in the markdown documentation is now **copyable** with visual feedback!

## ✨ Features

### 1. **Code Blocks with Copy Button**

When you hover over a code block, a "Copy" button appears in the top-right corner.

**Example Markdown:**
````markdown
```javascript
const apiKey = 'sk-proj-xxxxx';
const client = new OpenAI({ apiKey });
```
````

**What You See:**
```
┌──────────────────────────────────────┐
│                      [Copy] ← Button │
│ const apiKey = 'sk-proj-xxxxx';      │
│ const client = new OpenAI({ apiKey });│
└──────────────────────────────────────┘
```

**How It Works:**
- Hover over the code block
- "Copy" button fades in (top-right)
- Click button → Code copied!
- Button shows "Copied!" with checkmark
- Toast notification: "Code copied to clipboard! 📋"

### 2. **Inline Code Click to Copy**

Inline code snippets are clickable - just click to copy!

**Example Markdown:**
```markdown
Set your API key: `sk-proj-xxxxxxxxxxxxx`
```

**What You See:**
```
Set your API key: [sk-proj-xxxxxxxxxxxxx] ← Clickable
                   └─ cursor: pointer
```

**How It Works:**
- Click any inline code (gray background)
- Code instantly copied!
- Blue ring appears on hover
- Toast notification: "Copied! 📋"

---

## 🎨 Visual Design

### Code Block Copy Button

**Default State:**
```
Opacity: 0 (invisible)
Background: slate-700
```

**Hover State:**
```
Opacity: 100 (visible)
Background: slate-600
Transition: smooth fade-in
```

**Copied State:**
```
Icon: Check ✓
Text: "Copied!"
Duration: 2 seconds
```

### Inline Code

**Default State:**
```
Background: theme-bg-tertiary
Cursor: pointer
Border: none
```

**Hover State:**
```
Ring: 2px blue-500
Transition: all smooth
Title: "Click to copy"
```

**Clicked State:**
```
Toast: "Copied! 📋"
Duration: 1.5 seconds
```

---

## 📝 Example Use Cases

### Use Case 1: API Configuration

**Markdown:**
````markdown
# OpenAI Setup

Set your environment variable:
```bash
export OPENAI_API_KEY="sk-proj-xxxxx"
```

Or in your `.env` file: `OPENAI_API_KEY=sk-proj-xxxxx`
````

**User Experience:**
1. Hover over bash code block → Copy button appears
2. Click "Copy" → Entire export command copied
3. Click the inline `.env` code → Just the value copied

### Use Case 2: Multiple Code Snippets

**Markdown:**
````markdown
# API Integration

## Install package
```bash
npm install openai
```

## Initialize client
```javascript
import OpenAI from 'openai';
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
```

Use model: `gpt-4` or `gpt-3.5-turbo`
````

**User Experience:**
- Each code block has its own copy button
- Each inline code is independently copyable
- No interference between multiple blocks

---

## 🔧 Technical Implementation

### CodeBlock Component

```typescript
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative group">
      <button 
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre><code>{code}</code></pre>
    </div>
  );
}
```

### InlineCode Component

```typescript
function InlineCode({ code }) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    toast.success('Copied!');
  };
  
  return (
    <code 
      onClick={handleCopy}
      className="cursor-pointer hover:ring-2"
      title="Click to copy"
    >
      {code}
    </code>
  );
}
```

---

## 🎯 Supported Languages

Code blocks support language hints for better organization:

```markdown
```javascript
const x = 1;
```

```python
x = 1
```

```bash
echo "hello"
```

```typescript
const x: number = 1;
```

```json
{ "key": "value" }
```

```sql
SELECT * FROM users;
```

```html
<div>Hello</div>
```

```css
.class { color: red; }
```
```

All languages are copyable with the same copy button!

---

## 📋 Copy Behavior

### What Gets Copied

**Code Blocks:**
- Entire code block content
- All lines included
- Preserves formatting and indentation
- Excludes language hint line (e.g., `javascript`)

**Inline Code:**
- Exact text between backticks
- Single line only
- No additional whitespace

### Clipboard API

```javascript
navigator.clipboard.writeText(code)
```

**Fallback:**
If clipboard API fails, toast shows error:
```
"Failed to copy code" ❌
```

---

## 🎨 Theme Integration

### Dark Theme
```
Code block background: slate-800
Copy button: slate-700 → slate-600 on hover
Button text: white
```

### Light Theme
```
Code block background: slate-100
Copy button: slate-700 → slate-600 on hover
Button text: white
```

### Emerald Theme
```
Code block background: emerald-50
Copy button: slate-700 → slate-600 on hover
Button text: white
```

**Copy button maintains consistent style across all themes!**

---

## ✅ Benefits

### For Users:
- ✅ **No manual selection** - One click copies
- ✅ **Visual feedback** - Know when copied
- ✅ **Fast workflow** - No right-click needed
- ✅ **Mobile friendly** - Works on touch devices

### For Documentation:
- ✅ **Better UX** - Professional feel
- ✅ **Reduced errors** - Exact copy, no typos
- ✅ **Faster learning** - Quick code testing
- ✅ **Improved adoption** - Easy to use examples

---

## 🚀 Usage Tips

### Writing Good Documentation

**Include working examples:**
````markdown
```javascript
// ✅ Good - Complete, runnable code
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const response = await client.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello!" }]
});
```
````

**Use inline code for values:**
```markdown
Set the model to `gpt-4` for best results
```

**Highlight important snippets:**
```markdown
The API key must start with `sk-`
```

---

## 🎯 Testing

### Test Code Block Copy:
1. Add a code block in markdown
2. Hover over it
3. Verify "Copy" button appears
4. Click button
5. Check toast notification
6. Paste somewhere to verify

### Test Inline Code Copy:
1. Add inline code: `test`
2. Hover over it
3. Verify cursor changes to pointer
4. Click it
5. Check toast notification
6. Paste to verify

---

**Status:** ✅ Fully implemented and working!

All markdown code is now copyable with beautiful UI feedback! 🎉
