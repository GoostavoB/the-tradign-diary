import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail } from 'lucide-react';

const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export default function NewsletterSignup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email: data.email }]);

      if (error) throw error;

      toast({
        title: 'Subscribed!',
        description: 'Check your email to confirm your subscription.',
      });
      reset();
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: 'Already subscribed',
          description: 'This email is already on our newsletter list.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to subscribe. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Subscribe to our Newsletter</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Get trading tips, market insights, and platform updates delivered to your inbox.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
        <Input
          {...register('email')}
          type="email"
          placeholder="your@email.com"
          className={errors.email ? 'border-destructive' : ''}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
      {errors.email && (
        <p className="text-sm text-destructive mt-2">{errors.email.message}</p>
      )}
    </div>
  );
}
