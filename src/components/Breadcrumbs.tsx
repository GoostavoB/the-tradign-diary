import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbMap {
  [key: string]: {
    label: string;
    parent?: string;
  };
}

// Map routes to breadcrumb labels and their parent routes
const breadcrumbMap: BreadcrumbMap = {
  '/dashboard': { label: 'Dashboard' },
  '/dashboard?tab=insights': { label: 'Insights', parent: '/dashboard' },
  '/dashboard?tab=history': { label: 'Trade History', parent: '/dashboard' },
  '/upload': { label: 'Add Trade' },
  '/analytics': { label: 'Analytics' },
  '/forecast': { label: 'Forecast' },
  '/achievements': { label: 'Achievements' },
  '/gamification': { label: 'Progress & XP' },
  '/market-data': { label: 'Market Data' },
  '/settings': { label: 'Settings' },
  '/ai-tools': { label: 'AI Tools' },
  '/journal': { label: 'Trading Journal' },
  '/goals': { label: 'Goals' },
  '/risk-management': { label: 'Risk Management' },
  '/reports': { label: 'Reports' },
  '/psychology': { label: 'Psychology' },
  '/trading-plan': { label: 'Trading Plan' },
  '/spot-wallet': { label: 'Spot Wallet' },
  '/track-capital': { label: 'Track Capital' },
  '/fee-analysis': { label: 'Fee Analysis' },
  '/leaderboard': { label: 'Leaderboard' },
  '/friend-leaderboard': { label: 'Friend Leaderboard' },
  '/long-short-ratio': { label: 'Long/Short Ratio' },
  '/tax-reports': { label: 'Tax Reports' },
  '/withdrawals': { label: 'Withdrawals' },
  '/my-metrics': { label: 'My Metrics' },
  '/user-guide': { label: 'User Guide' },
  '/accessibility': { label: 'Accessibility' },
  '/support': { label: 'Support' },
  '/calculators': { label: 'Calculators' },
  '/learn': { label: 'Learn' },
  '/api-docs': { label: 'API Docs' },
  '/advanced-analytics': { label: 'Advanced Analytics' },
  '/upgrade': { label: 'Upgrade' },
  '/credits/purchase': { label: 'Purchase Credits' },
  '/tier-preview': { label: 'Tier Preview' },
  '/premium-features': { label: 'Premium Features' },
  '/orders': { label: 'Order History' },
};

export function Breadcrumbs() {
  const location = useLocation();
  const currentPath = location.pathname + location.search;

  // Find the matching route (check with query params first, then without)
  const routeKey = breadcrumbMap[currentPath] 
    ? currentPath 
    : location.pathname;

  const currentRoute = breadcrumbMap[routeKey];

  // If no breadcrumb mapping exists, don't render
  if (!currentRoute) return null;

  // Build breadcrumb trail
  const breadcrumbs: { label: string; path: string }[] = [];
  
  // Always start with home
  breadcrumbs.push({ label: 'Home', path: '/dashboard' });

  // Add parent if it exists
  if (currentRoute.parent && currentRoute.parent !== '/dashboard') {
    const parent = breadcrumbMap[currentRoute.parent];
    if (parent) {
      breadcrumbs.push({ label: parent.label, path: currentRoute.parent });
    }
  }

  // Add current page (if not home)
  if (routeKey !== '/dashboard') {
    breadcrumbs.push({ label: currentRoute.label, path: routeKey });
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="flex items-center gap-2 text-sm text-muted-foreground py-2"
    >
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <div key={crumb.path} className="flex items-center gap-2">
            {index === 0 ? (
              <Home className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            )}
            
            {isLast ? (
              <span 
                className="font-medium text-foreground" 
                aria-current="page"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className={cn(
                  "hover:text-foreground transition-colors",
                  index === 0 && "sr-only sm:not-sr-only"
                )}
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
