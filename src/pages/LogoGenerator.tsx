import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';

interface LogoVariation {
  id: string;
  name: string;
  description: string;
}

const variations: LogoVariation[] = [
  { id: 'all-white', name: 'All White', description: 'Pure white logo on transparent background' },
  { id: 'all-black', name: 'All Black', description: 'Pure black logo on transparent background' },
  { id: 'blue-white', name: 'Blue Icon + White Text', description: 'Blue TD icon with white text' },
  { id: 'blue-black', name: 'Blue Icon + Black Text', description: 'Blue TD icon with black text' },
  { id: 'blue-gray', name: 'Blue Icon + Gray Text', description: 'Blue TD icon with dark gray text' },
  { id: 'vietnam', name: 'Vietnam Colors', description: 'Red and golden yellow patriotic design' },
  { id: 'usa', name: 'USA Colors', description: 'Red, white, and blue patriotic design' },
  { id: 'uae', name: 'UAE Colors', description: 'Emirates flag colors - elegant design' },
  { id: 'brazil', name: 'Brazil Colors', description: 'Green, yellow, and blue tropical design' },
];

export default function LogoGenerator() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedLogos, setGeneratedLogos] = useState<Record<string, string>>({});
  
  // Use the original logo from the public folder
  const originalLogoUrl = `${window.location.origin}/original-logo.png`;

  const generateLogo = async (variation: LogoVariation) => {
    setGenerating(variation.id);
    try {
      const { data, error } = await supabase.functions.invoke('generate-logo-variations', {
        body: { 
          variation: variation.id,
          imageUrl: originalLogoUrl
        }
      });

      if (error) throw error;

      if (data.success && data.imageUrl) {
        setGeneratedLogos(prev => ({
          ...prev,
          [variation.id]: data.imageUrl
        }));
        toast.success(`${variation.name} logo generated!`);
      } else {
        throw new Error('Failed to generate logo');
      }
    } catch (error: any) {
      console.error('Error generating logo:', error);
      toast.error(`Failed to generate ${variation.name}: ${error.message}`);
    } finally {
      setGenerating(null);
    }
  };

  const downloadLogo = (variation: LogoVariation, imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `trading-diary-logo-${variation.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Logo downloaded!');
  };

  const generateAll = async () => {
    toast.info('Generating all logo variations... This may take a minute.');
    for (const variation of variations) {
      if (!generatedLogos[variation.id]) {
        await generateLogo(variation);
        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    toast.success('All logos generated!');
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Logo Generator</h1>
            <p className="text-muted-foreground mt-1">
              Generate high-resolution logo variations for The Trading Diary
            </p>
          </div>
          <Button onClick={generateAll} disabled={generating !== null} size="lg">
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate All'
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {variations.map((variation) => {
            const imageUrl = generatedLogos[variation.id];
            const isGenerating = generating === variation.id;

            return (
              <Card key={variation.id} className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{variation.name}</h3>
                  <p className="text-sm text-muted-foreground">{variation.description}</p>
                </div>

                <div className="aspect-[4/1] bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={variation.name}
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      {isGenerating ? 'Generating...' : 'Not generated yet'}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => generateLogo(variation)}
                    disabled={isGenerating || generating !== null}
                    className="flex-1"
                    variant={imageUrl ? 'outline' : 'default'}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : imageUrl ? (
                      'Regenerate'
                    ) : (
                      'Generate'
                    )}
                  </Button>
                  {imageUrl && (
                    <Button
                      onClick={() => downloadLogo(variation, imageUrl)}
                      variant="secondary"
                      size="icon"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-6 bg-muted">
          <h3 className="font-semibold mb-2">Instructions</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Your original logo design is preserved - only colors are changed</li>
            <li>• Click "Generate All" to create all logo variations at once</li>
            <li>• Or generate individual variations by clicking "Generate" on each card</li>
            <li>• All logos maintain the same design with different color schemes</li>
            <li>• Download individual logos using the download button</li>
            <li>• All logos have transparent backgrounds (PNG format)</li>
          </ul>
        </Card>
      </div>
    </AppLayout>
  );
}
