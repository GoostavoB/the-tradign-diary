import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export const ThemeStudioHeader = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center justify-between p-4 border-b border-border/20">
      <div className="flex items-center gap-2">
        {isDark ? (
          <Moon className="h-4 w-4 text-primary" />
        ) : (
          <Sun className="h-4 w-4 text-primary" />
        )}
        <Label htmlFor="dark-mode" className="text-sm font-medium cursor-pointer">
          Dark Mode
        </Label>
      </div>
      <Switch
        id="dark-mode"
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
      />
    </div>
  );
};
