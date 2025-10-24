import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/components/layout/AppLayout';
import { 
  Accessibility, Keyboard, Eye, Type, Volume2, 
  Navigation, MousePointer, Monitor, Smartphone
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Helmet } from 'react-helmet';

export default function AccessibilityGuide() {
  return (
    <AppLayout>
      <Helmet>
        <title>Accessibility Guide - The Trading Diary</title>
        <meta name="description" content="Learn about accessibility features and keyboard shortcuts to navigate The Trading Diary efficiently." />
      </Helmet>
      
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Accessibility className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Accessibility Guide</h1>
              <p className="text-muted-foreground">
                Making The Trading Diary accessible to everyone
              </p>
            </div>
          </div>
          
          <Card className="glass-subtle border-border/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                We are committed to making The Trading Diary accessible to all users, including those with disabilities. 
                This platform is designed to meet WCAG 2.1 AA standards, ensuring keyboard navigation, screen reader compatibility, 
                and visual accessibility features.
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="keyboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4" role="tablist" aria-label="Accessibility features">
            <TabsTrigger value="keyboard" role="tab">
              <Keyboard className="h-4 w-4 mr-2" aria-hidden="true" />
              Keyboard
            </TabsTrigger>
            <TabsTrigger value="screen-readers" role="tab">
              <Volume2 className="h-4 w-4 mr-2" aria-hidden="true" />
              Screen Readers
            </TabsTrigger>
            <TabsTrigger value="visual" role="tab">
              <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="standards" role="tab">
              <Monitor className="h-4 w-4 mr-2" aria-hidden="true" />
              Standards
            </TabsTrigger>
          </TabsList>

          {/* Keyboard Navigation */}
          <TabsContent value="keyboard" className="space-y-6" role="tabpanel" aria-labelledby="keyboard-tab">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5 text-primary" aria-hidden="true" />
                  <CardTitle>Keyboard Navigation</CardTitle>
                </div>
                <CardDescription>
                  Navigate the entire platform using only your keyboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Global Shortcuts</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm">Skip to main content</span>
                      <Badge variant="secondary" className="font-mono">Tab</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm">Open command palette</span>
                      <Badge variant="secondary" className="font-mono">Ctrl + K</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm">Navigate between sections</span>
                      <Badge variant="secondary" className="font-mono">Tab / Shift + Tab</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm">Activate focused element</span>
                      <Badge variant="secondary" className="font-mono">Enter / Space</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm">Close dialog or modal</span>
                      <Badge variant="secondary" className="font-mono">Esc</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Navigation Shortcuts</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm">Go to Dashboard</span>
                      <Badge variant="secondary" className="font-mono">G + D</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm">Go to Analytics</span>
                      <Badge variant="secondary" className="font-mono">G + A</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm">Open Settings</span>
                      <Badge variant="secondary" className="font-mono">G + S</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm">Add New Trade</span>
                      <Badge variant="secondary" className="font-mono">N + T</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Form and Table Navigation</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="font-mono bg-muted px-2 py-1 rounded">Tab</span>
                      <span>Move forward through form fields and interactive elements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono bg-muted px-2 py-1 rounded">Shift + Tab</span>
                      <span>Move backward through form fields</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono bg-muted px-2 py-1 rounded">Arrow Keys</span>
                      <span>Navigate within dropdowns, radio groups, and tables</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono bg-muted px-2 py-1 rounded">Space</span>
                      <span>Toggle checkboxes and select dropdown options</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Screen Readers */}
          <TabsContent value="screen-readers" className="space-y-6" role="tabpanel" aria-labelledby="screen-readers-tab">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-primary" aria-hidden="true" />
                  <CardTitle>Screen Reader Support</CardTitle>
                </div>
                <CardDescription>
                  Optimized for NVDA, JAWS, VoiceOver, and TalkBack
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Supported Screen Readers</h3>
                  <div className="grid gap-3">
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">NVDA (Windows)</span>
                        <Badge variant="outline">Recommended</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Free, open-source screen reader with excellent compatibility
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">JAWS (Windows)</span>
                        <Badge variant="outline">Supported</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Industry-standard commercial screen reader
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">VoiceOver (macOS/iOS)</span>
                        <Badge variant="outline">Supported</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Built-in screen reader for Apple devices
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">TalkBack (Android)</span>
                        <Badge variant="outline">Supported</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Built-in screen reader for Android devices
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">ARIA Labels & Landmarks</h3>
                  <p className="text-sm text-muted-foreground">
                    All interactive elements have descriptive ARIA labels to provide context:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside ml-4">
                    <li><strong>Navigation:</strong> Main menu, sidebar, breadcrumbs marked as navigation landmarks</li>
                    <li><strong>Forms:</strong> All inputs labeled with clear descriptions and error messages</li>
                    <li><strong>Buttons:</strong> Descriptive labels for icon-only buttons</li>
                    <li><strong>Data Tables:</strong> Column headers properly associated with cells</li>
                    <li><strong>Status Messages:</strong> Live regions announce important updates</li>
                    <li><strong>Modals:</strong> Proper focus management when opening/closing</li>
                  </ul>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Page Structure</h3>
                  <p className="text-sm text-muted-foreground">
                    Every page uses semantic HTML and proper heading hierarchy:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside ml-4">
                    <li>Single H1 per page for main title</li>
                    <li>Logical H2-H6 hierarchy for sections</li>
                    <li>Skip links to jump to main content</li>
                    <li>Semantic HTML5 elements (nav, main, article, aside)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visual Accessibility */}
          <TabsContent value="visual" className="space-y-6" role="tabpanel" aria-labelledby="visual-tab">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" aria-hidden="true" />
                  <CardTitle>Visual Accessibility</CardTitle>
                </div>
                <CardDescription>
                  Features for users with visual impairments or color blindness
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Color & Contrast</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside ml-4">
                    <li><strong>WCAG AA Compliance:</strong> All text meets minimum 4.5:1 contrast ratio</li>
                    <li><strong>Dark & Light Modes:</strong> Both themes tested for optimal contrast</li>
                    <li><strong>No Color-Only Indicators:</strong> Information conveyed through icons, text, and patterns</li>
                    <li><strong>Focus Indicators:</strong> Clear visual focus rings on all interactive elements</li>
                    <li><strong>Error States:</strong> Errors indicated by color, icons, and descriptive text</li>
                  </ul>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Text Sizing</h3>
                  <p className="text-sm text-muted-foreground">
                    Adjust text size using browser zoom or system settings:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside ml-4">
                    <li><strong>Browser Zoom:</strong> Ctrl/Cmd + Plus/Minus to increase/decrease</li>
                    <li><strong>Responsive Text:</strong> Layout adapts to increased text size</li>
                    <li><strong>No Fixed Heights:</strong> Containers expand to fit content</li>
                  </ul>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Motion & Animations</h3>
                  <p className="text-sm text-muted-foreground">
                    Respects prefers-reduced-motion system setting:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside ml-4">
                    <li>Animations disabled when reduced motion is preferred</li>
                    <li>No auto-playing videos or flashing content</li>
                    <li>Smooth scrolling can be disabled in browser settings</li>
                  </ul>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Blur & Privacy Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Built-in privacy features for public viewing:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside ml-4">
                    <li><strong>Global Blur Toggle:</strong> Blur all sensitive numbers with one click</li>
                    <li><strong>Selective Blur:</strong> Hide specific metrics (balance, P&L, ROI)</li>
                    <li><strong>Screen Reader Accessible:</strong> Blur state announced to screen readers</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Standards & Compliance */}
          <TabsContent value="standards" className="space-y-6" role="tabpanel" aria-labelledby="standards-tab">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" aria-hidden="true" />
                  <CardTitle>Standards & Compliance</CardTitle>
                </div>
                <CardDescription>
                  Our commitment to accessibility standards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">WCAG 2.1 Level AA</h3>
                  <p className="text-sm text-muted-foreground">
                    The Trading Diary is designed to meet Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
                  </p>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="perceivable">
                      <AccordionTrigger>
                        <span className="font-semibold">1. Perceivable</span>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 text-sm">
                        <p className="font-medium">Information must be presentable to users in ways they can perceive:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                          <li>All images have alt text</li>
                          <li>Color is not the only means of conveying information</li>
                          <li>Content is readable and usable with 200% zoom</li>
                          <li>Proper contrast ratios (4.5:1 minimum for normal text)</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="operable">
                      <AccordionTrigger>
                        <span className="font-semibold">2. Operable</span>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 text-sm">
                        <p className="font-medium">Interface components must be operable:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                          <li>All functionality available via keyboard</li>
                          <li>No keyboard traps</li>
                          <li>Clear focus indicators</li>
                          <li>Sufficient time for reading and interaction</li>
                          <li>Descriptive page titles and headings</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="understandable">
                      <AccordionTrigger>
                        <span className="font-semibold">3. Understandable</span>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 text-sm">
                        <p className="font-medium">Information and operation must be understandable:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                          <li>Clear and simple language</li>
                          <li>Predictable navigation and functionality</li>
                          <li>Input assistance and error prevention</li>
                          <li>Clear error messages with suggestions</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="robust">
                      <AccordionTrigger>
                        <span className="font-semibold">4. Robust</span>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 text-sm">
                        <p className="font-medium">Content must be robust enough for assistive technologies:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                          <li>Valid HTML markup</li>
                          <li>Proper ARIA labels and roles</li>
                          <li>Compatible with current and future assistive technologies</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Testing & Validation</h3>
                  <p className="text-sm text-muted-foreground">
                    We regularly test with:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside ml-4">
                    <li>Automated accessibility scanners (axe, WAVE, Lighthouse)</li>
                    <li>Manual keyboard navigation testing</li>
                    <li>Screen reader testing (NVDA, JAWS, VoiceOver)</li>
                    <li>Color contrast analyzers</li>
                    <li>User feedback from accessibility community</li>
                  </ul>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Report Accessibility Issues</h3>
                  <p className="text-sm text-muted-foreground">
                    We are committed to continuous improvement. If you encounter any accessibility barriers:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside ml-4">
                    <li>Email us at: <strong>accessibility@thetradingdiary.com</strong></li>
                    <li>Use the feedback form in Settings</li>
                    <li>Describe the issue, your assistive technology, and browser version</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    We aim to respond within 2 business days and resolve issues within 14 days.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
