import { Maximize2, Minimize2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WidgetSize, WidgetHeight } from '@/types/widget';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface WidgetResizeControlsProps {
  currentSize: WidgetSize;
  currentHeight: WidgetHeight;
  onResize: (newSize?: WidgetSize, newHeight?: WidgetHeight) => void;
}

export const WidgetResizeControls = ({
  currentSize,
  currentHeight,
  onResize,
}: WidgetResizeControlsProps) => {
  // Size 1 widgets cannot be resized
  if (currentSize === 1) return null;

  const widthOptions: WidgetSize[] = [2, 4, 6];
  const heightOptions: WidgetHeight[] = [2, 4, 6];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Largura</DropdownMenuLabel>
        {widthOptions.map((size) => (
          <DropdownMenuItem
            key={`width-${size}`}
            onClick={() => onResize(size, undefined)}
            className={currentSize === size ? 'bg-accent' : ''}
          >
            {size === 2 && <Minimize2 className="h-4 w-4 mr-2" />}
            {size === 4 && <Maximize2 className="h-4 w-4 mr-2" />}
            {size === 6 && <Maximize2 className="h-4 w-4 mr-2" />}
            {size === 2 ? '1 coluna' : size === 4 ? '2 colunas' : '3 colunas'}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Altura</DropdownMenuLabel>
        {heightOptions.map((height) => (
          <DropdownMenuItem
            key={`height-${height}`}
            onClick={() => onResize(undefined, height)}
            className={currentHeight === height ? 'bg-accent' : ''}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {height === 2 ? 'Pequena' : height === 4 ? 'Média' : 'Grande'}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
