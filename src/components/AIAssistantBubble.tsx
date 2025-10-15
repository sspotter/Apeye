import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Code, Shield, Info, Minimize2 } from 'lucide-react';
import { useServiceContext } from '../hooks/useServiceContext';
import { sendChatMessage, type ChatMessage } from '../lib/aiAssistantChat';
import toast from 'react-hot-toast';

export function AIAssistantBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const context = useServiceContext();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create AI message that will be updated with chunks
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Stream response
      let fullResponse = '';
      for await (const chunk of sendChatMessage(textToSend, context, messages)) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            ...aiMessage,
            content: fullResponse
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error('AI Assistant error:', error);
      toast.error('Failed to get AI response. Please try again.', {
        icon: '❌',
      });
      // Remove the empty AI message
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: 'code' | 'practices' | 'explain') => {
    setIsLoading(true);
    try {
      let prompt = '';
      
      switch (action) {
        case 'code':
          if (context.serviceName) {
            prompt = `Generate a working code example for integrating with ${context.serviceName} API in TypeScript. Include installation, setup, and usage.`;
          } else {
            prompt = 'Show me a general example of how to securely manage API keys in a TypeScript project.';
          }
          break;
        
        case 'practices':
          prompt = context.serviceName
            ? `What are the security best practices for managing ${context.serviceName} API keys?`
            : 'What are the best practices for organizing and securing API keys?';
          break;
        
        case 'explain':
          if (context.serviceName) {
            prompt = `Explain what ${context.serviceName} is, what it's used for, and its main features.`;
          } else {
            prompt = 'How should I organize my API keys effectively?';
          }
          break;
      }

      await handleSendMessage(prompt);
    } catch (error) {
      console.error('Quick action error:', error);
      toast.error('Failed to execute action');
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied!', {
        icon: '📋',
        duration: 2000,
      });
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  // Render markdown-like content (basic implementation)
  const renderMessageContent = (content: string) => {
    const parts: JSX.Element[] = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const text = content.substring(lastIndex, match.index);
        parts.push(
          <p key={`text-${lastIndex}`} className="whitespace-pre-wrap theme-text-secondary mb-2">
            {text}
          </p>
        );
      }

      // Add code block
      const language = match[1] || 'plaintext';
      const code = match[2].trim();
      parts.push(
        <div key={`code-${match.index}`} className="relative group my-3">
          <div className="absolute right-2 top-2 z-10">
            <button
              onClick={() => copyCode(code)}
              className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Copy
            </button>
          </div>
          <pre className="theme-bg-tertiary theme-border border rounded-lg p-4 pr-20 overflow-x-auto">
            <code className={`text-sm font-mono theme-text-primary language-${language}`}>
              {code}
            </code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      const text = content.substring(lastIndex);
      parts.push(
        <p key={`text-${lastIndex}`} className="whitespace-pre-wrap theme-text-secondary">
          {text}
        </p>
      );
    }

    return parts.length > 0 ? <div>{parts}</div> : <p className="whitespace-pre-wrap theme-text-secondary">{content}</p>;
  };

  return (
    <>
      {/* Floating Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center group animate-pulse hover:animate-none"
          title="AI Assistant"
        >
          <Sparkles className="w-7 h-7 text-white" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-xs">
            🤖
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-full max-w-md theme-bg-secondary theme-border border-2 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${
            isMinimized ? 'h-16' : 'h-[600px]'
          } sm:w-[400px]`}
          style={{
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 theme-bg-tertiary theme-border border-b flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold theme-text-primary text-sm">AI Assistant</h3>
                {context.serviceName && (
                  <span className="text-xs theme-text-tertiary">{context.serviceName}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:theme-bg-primary rounded-lg transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minimize2 className="w-4 h-4 theme-text-secondary" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:theme-bg-primary rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 theme-text-secondary" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 theme-text-tertiary mx-auto mb-3 opacity-50" />
                    <p className="theme-text-secondary text-sm mb-2">
                      Hi! I'm your AI assistant.
                    </p>
                    <p className="theme-text-tertiary text-xs">
                      Ask me about API integration, security, or organization.
                    </p>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'theme-bg-tertiary theme-text-primary rounded-bl-none'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="text-sm">{renderMessageContent(msg.content)}</div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex justify-start">
                    <div className="theme-bg-tertiary rounded-2xl rounded-bl-none px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {messages.length === 0 && (
                <div className="px-4 py-2 theme-border border-t">
                  <p className="text-xs theme-text-tertiary mb-2">Quick Actions:</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleQuickAction('code')}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs theme-bg-tertiary hover:theme-bg-primary theme-text-secondary rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Code className="w-3.5 h-3.5" />
                      Generate Code
                    </button>
                    <button
                      onClick={() => handleQuickAction('practices')}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs theme-bg-tertiary hover:theme-bg-primary theme-text-secondary rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Best Practices
                    </button>
                    <button
                      onClick={() => handleQuickAction('explain')}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs theme-bg-tertiary hover:theme-bg-primary theme-text-secondary rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Info className="w-3.5 h-3.5" />
                      Explain API
                    </button>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 theme-border border-t">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 theme-bg-primary theme-border border rounded-xl theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim() || isLoading}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
