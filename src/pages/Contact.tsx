import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Building2, User, MessageSquare } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  company: z.string().trim().max(100).optional(),
  message: z.string().trim().min(1, "Message is required").max(1000),
});

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const validatedData = contactSchema.parse(formData);
      
      setIsSubmitting(true);
      
      // Encode data for mailto
      const subject = encodeURIComponent(`Contact from ${validatedData.name}${validatedData.company ? ` - ${validatedData.company}` : ''}`);
      const body = encodeURIComponent(
        `Name: ${validatedData.name}\nEmail: ${validatedData.email}\n${validatedData.company ? `Company: ${validatedData.company}\n` : ''}\n\nMessage:\n${validatedData.message}`
      );
      
      // Open mailto link
      window.location.href = `mailto:contact@thetradingdiary.com?subject=${subject}&body=${body}`;
      
      toast.success(t('contact.messageSent'));
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        message: '',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(firstError.message);
      } else {
        toast.error(t('common.error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            {t('contact.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('contact.name')} *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('contact.namePlaceholder')}
                  maxLength={100}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t('contact.email')} *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('contact.emailPlaceholder')}
                  maxLength={255}
                  required
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {t('contact.company')}
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder={t('contact.companyPlaceholder')}
                maxLength={100}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {t('contact.message')} *
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t('contact.messagePlaceholder')}
                maxLength={1000}
                rows={6}
                required
                className="bg-background/50 resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.message.length}/1000
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('common.loading') : t('contact.send')}
            </Button>
          </form>
        </Card>

        <div className="text-center space-y-4 pt-8">
          <p className="text-sm text-muted-foreground">
            {t('contact.directEmail')}
          </p>
          <a
            href="mailto:contact@thetradingdiary.com"
            className="text-primary hover:underline font-medium"
          >
            contact@thetradingdiary.com
          </a>
        </div>
      </div>
    </AppLayout>
  );
};

export default Contact;
