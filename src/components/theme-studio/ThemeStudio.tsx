import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ThemeStudioHeader } from './ThemeStudioHeader';
import { QuickThemesGrid } from './QuickThemesGrid';
import { CustomThemeManager } from './CustomThemeManager';
import { SeasonalThemeBanner } from './SeasonalThemeBanner';
import { AIThemeSuggestion } from './AIThemeSuggestion';
import { BackgroundColorPicker } from './BackgroundColorPicker';
import { TextColorPicker } from './TextColorPicker';
import { ThemePreviewBanner } from './ThemePreviewBanner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { useThemeMode } from '@/hooks/useThemeMode';

export const ThemeStudio = () => {
  const [backgroundColor, setBackgroundColor] = useState('0 0% 100%');
  const [textColor, setTextColor] = useState('0 0% 9%');
  const { previewMode, applyPreview, cancelPreview } = useThemeMode();

  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
    // Apply the background color to CSS variables
    document.documentElement.style.setProperty('--background', color);
  };

  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    // Apply the text color to CSS variables
    document.documentElement.style.setProperty('--foreground', color);
  };

  return (
    <>
      {/* Preview Mode Banner */}
      {previewMode && (
        <ThemePreviewBanner
          themeName={previewMode.themeName}
          onApply={applyPreview}
          onCancel={cancelPreview}
        />
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-muted/50"
            aria-label="Theme Studio"
          >
            <Palette className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          align="end" 
          className="w-[380px] p-0 glass-strong backdrop-blur-xl border-accent/20"
          sideOffset={8}
        >
          <div className="space-y-0">
            {/* Header with Dark Mode Toggle */}
            <ThemeStudioHeader />

            <ScrollArea className="h-[500px]">
              <div className="space-y-6 py-4">
                {/* Seasonal Theme Banner */}
                <SeasonalThemeBanner />

                {/* AI Suggestion */}
                <AIThemeSuggestion />

                {/* Background Color Picker */}
                <div className="px-4">
                  <BackgroundColorPicker
                    currentColor={backgroundColor}
                    onColorChange={handleBackgroundColorChange}
                  />
                </div>

                {/* Text Color Picker */}
                <div className="px-4">
                  <TextColorPicker
                    textColor={textColor}
                    onChange={handleTextColorChange}
                  />
                </div>

                {/* Quick Themes Section */}
                <QuickThemesGrid />

                {/* Custom Themes Section */}
                <div className="border-t border-border/20 pt-4">
                  <CustomThemeManager />
                </div>
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
