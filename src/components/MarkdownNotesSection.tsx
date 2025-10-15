import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronDown, ChevronRight, Edit, Save, Upload, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface MarkdownNotesSectionProps {
  serviceName: string;
}

export function MarkdownNotesSection({ serviceName }: MarkdownNotesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [noteId, setNoteId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [serviceName]);

  const fetchNotes = async () => {
    setLoading(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { data, error } = await supabase
      .from('service_notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('service_name', serviceName)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine
      console.error('Error fetching notes:', error);
    } else if (data) {
      setContent(data.markdown_content || '');
      setOriginalContent(data.markdown_content || '');
      setNoteId(data.id);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      toast.error('You must be logged in to save notes');
      setSaving(false);
      return;
    }

    try {
      if (noteId) {
        // Update existing note
        const { error } = await supabase
          .from('service_notes')
          .update({ markdown_content: content })
          .eq('id', noteId);

        if (error) throw error;
      } else {
        // Create new note
        const { data, error } = await supabase
          .from('service_notes')
          .insert({
            user_id: user.id,
            service_name: serviceName,
            markdown_content: content
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setNoteId(data.id);
      }

      setOriginalContent(content);
      setIsEditing(false);
      toast.success('Notes saved successfully!', {
        icon: '💾',
        style: {
          border: '2px solid #10b981',
          padding: '16px',
          color: '#10b981',
        },
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes', {
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#ef4444',
        },
      });
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setContent(originalContent);
    setIsEditing(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      toast.error('Please upload a markdown file (.md or .markdown)', {
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#ef4444',
        },
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setContent(text);
      setIsEditing(true);
    };
    reader.readAsText(file);
  };

  // Simple markdown to HTML converter (basic implementation)
  const renderMarkdown = (markdown: string) => {
    if (!markdown) {
      return (
        <div className="text-center py-8 theme-text-tertiary">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No documentation yet</p>
          <p className="text-sm mt-1">Click "Edit" to add notes, code snippets, or upload a markdown file</p>
        </div>
      );
    }

    // Split by lines and process
    const lines = markdown.split('\n');
    const elements: JSX.Element[] = [];
    
    lines.forEach((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        elements.push(<h3 key={index} className="text-lg font-semibold theme-text-primary mt-4 mb-2">{line.substring(4)}</h3>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={index} className="text-xl font-bold theme-text-primary mt-5 mb-2">{line.substring(3)}</h2>);
      } else if (line.startsWith('# ')) {
        elements.push(<h1 key={index} className="text-2xl font-bold theme-text-primary mt-6 mb-3">{line.substring(2)}</h1>);
      }
      // Code blocks
      else if (line.startsWith('```')) {
        const language = line.substring(3);
        const codeLines: string[] = [];
        let i = index + 1;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
          <pre key={index} className="theme-bg-tertiary theme-border border rounded-lg p-4 my-3 overflow-x-auto">
            <code className={`text-sm font-mono theme-text-primary language-${language}`}>
              {codeLines.join('\n')}
            </code>
          </pre>
        );
      }
      // Inline code
      else if (line.includes('`') && !line.startsWith('```')) {
        const parts = line.split('`');
        const formatted = parts.map((part, i) => 
          i % 2 === 0 
            ? part 
            : <code key={i} className="px-1.5 py-0.5 theme-bg-tertiary theme-text-primary rounded text-sm font-mono">{part}</code>
        );
        elements.push(<p key={index} className="theme-text-secondary mb-2">{formatted}</p>);
      }
      // Lists
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(
          <li key={index} className="theme-text-secondary ml-6 mb-1">
            {line.trim().substring(2)}
          </li>
        );
      }
      // Bold
      else if (line.includes('**')) {
        const parts = line.split('**');
        const formatted = parts.map((part, i) => 
          i % 2 === 0 
            ? part 
            : <strong key={i} className="font-semibold theme-text-primary">{part}</strong>
        );
        elements.push(<p key={index} className="theme-text-secondary mb-2">{formatted}</p>);
      }
      // Regular paragraph
      else if (line.trim()) {
        elements.push(<p key={index} className="theme-text-secondary mb-2">{line}</p>);
      }
      // Empty line
      else {
        elements.push(<div key={index} className="h-2"></div>);
      }
    });

    return <div className="markdown-content">{elements}</div>;
  };

  const hasContent = content.trim().length > 0;

  return (
    <div className="mb-6">
      <div className="theme-bg-secondary theme-border border rounded-xl overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:theme-bg-tertiary transition-colors"
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 theme-text-tertiary" />
            ) : (
              <ChevronRight className="w-5 h-5 theme-text-tertiary" />
            )}
            <FileText className="w-5 h-5 theme-text-secondary" />
            <div className="text-left">
              <h3 className="font-semibold theme-text-primary">
                Service Documentation & Notes
              </h3>
              <p className="text-xs theme-text-tertiary mt-0.5">
                {hasContent 
                  ? 'Add code snippets, integration notes, and documentation' 
                  : 'No documentation yet - Click to add'}
              </p>
            </div>
          </div>
          
          {!isExpanded && hasContent && (
            <span className="text-xs theme-text-tertiary px-2 py-1 theme-bg-tertiary rounded">
              {content.split('\n').length} lines
            </span>
          )}
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="border-t theme-border">
            {/* Action Buttons */}
            <div className="px-6 py-3 theme-bg-tertiary theme-border border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm theme-text-secondary hover:theme-text-primary hover:theme-bg-primary rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm theme-text-secondary hover:theme-text-primary hover:theme-bg-primary rounded-lg transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}
                
                <label className="flex items-center gap-2 px-3 py-1.5 text-sm theme-text-secondary hover:theme-text-primary hover:theme-bg-primary rounded-lg transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Upload .md
                  <input
                    type="file"
                    accept=".md,.markdown"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {isEditing && (
                <span className="text-xs theme-text-tertiary">
                  Markdown supported
                </span>
              )}
            </div>

            {/* Editor or Viewer */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : isEditing ? (
                <div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="# API Documentation

Write your notes here using Markdown...

## Example Code
```javascript
const apiKey = 'your-api-key';
```

## Integration Notes
- Step 1: Configure API key
- Step 2: Initialize client
- Step 3: Make requests"
                    className="w-full h-96 px-4 py-3 theme-bg-primary theme-border border rounded-lg theme-text-primary font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs theme-text-tertiary mt-2">
                    Supports: Headers (#, ##, ###), Code blocks (```), Inline code (`), Lists (-, *), Bold (**)
                  </p>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  {renderMarkdown(content)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
