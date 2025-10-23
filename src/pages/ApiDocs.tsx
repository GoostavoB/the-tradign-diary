import { Helmet } from 'react-helmet';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Key, Book, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ApiDocs() {
  return (
    <>
      <Helmet>
        <title>API Documentation - The Trading Diary</title>
        <meta name="description" content="Complete API documentation for The Trading Diary platform." />
      </Helmet>

      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
            <p className="text-muted-foreground">
              Integrate The Trading Diary with your applications
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Key className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">REST API</p>
                  <p className="text-sm text-muted-foreground">Full access</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-full">
                  <Zap className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-lg font-bold">Webhooks</p>
                  <p className="text-sm text-muted-foreground">Real-time events</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Book className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-lg font-bold">SDKs</p>
                  <p className="text-sm text-muted-foreground">Multiple languages</p>
                </div>
              </div>
            </Card>
          </div>

          <Tabs defaultValue="getting-started" className="w-full">
            <TabsList>
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="authentication">Authentication</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>

            <TabsContent value="getting-started" className="space-y-4 mt-6">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Base URL</h3>
                    <code className="block bg-muted p-3 rounded-lg text-sm">
                      https://api.thetradingdiary.com/v1
                    </code>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Rate Limits</h3>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Free tier: 100 requests/hour</li>
                      <li>Pro tier: 1,000 requests/hour</li>
                      <li>Enterprise: Unlimited</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Get Your API Key</h3>
                    <Button>
                      <Key className="mr-2 h-4 w-4" />
                      Generate API Key
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="authentication" className="space-y-4 mt-6">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    All API requests must include your API key in the Authorization header:
                  </p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{`curl -X GET https://api.thetradingdiary.com/v1/trades \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</code>
                  </pre>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-4 mt-6">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">API Endpoints</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Trades</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs font-mono">
                          GET
                        </span>
                        <code className="text-sm">/trades</code>
                        <span className="text-sm text-muted-foreground">List all trades</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded text-xs font-mono">
                          POST
                        </span>
                        <code className="text-sm">/trades</code>
                        <span className="text-sm text-muted-foreground">Create a trade</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs font-mono">
                          GET
                        </span>
                        <code className="text-sm">/trades/:id</code>
                        <span className="text-sm text-muted-foreground">Get trade details</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs font-mono">
                          PUT
                        </span>
                        <code className="text-sm">/trades/:id</code>
                        <span className="text-sm text-muted-foreground">Update a trade</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded text-xs font-mono">
                          DEL
                        </span>
                        <code className="text-sm">/trades/:id</code>
                        <span className="text-sm text-muted-foreground">Delete a trade</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs font-mono">
                          GET
                        </span>
                        <code className="text-sm">/analytics/performance</code>
                        <span className="text-sm text-muted-foreground">Get performance metrics</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs font-mono">
                          GET
                        </span>
                        <code className="text-sm">/analytics/statistics</code>
                        <span className="text-sm text-muted-foreground">Get trading statistics</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-4 mt-6">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Webhooks</h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Subscribe to real-time events from The Trading Diary platform.
                  </p>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Available Events</h3>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li><code>trade.created</code> - New trade added</li>
                      <li><code>trade.updated</code> - Trade modified</li>
                      <li><code>trade.deleted</code> - Trade removed</li>
                      <li><code>alert.triggered</code> - Price alert triggered</li>
                      <li><code>achievement.unlocked</code> - New achievement earned</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </>
  );
}
