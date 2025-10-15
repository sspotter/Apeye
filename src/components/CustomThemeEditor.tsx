import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Palette, RotateCcw, Save } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export function CustomThemeEditor() {
  const { setTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Primary theme color (backgrounds, accents)
  const [primaryColor, setPrimaryColor] = useState<RGBColor>({ r: 59, g: 130, b: 246 }); // Blue
  
  // Text color
  const [textColor, setTextColor] = useState<RGBColor>({ r: 15, g: 23, b: 42 }); // Dark slate

  // Load saved colors from localStorage
  useEffect(() => {
    const savedPrimary = localStorage.getItem('customPrimaryColor');
    const savedText = localStorage.getItem('customTextColor');
    
    if (savedPrimary) {
      setPrimaryColor(JSON.parse(savedPrimary));
    }
    if (savedText) {
      setTextColor(JSON.parse(savedText));
    }
  }, []);

  // Apply colors to CSS variables
  useEffect(() => {
    applyColors();
  }, [primaryColor, textColor]);

  const applyColors = () => {
    const root = document.documentElement;
    
    // Apply primary color
    root.style.setProperty('--custom-primary', `${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}`);
    
    // Apply text color
    root.style.setProperty('--custom-text', `${textColor.r}, ${textColor.g}, ${textColor.b}`);
  };

  const handleSave = () => {
    // Save colors to localStorage
    localStorage.setItem('customPrimaryColor', JSON.stringify(primaryColor));
    localStorage.setItem('customTextColor', JSON.stringify(textColor));
    
    // Apply colors immediately
    applyColors();
    
    // Switch to custom theme
    setTheme('custom');
    
    toast.success('Custom theme saved and applied!', {
      icon: '🎨',
      style: {
        border: '2px solid #10b981',
        padding: '16px',
        color: '#10b981',
      },
      duration: 3000,
    });
  };

  const handleReset = () => {
    setPrimaryColor({ r: 59, g: 130, b: 246 }); // Default blue
    setTextColor({ r: 15, g: 23, b: 42 }); // Default dark
    
    localStorage.removeItem('customPrimaryColor');
    localStorage.removeItem('customTextColor');
    localStorage.removeItem('useCustomTheme');
    
    applyColors();
    
    toast.success('Theme reset to defaults', {
      icon: '🔄',
    });
  };

  const rgbToHex = (rgb: RGBColor): string => {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  };

  const ColorSlider = ({ 
    label, 
    color, 
    onChange 
  }: { 
    label: string; 
    color: RGBColor; 
    onChange: (color: RGBColor) => void;
  }) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium theme-text-primary">{label}</label>
          <div className="flex items-center gap-2">
            <div 
              className="w-12 h-8 rounded-md border-2 theme-border"
              style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
            />
            <span className="text-xs font-mono theme-text-tertiary">
              {rgbToHex(color)}
            </span>
          </div>
        </div>

        {/* Red Slider */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs theme-text-secondary">Red</span>
            <span className="text-xs font-mono theme-text-tertiary">{color.r}</span>
          </div>
          <input
            type="range"
            min="0"
            max="255"
            value={color.r}
            onChange={(e) => onChange({ ...color, r: parseInt(e.target.value) })}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, rgb(0, ${color.g}, ${color.b}), rgb(255, ${color.g}, ${color.b}))`
            }}
          />
        </div>

        {/* Green Slider */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs theme-text-secondary">Green</span>
            <span className="text-xs font-mono theme-text-tertiary">{color.g}</span>
          </div>
          <input
            type="range"
            min="0"
            max="255"
            value={color.g}
            onChange={(e) => onChange({ ...color, g: parseInt(e.target.value) })}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, rgb(${color.r}, 0, ${color.b}), rgb(${color.r}, 255, ${color.b}))`
            }}
          />
        </div>

        {/* Blue Slider */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs theme-text-secondary">Blue</span>
            <span className="text-xs font-mono theme-text-tertiary">{color.b}</span>
          </div>
          <input
            type="range"
            min="0"
            max="255"
            value={color.b}
            onChange={(e) => onChange({ ...color, b: parseInt(e.target.value) })}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, rgb(${color.r}, ${color.g}, 0), rgb(${color.r}, ${color.g}, 255))`
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <section className="theme-bg-secondary theme-border border rounded-xl overflow-hidden">
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
          <div className="theme-accent p-2 rounded-lg">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-semibold theme-text-primary">Custom Theme Editor</h2>
            <p className="text-xs theme-text-tertiary mt-0.5">
              Customize colors with RGB sliders
            </p>
          </div>
        </div>
        
        {!isExpanded && (
          <span className="text-xs theme-text-tertiary px-2 py-1 theme-bg-tertiary rounded">
            Advanced
          </span>
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t theme-border p-6 space-y-6">
          {/* Preview Section */}
          <div className="p-4 theme-bg-tertiary rounded-lg">
            <p className="text-sm theme-text-secondary mb-2">Preview:</p>
            <div 
              className="p-4 rounded-lg border-2 transition-all"
              style={{ 
                backgroundColor: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
                borderColor: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
                color: `rgb(${textColor.r}, ${textColor.g}, ${textColor.b})`
              }}
            >
              <h3 className="font-bold mb-1" style={{ color: `rgb(${textColor.r}, ${textColor.g}, ${textColor.b})` }}>
                Sample Text
              </h3>
              <p className="text-sm" style={{ color: `rgba(${textColor.r}, ${textColor.g}, ${textColor.b}, 0.8)` }}>
                This is how your custom theme will look
              </p>
            </div>
          </div>

          {/* Primary Color Sliders */}
          <div className="p-4 theme-bg-tertiary rounded-lg">
            <ColorSlider 
              label="🎨 Theme Color (Backgrounds, Accents)"
              color={primaryColor}
              onChange={setPrimaryColor}
            />
          </div>

          {/* Text Color Sliders */}
          <div className="p-4 theme-bg-tertiary rounded-lg">
            <ColorSlider 
              label="✍️ Text Color"
              color={textColor}
              onChange={setTextColor}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t theme-border">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg flex-1"
            >
              <Save className="w-4 h-4" />
              Save Custom Theme
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 theme-bg-primary theme-border border theme-text-secondary hover:theme-text-primary font-medium rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Info */}
          <div className="p-3 theme-bg-primary rounded-lg border theme-border">
            <p className="text-xs theme-text-tertiary">
              💡 <strong>Tip:</strong> Adjust the RGB sliders to create your perfect color scheme. 
              Changes are applied in real-time. Click "Save" to persist your theme.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
