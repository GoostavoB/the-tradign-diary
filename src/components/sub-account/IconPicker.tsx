import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  Clock, 
  DollarSign, 
  BarChart3, 
  PieChart,
  Activity,
  Wallet,
  LineChart,
  ArrowUpDown,
  TrendingUpDown,
  Rocket,
  Shield,
  Crown,
  Star,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS = [
  { name: 'TrendingUp', component: TrendingUp },
  { name: 'TrendingDown', component: TrendingDown },
  { name: 'Target', component: Target },
  { name: 'Zap', component: Zap },
  { name: 'Clock', component: Clock },
  { name: 'DollarSign', component: DollarSign },
  { name: 'BarChart3', component: BarChart3 },
  { name: 'PieChart', component: PieChart },
  { name: 'Activity', component: Activity },
  { name: 'Wallet', component: Wallet },
  { name: 'LineChart', component: LineChart },
  { name: 'ArrowUpDown', component: ArrowUpDown },
  { name: 'TrendingUpDown', component: TrendingUpDown },
  { name: 'Rocket', component: Rocket },
  { name: 'Shield', component: Shield },
  { name: 'Crown', component: Crown },
  { name: 'Star', component: Star },
  { name: 'Circle', component: Circle },
];

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
  color?: string;
}

export const IconPicker = ({ selectedIcon, onSelectIcon, color }: IconPickerProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Icon</label>
      <div className="grid grid-cols-6 gap-2">
        {ICONS.map(({ name, component: Icon }) => (
          <button
            key={name}
            type="button"
            onClick={() => onSelectIcon(name)}
            className={cn(
              "p-2 rounded-md border transition-all hover:scale-110",
              selectedIcon === name
                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            )}
            style={{
              color: selectedIcon === name && color ? color : undefined
            }}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    </div>
  );
};

export const getIconComponent = (iconName: string) => {
  const icon = ICONS.find(i => i.name === iconName);
  return icon?.component || Circle;
};
