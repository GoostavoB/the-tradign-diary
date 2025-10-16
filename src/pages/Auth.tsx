import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name is required'),
  country: z.string().min(2, 'Please select your country'),
  termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
  marketingConsent: z.boolean()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
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
        // Validate signup form
        const result = signupSchema.safeParse({
          email,
          password,
          confirmPassword,
          fullName,
          country,
          termsAccepted,
          marketingConsent
        });

        if (!result.success) {
          const firstError = result.error.errors[0];
          toast.error(firstError.message);
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName, country, marketingConsent);
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
            <>
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

              <div>
                <label className="text-sm font-medium text-foreground">Country</label>
                <Input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required={!isLogin}
                  className="mt-1"
                  placeholder="United States"
                />
              </div>
            </>
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
            <>
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

              {!isLogin && (
                <div>
                  <label className="text-sm font-medium text-foreground">Confirm Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                    className="mt-1"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              )}
            </>
          )}

          {isForgotPassword && (
            <p className="text-sm text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          )}

          {!isLogin && !isForgotPassword && (
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  required
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                  I agree to the Terms and Conditions and Privacy Policy. I authorize the collection and use of my trading data (non-personal) for developing reports and analytics.
                </Label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="marketing"
                  checked={marketingConsent}
                  onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
                />
                <Label htmlFor="marketing" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                  I agree to receive communications and marketing updates about promotions and news from The Trading Diary.
                </Label>
              </div>
            </div>
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
