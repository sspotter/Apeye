import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from './Navigation';
import { ApiKeysPage } from './ApiKeysPage';
import { WebsitePage } from './WebsitePage';
import { SettingsPage } from './SettingsPage';
import { DocumentationPage } from './DocumentationPage';
import { Testerpage } from './Testerpage';
import { Key, LogOut } from 'lucide-react';

type Page = 'keys' | 'settings' | 'docs' | 'tester';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Determine current page from URL path
  const getCurrentPage = (): Page => {
    const path = location.pathname;
    if (path.startsWith('/api-keys')) return 'keys';
    if (path === '/settings') return 'settings';
    if (path === '/docs') return 'docs';
    if (path === '/resources') return 'tester';
    return 'keys';
  };

  return (
    <div className="min-h-screen theme-bg-primary transition-colors">
      <header className="theme-bg-secondary theme-border border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="theme-accent p-2 rounded-lg">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold theme-text-primary">
                  API Key Manager
                </h1>
                <p className="text-sm theme-text-tertiary">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 theme-text-secondary hover:theme-bg-tertiary rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <Navigation currentPage={getCurrentPage()} />

      <main>
        <Routes>
          <Route path="/" element={<ApiKeysPage />} />
          <Route path="/api-keys" element={<ApiKeysPage />} />
          <Route path="/api-keys/:serviceName" element={<WebsitePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/docs" element={<DocumentationPage />} />
          <Route path="/resources" element={<Testerpage />} />
        </Routes>
      </main>
    </div>
  );
}
