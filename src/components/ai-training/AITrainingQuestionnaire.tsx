import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Brain, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  experience_level: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: "Please select your experience level",
  }),
  trading_styles: z.array(z.string()).min(1, "Please select at least one trading style"),
  main_goals: z.array(z.string()).min(1, "Please select at least one goal"),
  main_goals_other: z.string().optional(),
  market_focus: z.array(z.string()).min(1, "Please select at least one market"),
  strategy_style: z.string({
    required_error: "Please select your strategy style",
  }),
  risk_per_trade: z.string({
    required_error: "Please select your risk per trade",
  }),
  trading_schedule: z.array(z.string()).min(1, "Please select at least one time"),
  common_challenges: z.array(z.string()),
  consent_to_analyze: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface AITrainingQuestionnaireProps {
  onComplete: () => void;
}

const STEPS = [
  { id: 1, title: 'Experience Level', fields: ['experience_level'] },
  { id: 2, title: 'Trading Style', fields: ['trading_styles'] },
  { id: 3, title: 'Main Goals', fields: ['main_goals', 'main_goals_other'] },
  { id: 4, title: 'Market Focus', fields: ['market_focus'] },
  { id: 5, title: 'Strategy Style', fields: ['strategy_style'] },
  { id: 6, title: 'Risk Profile', fields: ['risk_per_trade'] },
  { id: 7, title: 'Trading Schedule', fields: ['trading_schedule'] },
  { id: 8, title: 'Common Challenges', fields: ['common_challenges'] },
  { id: 9, title: 'Consent', fields: ['consent_to_analyze'] },
];

