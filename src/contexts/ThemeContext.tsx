import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'emerald' | 'custom';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove('light', 'dark', 'emerald', 'custom');
    root.classList.add(theme);

    localStorage.setItem('theme', theme);

    // Apply custom colors if custom theme is selected
    if (theme === 'custom') {
      applyCustomColors();
    } else {
      // Clear custom colors when switching to preset themes
      root.style.removeProperty('--custom-primary');
      root.style.removeProperty('--custom-text');
    }
  }, [theme]);

  const applyCustomColors = () => {
    const root = document.documentElement;
    
    // Load saved colors from localStorage
    const savedPrimary = localStorage.getItem('customPrimaryColor');
    const savedText = localStorage.getItem('customTextColor');
    
    if (savedPrimary) {
      const primaryColor: RGBColor = JSON.parse(savedPrimary);
      root.style.setProperty('--custom-primary', `${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}`);
    }
    
    if (savedText) {
      const textColor: RGBColor = JSON.parse(savedText);
      root.style.setProperty('--custom-text', `${textColor.r}, ${textColor.g}, ${textColor.b}`);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
