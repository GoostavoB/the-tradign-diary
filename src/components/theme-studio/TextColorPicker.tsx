import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useThemeGating } from '@/hooks/useThemeGating';
import { Lock, RefreshCw } from 'lucide-react';
import { calculateContrast, getContrastDescription } from '@/utils/contrastValidation';

interface TextColorPickerProps {
  textColor: string;
  onChange: (color: string) => void;
}

export const TextColorPicker = ({ textColor, onChange }: TextColorPickerProps) => {
  const { canAccessBackgroundColor, handleLockedBackgroundColor } = useThemeGating();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [lightness, setLightness] = useState(50);
  const [hex, setHex] = useState('#808080');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (textColor) {
      const parts = textColor.split(' ');
      const h = parseFloat(parts[0]);
      const s = parseFloat(parts[1]);
      const l = parseFloat(parts[2]);
      setHue(h);
      setSaturation(s);
      setLightness(l);
      setHex(hslToHex(h, s, l));
    }
  }, [textColor]);

  useEffect(() => {
    drawGradient();
  }, [hue]);

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const hexToHsl = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [0, 0, 50];

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  const drawGradient = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    for (let y = 0; y < height; y++) {
      const l = 100 - (y / height) * 100;
      for (let x = 0; x < width; x++) {
        const s = (x / width) * 100;
        ctx.fillStyle = `hsl(${hue}, ${s}%, ${l}%)`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canAccessBackgroundColor()) {
      handleLockedBackgroundColor();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSaturation = (x / rect.width) * 100;
    const newLightness = 100 - (y / rect.height) * 100;

    setSaturation(Math.round(newSaturation));
    setLightness(Math.round(newLightness));
    const newHex = hslToHex(hue, Math.round(newSaturation), Math.round(newLightness));
    setHex(newHex);
    onChange(`${hue} ${Math.round(newSaturation)}% ${Math.round(newLightness)}%`);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canAccessBackgroundColor()) return;
    setIsDragging(true);
    handleCanvasClick(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    handleCanvasClick(e);
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canAccessBackgroundColor()) {
      handleLockedBackgroundColor();
      return;
    }

    const newHue = parseInt(e.target.value);
    setHue(newHue);
    const newHex = hslToHex(newHue, saturation, lightness);
    setHex(newHex);
    onChange(`${newHue} ${saturation}% ${lightness}%`);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canAccessBackgroundColor()) {
      handleLockedBackgroundColor();
      return;
    }

    const value = e.target.value;
    setHex(value);

    if (/^#[0-9A-F]{6}$/i.test(value)) {
      const [h, s, l] = hexToHsl(value);
      setHue(h);
      setSaturation(s);
      setLightness(l);
      onChange(`${h} ${s}% ${l}%`);
    }
  };

  const handleReset = () => {
    const defaultLight = '0 0% 9%'; // Dark text for light mode
    onChange(defaultLight);
  };

  const currentBg = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
  const contrastRatio = calculateContrast(textColor, currentBg);
  const contrastDesc = getContrastDescription(contrastRatio);
  const hasContrastIssue = contrastRatio < 4.5;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Text Color</Label>
        {canAccessBackgroundColor() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className={`space-y-4 ${!canAccessBackgroundColor() ? 'relative' : ''}`}>
        {!canAccessBackgroundColor() && (
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg cursor-pointer"
            onClick={handleLockedBackgroundColor}
          >
            <div className="text-center">
              <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Elite Feature</p>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={280}
          height={150}
          className="w-full rounded-lg border border-border cursor-crosshair"
          onClick={handleCanvasClick}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />

        <div className="space-y-2">
          <Label className="text-xs">Hue</Label>
          <input
            type="range"
            min="0"
            max="360"
            value={hue}
            onChange={handleHueChange}
            className="w-full h-6 rounded-lg appearance-none cursor-pointer"
            style={{
              background: 'linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))'
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs">HEX</Label>
            <div className="flex gap-2">
              <div 
                className="w-10 h-10 rounded border border-border flex-shrink-0"
                style={{ backgroundColor: hex }}
              />
              <Input
                value={hex}
                onChange={handleHexChange}
                className="font-mono text-xs"
                placeholder="#000000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">HSL</Label>
            <div className="text-xs font-mono bg-muted px-3 py-2 rounded-md">
              {hue}° {saturation}% {lightness}%
            </div>
          </div>
        </div>

        {hasContrastIssue && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-xs text-destructive font-medium">
              ⚠️ Contrast: {contrastRatio.toFixed(2)}:1 ({contrastDesc})
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This may be hard to read. Consider adjusting lightness.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