export const AITrainingQuestionnaire = ({ onComplete }: AITrainingQuestionnaireProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trading_styles: [],
      main_goals: [],
      main_goals_other: '',
      market_focus: [],
      trading_schedule: [],
      common_challenges: [],
      consent_to_analyze: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('ai_training_profile')
        .insert({
          user_id: user.id,
          ...values,
        });

      if (error) throw error;

      toast.success('AI profile created! Your trading assistant is now personalized.');
      onComplete();
    } catch (error) {
      console.error('Error saving AI training profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const currentStepFields = STEPS[currentStep - 1].fields;
    const isValid = await form.trigger(currentStepFields as any);
    
    if (isValid) {
      if (currentStep === STEPS.length) {
        form.handleSubmit(onSubmit)();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle>Train Your AI Trading Assistant</CardTitle>
              <CardDescription>
                Help us personalize your experience. This takes just 2 minutes.
              </CardDescription>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {STEPS.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Step 1: Experience Level */}
              {currentStep === 1 && (
                <FormField
                  control={form.control}
                  name="experience_level"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-lg font-semibold">How would you describe your trading experience?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                            <RadioGroupItem value="beginner" id="beginner" />
                            <label htmlFor="beginner" className="flex-1 cursor-pointer">
                              <div className="font-medium">Beginner</div>
                              <div className="text-sm text-muted-foreground">New to trading or still learning the basics</div>
                            </label>
                          </div>
                          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                            <RadioGroupItem value="intermediate" id="intermediate" />
                            <label htmlFor="intermediate" className="flex-1 cursor-pointer">
                              <div className="font-medium">Intermediate</div>
                              <div className="text-sm text-muted-foreground">Active trader with some consistent results</div>
                            </label>
                          </div>
                          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                            <RadioGroupItem value="advanced" id="advanced" />
                            <label htmlFor="advanced" className="flex-1 cursor-pointer">
                              <div className="font-medium">Advanced</div>
                              <div className="text-sm text-muted-foreground">Experienced trader with proven track record</div>
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Step 2: Trading Style */}
              {currentStep === 2 && (
                <FormField
                  control={form.control}
                  name="trading_styles"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">Which trading style do you use?</FormLabel>
                      <FormDescription>You can select more than one</FormDescription>
                      <div className="space-y-3 mt-4">
                        {[
                          { id: 'scalper', label: 'Scalper', description: 'Positions last a few minutes' },
                          { id: 'day_trader', label: 'Day Trader', description: 'Positions closed the same day' },
                          { id: 'swing_trader', label: 'Swing Trader', description: 'Positions held for days or weeks' },
                          { id: 'position_trader', label: 'Position Trader', description: 'Positions held for weeks or months' },
                        ].map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="trading_styles"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      const value = field.value || [];
                                      return checked
                                        ? field.onChange([...value, item.id])
                                        : field.onChange(value.filter((v) => v !== item.id));
                                    }}
                                  />
                                </FormControl>
                                <div className="flex-1">
                                  <FormLabel className="font-medium cursor-pointer">{item.label}</FormLabel>
                                  <FormDescription>{item.description}</FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Step 3: Main Goals */}
              {currentStep === 3 && (
                <FormField
                  control={form.control}
                  name="main_goals"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">What are your current priorities?</FormLabel>
                      <FormDescription>You can select more than one</FormDescription>
                      <div className="space-y-3 mt-4">
                        {[
                          'Improve consistency',
                          'Reduce emotional mistakes',
                          'Increase win rate',
                          'Increase average profit per trade',
                          'Other',
                        ].map((goal) => (
                          <FormField
                            key={goal}
                            control={form.control}
                            name="main_goals"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(goal)}
                                    onCheckedChange={(checked) => {
                                      const value = field.value || [];
                                      return checked
                                        ? field.onChange([...value, goal])
                                        : field.onChange(value.filter((v) => v !== goal));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="flex-1 font-medium cursor-pointer">{goal}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      {form.watch('main_goals')?.includes('Other') && (
                        <FormField
                          control={form.control}
                          name="main_goals_other"
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Specify your goal</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your specific goal..." {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Step 4: Market Focus */}
              {currentStep === 4 && (
                <FormField
                  control={form.control}
                  name="market_focus"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">Which crypto markets do you trade most often?</FormLabel>
                      <FormDescription>You can select more than one</FormDescription>
                      <div className="space-y-3 mt-4">
                        {[
                          'Bitcoin (BTC)',
                          'Ethereum (ETH)',
                          'Altcoins (e.g. SOL, AVAX, ADA)',
                          'Meme coins (e.g. DOGE, SHIB)',
                          'Futures / Perpetuals',
                          'Spot market only',
                        ].map((market) => (
                          <FormField
                            key={market}
                            control={form.control}
                            name="market_focus"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(market)}
                                    onCheckedChange={(checked) => {
                                      const value = field.value || [];
                                      return checked
                                        ? field.onChange([...value, market])
                                        : field.onChange(value.filter((v) => v !== market));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="flex-1 font-medium cursor-pointer">{market}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Step 5: Strategy Style */}
              {currentStep === 5 && (
                <FormField
                  control={form.control}
                  name="strategy_style"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-lg font-semibold">How do you usually make your trading decisions?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-3"
                        >
                          {[
                            { value: 'price_action', label: 'Price Action', desc: 'Naked charts, support/resistance, order flow' },
                            { value: 'indicator_based', label: 'Indicator-based', desc: 'RSI, MACD, EMAs, etc.' },
                            { value: 'quantitative', label: 'Quantitative / Algorithmic', desc: 'Bots, data models, backtests' },
                            { value: 'news_driven', label: 'News-driven or event-based', desc: 'Macro, narratives, on-chain data' },
                            { value: 'mixed', label: 'Mixed approach', desc: 'Combination of multiple methods' },
                          ].map((item) => (
                            <div key={item.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                              <RadioGroupItem value={item.value} id={item.value} />
                              <label htmlFor={item.value} className="flex-1 cursor-pointer">
                                <div className="font-medium">{item.label}</div>
                                <div className="text-sm text-muted-foreground">{item.desc}</div>
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Step 6: Risk Profile */}
              {currentStep === 6 && (
                <FormField
                  control={form.control}
                  name="risk_per_trade"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-lg font-semibold">How much do you typically risk per trade?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-3"
                        >
                          {[
                            { value: 'less_than_1', label: 'Less than 1%', desc: 'Very conservative approach' },
                            { value: '1_2', label: '1–2%', desc: 'Standard risk management' },
                            { value: '3_5', label: '3–5%', desc: 'Moderate to aggressive' },
                            { value: 'more_than_5', label: 'More than 5%', desc: 'High risk tolerance' },
                          ].map((item) => (
                            <div key={item.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                              <RadioGroupItem value={item.value} id={item.value} />
                              <label htmlFor={item.value} className="flex-1 cursor-pointer">
                                <div className="font-medium">{item.label}</div>
                                <div className="text-sm text-muted-foreground">{item.desc}</div>
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Step 7: Trading Schedule */}
              {currentStep === 7 && (
                <FormField
                  control={form.control}
                  name="trading_schedule"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">When do you usually trade?</FormLabel>
                      <FormDescription>You can select more than one</FormDescription>
                      <div className="space-y-3 mt-4">
                        {[
                          'Morning (UTC)',
                          'Afternoon (UTC)',
                          'Night (UTC)',
                          'All day',
                        ].map((time) => (
                          <FormField
                            key={time}
                            control={form.control}
                            name="trading_schedule"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(time)}
                                    onCheckedChange={(checked) => {
                                      const value = field.value || [];
                                      return checked
                                        ? field.onChange([...value, time])
                                        : field.onChange(value.filter((v) => v !== time));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="flex-1 font-medium cursor-pointer">{time}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Step 8: Common Challenges */}
              {currentStep === 8 && (
                <FormField
                  control={form.control}
                  name="common_challenges"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">Which situations cause you the most mistakes?</FormLabel>
                      <FormDescription>You can select more than one (optional)</FormDescription>
                      <div className="space-y-3 mt-4">
                        {[
                          'Fear of missing out (FOMO)',
                          'Holding losing trades too long',
                          'Closing winners too early',
                          'Revenge trading after losses',
                          'Overtrading',
                          'Lack of discipline or patience',
                        ].map((challenge) => (
                          <FormField
                            key={challenge}
                            control={form.control}
                            name="common_challenges"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(challenge)}
                                    onCheckedChange={(checked) => {
                                      const value = field.value || [];
                                      return checked
                                        ? field.onChange([...value, challenge])
                                        : field.onChange(value.filter((v) => v !== challenge));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="flex-1 font-medium cursor-pointer">{challenge}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Step 9: Consent */}
              {currentStep === 9 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="consent_to_analyze"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-6 border rounded-lg bg-accent/50">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base font-semibold cursor-pointer">
                            I allow the AI to analyze my trade history and performance metrics
                          </FormLabel>
                          <FormDescription className="text-sm">
                            This enables deep analytics like win rate, drawdown, expectancy, and performance per pair or time of day. Your data is private and secure.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="p-6 border rounded-lg bg-primary/5">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-2">You're all set!</h4>
                        <p className="text-sm text-muted-foreground">
                          Your AI trading assistant will now provide personalized insights, behavioral guidance, and performance analytics tailored to your trading style and goals.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                type="button"
                onClick={nextStep}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Saving...'
                ) : currentStep === STEPS.length ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};