import { Key, Settings, FileText, Moon, Sun, Palette, Laptop } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface NavigationProps {
  currentPage: 'keys' | 'settings' | 'docs' | 'tester';
  onPageChange: (page: 'keys' | 'settings' | 'docs' | 'tester') => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const { theme, setTheme } = useTheme();

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon className="w-5 h-5" />;
    if (theme === 'emerald') return <Palette className="w-5 h-5" />;
    return <Sun className="w-5 h-5" />;
  };

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('emerald');
    else setTheme('dark');
  };

  const navItems = [
    { id: 'keys' as const, label: 'API Keys', icon: Key },
    { id: 'tester' as const, label: 'Websites', icon: Laptop },
    { id: 'docs' as const, label: 'Documentation', icon: FileText },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="theme-bg-secondary theme-border border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 ">
          <div className="flex items-center gap-8 ">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-slate-700 ${
                    isActive
                      ? 'theme-accent text-white '
                      : 'theme-text-secondary hover:theme-bg-tertiary '
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={cycleTheme}
            className="p-2 rounded-lg theme-text-secondary hover:theme-bg-tertiary transition-all"
            aria-label="Toggle theme"
          >
            {getThemeIcon()}
          </button>
        </div>
      </div>
    </nav>
  );
}
