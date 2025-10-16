import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) {
          toast.error(error.message || 'Failed to send reset email');
        } else {
          toast.success('Password reset email sent! Check your inbox.');
          setIsForgotPassword(false);
          setEmail('');
        }
      } else if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message || 'Failed to sign in');
        } else {
          toast.success('Welcome back!');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast.error(error.message || 'Failed to sign up');
        } else {
          toast.success('Account created successfully!');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8 bg-card border-border">
        <div className="flex items-center justify-center gap-2 mb-8">
          <TrendingUp className="text-foreground" size={32} />
          <h1 className="text-3xl font-bold">The Trading Diary</h1>
        </div>

        {isForgotPassword && (
          <Button
            variant="ghost"
            onClick={() => {
              setIsForgotPassword(false);
              setEmail('');
            }}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
        )}

        <h2 className="text-2xl font-semibold mb-6 text-center">
          {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !isForgotPassword && (
            <div>
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                className="mt-1"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
              placeholder="trader@example.com"
            />
          </div>

          {!isForgotPassword && (
            <div>
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          )}

          {isForgotPassword && (
            <p className="text-sm text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background hover:bg-foreground/90"
          >
            {loading ? 'Loading...' : isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        {!isForgotPassword && (
          <div className="mt-6 text-center space-y-2">
            {isLogin && (
              <button
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors block w-full"
              >
                Forgot password?
              </button>
            )}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Auth;
