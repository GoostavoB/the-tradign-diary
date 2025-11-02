import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PostPurchaseUpsell } from '@/components/checkout/PostPurchaseUpsell';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<'pro' | 'elite' | null>(null);

  const sessionId = searchParams.get('session_id');
  const isUpsellSuccess = searchParams.get('upsell') === 'success';

  useEffect(() => {
    // Simulate payment verification
    // In a real app, you might want to verify the session with your backend
    const verifyPayment = async () => {
      if (!sessionId) {
        setVerifying(false);
        return;
      }

      // Simulate API call to verify payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVerified(true);
      setVerifying(false);

      // Check if this was an annual subscription purchase (not an upsell)
      // In production, you'd get this from the session metadata
      const isAnnualSubscription = !isUpsellSuccess; // Simplified check
      
      if (isAnnualSubscription) {
        // Show upsell after a brief delay
        setTimeout(() => {
          // You'd determine tier from session metadata
          setSubscriptionTier('pro'); // or 'elite'
          setShowUpsell(true);
        }, 1500);
      }

      toast({
        title: 'Payment Successful!',
        description: isUpsellSuccess 
          ? 'Your credits have been added to your account!' 
          : 'Your purchase has been completed successfully.',
      });
    };

    verifyPayment();
  }, [sessionId, toast, isUpsellSuccess]);

  return (
    <>
      {/* Upsell Modal */}
      {showUpsell && subscriptionTier && (
        <PostPurchaseUpsell
          onDismiss={() => setShowUpsell(false)}
          subscriptionTier={subscriptionTier}
        />
      )}

      <div className="container max-w-2xl mx-auto p-6 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
        <Card>
          <CardHeader className="text-center">
            {verifying ? (
              <>
                <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <CardTitle>Verifying Payment...</CardTitle>
                <CardDescription>
                  Please wait while we confirm your purchase
                </CardDescription>
              </>
            ) : verified ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center"
                >
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </motion.div>
                <CardTitle>Payment Successful!</CardTitle>
                <CardDescription>
                  Thank you for your purchase. Your account has been updated.
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle>Payment Confirmation</CardTitle>
                <CardDescription>
                  Unable to verify payment session
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {verified && (
              <>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Your subscription or credits have been added to your account.
                    You can start using them immediately!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => navigate('/settings')}
                    variant="outline"
                    className="flex-1"
                  >
                    View Settings
                  </Button>
                </div>
              </>
            )}

            {!verifying && !verified && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground text-center">
                  If you completed a payment, please check your email for confirmation.
                  Your account will be updated shortly.
                </p>
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                >
                  Return to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </>
  );
}
