import { BarChart3, Upload, TrendingUp, Settings, BookOpen, HelpCircle, LogOut, TrendingDown, Calendar, Scale, Wrench, Users, Brain } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

const mainItems = [
  { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
  { title: 'Upload Trade', url: '/upload', icon: Upload },
  { title: 'Analytics', url: '/analytics', icon: TrendingUp },
  { title: 'Forecast', url: '/forecast', icon: TrendingUp },
  { title: 'Social', url: '/social', icon: Users },
  { title: 'AI Tools', url: '/ai-tools', icon: Brain },
  { title: 'Tools', url: '/tools', icon: Wrench },
  { title: 'Economic Calendar', url: '/economic-calendar', icon: Calendar },
  { title: 'BTC Long/Short Ratio', url: '/long-short-ratio', icon: Scale },
  { title: 'Settings', url: '/settings', icon: Settings },
];

const resourceItems = [
  { title: 'Blog', url: '/blog', icon: BookOpen },
  { title: 'FAQ', url: '/faq', icon: HelpCircle },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'bg-muted text-foreground font-medium'
      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground';

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 backdrop-blur-xl bg-card/50 glass">
      <div className="p-4 border-b border-border/50 flex items-center gap-2">
        <TrendingDown className="text-neon-red" size={24} />
        {open && <span className="font-bold text-lg">The Trading Diary</span>}
        <TrendingUp className="text-neon-green ml-auto" size={24} />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={signOut} tooltip="Logout" className="text-muted-foreground hover:text-foreground hover:bg-muted/50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="p-2 border-t border-border">
        <SidebarTrigger />
      </div>
    </Sidebar>
  );
}
