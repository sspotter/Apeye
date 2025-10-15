import { Shield, Lock, Key, Database, Eye, Copy, Tag, Sparkles, Download, Upload, Trash2, Palette, FileText, Zap, Heart, Star } from 'lucide-react';

export function DocumentationPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full animate-pulse">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Now with AI Assistant & More!</span>
        </div>
        <h1 className="text-5xl font-bold theme-text-primary mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Documentation
        </h1>
        <p className="text-lg theme-text-secondary max-w-2xl mx-auto">
          Everything you need to know about managing your API keys, organizing resources, and staying secure 🚀
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="theme-bg-secondary theme-border border rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer group">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-5 h-5 text-blue-500 group-hover:rotate-12 transition-transform" />
            <span className="text-sm theme-text-tertiary">API Keys</span>
          </div>
          <p className="text-2xl font-bold theme-text-primary">Encrypted</p>
        </div>
        <div className="theme-bg-secondary theme-border border rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer group">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-500 group-hover:animate-spin transition-transform" />
            <span className="text-sm theme-text-tertiary">AI Assistant</span>
          </div>
          <p className="text-2xl font-bold theme-text-primary">Active</p>
        </div>
        <div className="theme-bg-secondary theme-border border rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer group">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-green-500 group-hover:animate-bounce transition-transform" />
            <span className="text-sm theme-text-tertiary">Backups</span>
          </div>
          <p className="text-2xl font-bold theme-text-primary">Enabled</p>
        </div>
        <div className="theme-bg-secondary theme-border border rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer group">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-5 h-5 text-pink-500 group-hover:rotate-45 transition-transform" />
            <span className="text-sm theme-text-tertiary">Themes</span>
          </div>
          <p className="text-2xl font-bold theme-text-primary">Custom</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* NEW: AI Assistant Section */}
        <section className="theme-bg-secondary theme-border border-2 border-purple-500/20 rounded-xl p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold theme-text-primary">AI Assistant</h2>
                <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300 rounded-full">NEW!</span>
              </div>
              <p className="text-sm theme-text-tertiary">Your intelligent coding companion</p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="theme-text-secondary">
              💬 Chat with an AI that understands your API management needs! Get instant code examples, 
              security tips, and context-aware help based on which service you're viewing.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-3 theme-bg-tertiary rounded-lg border border-blue-500/20 hover:border-blue-500/50 transition-colors">
                <Zap className="w-5 h-5 text-blue-500 mb-2" />
                <h4 className="font-medium theme-text-primary text-sm mb-1">Generate Code</h4>
                <p className="text-xs theme-text-tertiary">Working integration snippets in seconds</p>
              </div>
              <div className="p-3 theme-bg-tertiary rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-colors">
                <Shield className="w-5 h-5 text-purple-500 mb-2" />
                <h4 className="font-medium theme-text-primary text-sm mb-1">Best Practices</h4>
                <p className="text-xs theme-text-tertiary">Security and organization tips</p>
              </div>
              <div className="p-3 theme-bg-tertiary rounded-lg border border-green-500/20 hover:border-green-500/50 transition-colors">
                <Eye className="w-5 h-5 text-green-500 mb-2" />
                <h4 className="font-medium theme-text-primary text-sm mb-1">Context-Aware</h4>
                <p className="text-xs theme-text-tertiary">Knows which service you're using</p>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm theme-text-secondary">
                <strong className="theme-text-primary">💡 Pro Tip:</strong> Look for the glowing bubble in the bottom-right corner! 
                Click it to start chatting with your AI assistant. Try asking "How do I use OpenAI?" or "Best security practices".
              </p>
            </div>
          </div>
        </section>

        {/* Security Overview */}
        <section className="theme-bg-secondary theme-border border rounded-xl p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 p-2 rounded-lg group-hover:rotate-6 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold theme-text-primary">Security Overview</h2>
          </div>
          <div className="space-y-3 theme-text-secondary">
            <p>
              🔒 Your API keys and passwords are protected with industry-standard **AES-256 encryption**.
              All sensitive data is encrypted before being stored in the database.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>End-to-end encryption using Web Crypto API</li>
              <li>Session-based encryption keys stored only in your browser</li>
              <li>Automatic key clearing on sign out</li>
              <li>Row-level security policies ensure data isolation</li>
            </ul>
          </div>
        </section>

        {/* NEW: Data Management */}
        <section className="theme-bg-secondary theme-border border-2 border-green-500/20 rounded-xl p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6 text-white group-hover:animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold theme-text-primary">Data Management</h2>
                <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 rounded-full">NEW!</span>
              </div>
              <p className="text-sm theme-text-tertiary">Backup, restore, and manage your data</p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="theme-text-secondary">
              📦 Your data is precious! Export everything as JSON, import from backups, or even clear all data safely.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-4 theme-bg-tertiary rounded-lg border border-green-500/20 hover:border-green-500/50 transition-colors">
                <Download className="w-6 h-6 text-green-500 mb-2" />
                <h4 className="font-medium theme-text-primary mb-1">Export All Data</h4>
                <p className="text-sm theme-text-secondary">Download complete backup as JSON file</p>
              </div>
              <div className="p-4 theme-bg-tertiary rounded-lg border border-blue-500/20 hover:border-blue-500/50 transition-colors">
                <Upload className="w-6 h-6 text-blue-500 mb-2" />
                <h4 className="font-medium theme-text-primary mb-1">Import Data</h4>
                <p className="text-sm theme-text-secondary">Restore from backup (merge or replace)</p>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm theme-text-secondary">
                <strong className="theme-text-primary">📍 Location:</strong> Settings → Data Management
              </p>
            </div>
          </div>
        </section>

        {/* NEW: Custom Themes */}
        <section className="theme-bg-secondary theme-border border-2 border-pink-500/20 rounded-xl p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-3 rounded-lg group-hover:scale-110 group-hover:rotate-12 transition-all">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold theme-text-primary">Custom Themes</h2>
                <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 text-pink-700 dark:text-pink-300 rounded-full">NEW!</span>
              </div>
              <p className="text-sm theme-text-tertiary">Make it yours with custom colors</p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="theme-text-secondary">
              🎨 Don't like the default themes? Create your own! Use RGB sliders to pick custom primary and text colors.
            </p>
            <div className="grid grid-cols-4 gap-2">
              <div className="h-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg flex items-center justify-center text-xs font-medium theme-text-primary border theme-border">
                Light
              </div>
              <div className="h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center text-xs font-medium text-white border border-slate-700">
                Dark
              </div>
              <div className="h-16 bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900 dark:to-green-800 rounded-lg flex items-center justify-center text-xs font-medium text-emerald-900 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700">
                Emerald
              </div>
              <div className="h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg flex items-center justify-center text-xs font-medium text-purple-900 dark:text-purple-100 border border-purple-300 dark:border-purple-700 animate-pulse">
                Custom
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
              <p className="text-sm theme-text-secondary">
                <strong className="theme-text-primary">📍 Location:</strong> Settings → Custom Theme Editor
              </p>
            </div>
          </div>
        </section>

        {/* Managing API Keys */}
        <section className="theme-bg-secondary theme-border border rounded-xl p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500 p-2 rounded-lg group-hover:rotate-12 transition-transform">
              <Key className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold theme-text-primary">Managing API Keys</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 theme-bg-tertiary rounded-lg border-l-4 border-emerald-500">
              <h3 className="font-semibold theme-text-primary mb-2 flex items-center gap-2">
                <span>➕ Adding a New Key</span>
              </h3>
              <ol className="list-decimal list-inside space-y-2 theme-text-secondary ml-4">
                <li>Click the "Add Key" button in the top right</li>
                <li>Enter the service name and your API key</li>
                <li>Optionally add email/username, password, and notes</li>
                <li>Add tags to organize your keys (e.g., "production", "test")</li>
                <li>Click "Add Key" to save - it's encrypted automatically! 🔒</li>
              </ol>
            </div>

            <div className="p-4 theme-bg-tertiary rounded-lg border-l-4 border-blue-500">
              <h3 className="font-semibold theme-text-primary mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Viewing Keys
              </h3>
              <p className="theme-text-secondary">
                By default, all sensitive data is masked. Click the 👁️ eye icon to reveal passwords or API keys.
                Use the 📋 copy button to quickly copy credentials to your clipboard.
              </p>
            </div>

            <div className="p-4 theme-bg-tertiary rounded-lg border-l-4 border-orange-500">
              <h3 className="font-semibold theme-text-primary mb-2 flex items-center gap-2">
                <span>✏️ Editing & Deleting</span>
              </h3>
              <p className="theme-text-secondary">
                Use the edit icon to update any field. Click the 🗑️ trash icon to permanently delete a key.
                Deletion requires confirmation to prevent accidental data loss.
              </p>
            </div>
          </div>
        </section>

        {/* Data Storage */}
        <section className="theme-bg-secondary theme-border border rounded-xl p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold theme-text-primary">Data Storage</h2>
          </div>
          <div className="space-y-3 theme-text-secondary">
            <p>
              🗄️ Your data is stored in a secure Supabase PostgreSQL database with enterprise-grade protections:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 theme-bg-tertiary rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-colors hover:scale-105 transform">
                <Lock className="w-6 h-6 text-purple-500 mb-2" />
                <h4 className="font-medium theme-text-primary mb-1">Encryption at Rest</h4>
                <p className="text-sm">All sensitive fields are encrypted before storage</p>
              </div>
              <div className="p-4 theme-bg-tertiary rounded-lg border border-blue-500/20 hover:border-blue-500/50 transition-colors hover:scale-105 transform">
                <Eye className="w-6 h-6 text-blue-500 mb-2" />
                <h4 className="font-medium theme-text-primary mb-1">Row-Level Security</h4>
                <p className="text-sm">You can only access your own data</p>
              </div>
            </div>
          </div>
        </section>

        {/* Organization Tips */}
        <section className="theme-bg-secondary theme-border border rounded-xl p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-500 p-2 rounded-lg group-hover:rotate-45 transition-transform">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold theme-text-primary">Organization Tips</h2>
          </div>
          <div className="space-y-3 theme-text-secondary">
            <p>🗂️ Use these features to keep your API keys organized:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3 theme-bg-tertiary rounded-lg">
                <p className="font-semibold theme-text-primary mb-1">🏷️ Tags</p>
                <p className="text-sm">Categorize by environment (production, staging, test)</p>
              </div>
              <div className="p-3 theme-bg-tertiary rounded-lg">
                <p className="font-semibold theme-text-primary mb-1">🔍 Search</p>
                <p className="text-sm">Find keys by service name, email, or notes</p>
              </div>
              <div className="p-3 theme-bg-tertiary rounded-lg">
                <p className="font-semibold theme-text-primary mb-1">🎯 Filter</p>
                <p className="text-sm">View keys by specific tags</p>
              </div>
              <div className="p-3 theme-bg-tertiary rounded-lg">
                <p className="font-semibold theme-text-primary mb-1">📝 Notes</p>
                <p className="text-sm">Add context, expiration dates, restrictions</p>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="theme-bg-secondary theme-border border-2 border-red-500/20 rounded-xl p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold theme-text-primary">Best Practices</h2>
          </div>
          <div className="space-y-3 theme-text-secondary">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm">🔄 Rotate your API keys regularly (every 90 days)</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm">🏗️ Use different keys for dev and production</p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm">🚪 Sign out on shared or public computers</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm">🔐 Keep account password strong and unique</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm">🧹 Review and remove unused keys periodically</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm">🔒 Never share your master account credentials</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="theme-bg-secondary theme-border border-2 rounded-xl p-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-500 animate-pulse" />
            <Star className="w-5 h-5 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
            <Heart className="w-5 h-5 text-red-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <h3 className="text-xl font-bold theme-text-primary mb-2">
            Made with ❤️ for Developers
          </h3>
          <p className="theme-text-secondary text-sm mb-4">
            API Key Manager helps you organize, secure, and manage all your API credentials in one place.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs theme-text-tertiary">
            <span>🔒 Secure</span>
            <span>•</span>
            <span>🚀 Fast</span>
            <span>•</span>
            <span>🎨 Customizable</span>
            <span>•</span>
            <span>🤖 AI-Powered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
