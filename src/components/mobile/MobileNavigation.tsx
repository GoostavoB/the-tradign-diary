import { Link, useLocation } from 'react-router-dom';
import { Home, LineChart, BookOpen, User, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: LineChart, label: 'Trades', path: '/trades' },
  { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
  { icon: BookOpen, label: 'Learn', path: '/learn' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export function MobileNavigation() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1", isActive && "animate-bounce-subtle")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
