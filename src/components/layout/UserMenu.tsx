import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { User, LogOut, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    toast.success('Logged out successfully');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password updated successfully! Please sign in again.');
        setChangePasswordOpen(false);
        setNewPassword('');
        setConfirmPassword('');
        // Sign out and redirect to login
        await signOut();
        navigate('/auth');
      }
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordResetEmail = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password reset email sent! Check your inbox.');
        setChangePasswordOpen(false);
      }
    } catch (error) {
      toast.error('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // Get display name from user metadata or email
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden md:inline">Hello, {displayName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            {user.email}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
            <KeyRound className="w-4 h-4 mr-2" />
            Change Password
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Choose how you'd like to change your password
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 border rounded-md space-y-3">
              <h3 className="font-medium">Change Password Now</h3>
              <p className="text-sm text-muted-foreground">
                Set a new password immediately
              </p>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    minLength={6}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Confirm Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    minLength={6}
                    required
                    className="mt-1"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="p-4 border rounded-md space-y-3">
              <h3 className="font-medium">Send Reset Email</h3>
              <p className="text-sm text-muted-foreground">
                We'll send a password reset link to <strong>{user.email}</strong>
              </p>
              <Button
                variant="outline"
                onClick={sendPasswordResetEmail}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Reset Email'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
