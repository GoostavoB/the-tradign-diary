import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { UserMenu } from './UserMenu';
import { CryptoPrices } from '@/components/CryptoPrices';
import { useReminderNotifications } from '@/hooks/useReminderNotifications';
import { ThemeToggle } from '@/components/ThemeToggle';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { MobileNav } from '@/components/mobile/MobileNav';
import { QuickAddTrade } from '@/components/mobile/QuickAddTrade';
import { InstallPrompt } from '@/components/mobile/InstallPrompt';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  // Enable reminder notifications
  useReminderNotifications();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-secondary/30 to-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <CryptoPrices />
          <header className="h-14 border-b border-border/50 backdrop-blur-xl bg-card/50 flex items-center justify-between gap-3 px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hover:bg-muted/50 rounded-lg p-2 transition-colors" />
            </div>
            <div className="flex items-center gap-3">
              <KeyboardShortcutsHelp />
              <ThemeToggle />
              <UserMenu />
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto pb-20 md:pb-6 custom-scrollbar">
            {children}
          </main>
          <MobileNav />
          <QuickAddTrade />
          <InstallPrompt />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
