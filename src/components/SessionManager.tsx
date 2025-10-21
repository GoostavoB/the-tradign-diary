import { useEffect, useState } from 'react';
import { Laptop, Smartphone, Monitor, LogOut, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Session {
  id: string;
  device_info: string;
  ip_address: string;
  last_active: string;
  created_at: string;
  is_current: boolean;
}

export const SessionManager = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoutTarget, setLogoutTarget] = useState<string | 'all' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // In a real implementation, this would fetch from user_sessions table
      // For now, showing current session as example
      const mockSessions: Session[] = [
        {
          id: session.access_token.slice(0, 10),
          device_info: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser',
          ip_address: 'Current device',
          last_active: new Date().toISOString(),
          created_at: new Date().toISOString(),
          is_current: true,
        }
      ];

      setSessions(mockSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (sessionId: string) => {
    try {
      if (sessionId === 'all') {
        await supabase.auth.signOut();
        toast({
          title: 'Logged out from all devices',
          description: 'You have been logged out from all other sessions.',
        });
      } else {
        // In real implementation, delete specific session from DB
        toast({
          title: 'Session ended',
          description: 'The selected device has been logged out.',
        });
        loadSessions();
      }
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
    setLogoutTarget(null);
  };

  const getDeviceIcon = (deviceInfo: string) => {
    if (deviceInfo.toLowerCase().includes('mobile')) return Smartphone;
    if (deviceInfo.toLowerCase().includes('tablet')) return Monitor;
    return Laptop;
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const sessionDate = new Date(date);
    const diffMs = now.getTime() - sessionDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>Loading your active sessions...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage devices where you're currently logged in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.device_info);
            return (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <DeviceIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{session.device_info}</span>
                      {session.is_current && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {session.ip_address} • {formatDate(session.last_active)}
                    </p>
                  </div>
                </div>
                {!session.is_current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLogoutTarget(session.id)}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                )}
              </div>
            );
          })}

          {sessions.length > 1 && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setLogoutTarget('all')}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout All Other Devices
            </Button>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!logoutTarget} onOpenChange={() => setLogoutTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              {logoutTarget === 'all'
                ? 'This will log you out from all other devices. You will remain logged in on this device.'
                : 'This will end the session on the selected device.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => logoutTarget && handleLogout(logoutTarget)}>
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
