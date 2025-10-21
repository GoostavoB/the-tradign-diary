import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Download, Copy, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useState } from "react";
import { toast } from "sonner";

const LogoDownload = () => {
  const navigate = useNavigate();
  const [selectedBg, setSelectedBg] = useState<'transparent' | 'white' | 'dark'>('transparent');

  const downloadLogo = (size: number, bgColor: 'transparent' | 'white') => {
    const svg = document.getElementById('logo-svg-source');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set background
    if (bgColor === 'white') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        link.download = `trading-diary-logo-${size}x${size}-${bgColor}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        toast.success(`Downloaded ${size}x${size} PNG`);
      }, 'image/png');
    };

    img.src = url;
  };

  const copySVG = () => {
    const svg = document.getElementById('logo-svg-source');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    navigator.clipboard.writeText(svgData);
    toast.success('SVG code copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Download Logo Assets
          </h1>
          <p className="text-muted-foreground">
            Download your Trading Diary logo in various sizes and formats
          </p>
        </div>

        {/* Logo Preview Section */}
        <GlassCard className="p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Logo Preview</h2>
          
          {/* Background Selector */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={selectedBg === 'transparent' ? 'default' : 'outline'}
              onClick={() => setSelectedBg('transparent')}
              size="sm"
            >
              Transparent
            </Button>
            <Button
              variant={selectedBg === 'white' ? 'default' : 'outline'}
              onClick={() => setSelectedBg('white')}
              size="sm"
            >
              White
            </Button>
            <Button
              variant={selectedBg === 'dark' ? 'default' : 'outline'}
              onClick={() => setSelectedBg('dark')}
              size="sm"
            >
              Dark
            </Button>
          </div>

          {/* Logo Display */}
          <div
            className="rounded-xl p-12 flex items-center justify-center transition-colors"
            style={{
              backgroundColor: 
                selectedBg === 'white' ? '#FFFFFF' :
                selectedBg === 'dark' ? '#0A0A0A' :
                'transparent',
              border: selectedBg === 'transparent' ? '1px dashed hsl(var(--border))' : 'none'
            }}
          >
            <Logo size="xl" variant="horizontal" showText={true} />
          </div>

          {/* Copy SVG Button */}
          <div className="mt-6 flex justify-center">
            <Button onClick={copySVG} variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              Copy SVG Code
            </Button>
          </div>
        </GlassCard>

        {/* Download Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Transparent Background */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="h-4 w-4 rounded border-2 border-dashed border-muted-foreground" />
              Transparent Background
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Best for overlaying on any background
            </p>
            <div className="space-y-3">
              {[192, 512, 1024].map((size) => (
                <Button
                  key={`transparent-${size}`}
                  onClick={() => downloadLogo(size, 'transparent')}
                  variant="outline"
                  className="w-full justify-between hover:bg-primary/10"
                >
                  <span>{size}x{size} PNG</span>
                  <Download className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </GlassCard>

          {/* White Background */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-white border border-border" />
              White Background
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Best for dark themed websites or apps
            </p>
            <div className="space-y-3">
              {[192, 512, 1024].map((size) => (
                <Button
                  key={`white-${size}`}
                  onClick={() => downloadLogo(size, 'white')}
                  variant="outline"
                  className="w-full justify-between hover:bg-primary/10"
                >
                  <span>{size}x{size} PNG</span>
                  <Download className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Usage Guidelines */}
        <GlassCard className="p-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">Usage Guidelines</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>192x192:</strong> Perfect for favicons and small icons</li>
            <li>• <strong>512x512:</strong> Ideal for app icons and social media profiles</li>
            <li>• <strong>1024x1024:</strong> High-resolution for marketing materials and print</li>
            <li>• <strong>SVG:</strong> Scalable vector format for web use - always sharp at any size</li>
          </ul>
        </GlassCard>
      </div>

      {/* Hidden SVG Source */}
      <svg
        id="logo-svg-source"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hidden"
        style={{ width: '48px', height: '48px' }}
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(217, 91%, 60%)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'hsl(217, 91%, 60%)', stopOpacity: 0.85 }} />
          </linearGradient>
        </defs>
        
        <rect x="8" y="10" width="24" height="5" fill="url(#logoGradient)" />
        <rect x="17" y="10" width="6" height="28" fill="url(#logoGradient)" />
        <rect x="25" y="15" width="6" height="23" fill="url(#logoGradient)" />
        <path d="M 31 15 L 38 15 Q 42 15 42 19 L 42 34 Q 42 38 38 38 L 31 38 Z" fill="url(#logoGradient)" />
        <path d="M 31 20 L 35 20 Q 37 20 37 22 L 37 31 Q 37 33 35 33 L 31 33 Z" fill="white" />
        <rect x="7" y="9" width="36" height="30" rx="2" stroke="hsl(217, 91%, 60%)" strokeWidth="0.5" fill="none" opacity="0.2" />
      </svg>
    </div>
  );
};

export default LogoDownload;
