import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Share2, TrendingUp, TrendingDown } from 'lucide-react';
import { ShareTradeCard } from '@/components/social/ShareTradeCard';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  trade?: {
    symbol: string;
    type: 'long' | 'short';
    profit: number;
    profitPercent: number;
  };
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      name: 'John Trader',
      avatar: '/placeholder.svg',
      username: '@johntrader',
    },
    content: 'Just closed a great position on BTC! +15% in 3 days. Market momentum is strong! 🚀',
    timestamp: '2 hours ago',
    likes: 24,
    comments: 8,
    shares: 3,
    trade: {
      symbol: 'BTC/USD',
      type: 'long',
      profit: 1250,
      profitPercent: 15.2,
    },
  },
  {
    id: '2',
    author: {
      name: 'Sarah Pro',
      avatar: '/placeholder.svg',
      username: '@sarahpro',
    },
    content: 'Key support level holding on ETH. Looking for a bounce here. What do you all think?',
    timestamp: '5 hours ago',
    likes: 42,
    comments: 15,
    shares: 7,
  },
];

export default function SocialFeed() {
  const [posts] = useState<Post[]>(mockPosts);
  const [newPost, setNewPost] = useState('');

  const handlePost = () => {
    console.log('Posting:', newPost);
    setNewPost('');
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Trading Community</h1>
          <Button variant="outline">Filter</Button>
        </div>

        {/* Create Post */}
        <Card className="p-4">
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Share your trading insights..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Attach Trade
                  </Button>
                  <Button variant="outline" size="sm">
                    Add Chart
                  </Button>
                </div>
                <Button onClick={handlePost} disabled={!newPost.trim()}>
                  Post
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{post.author.name}</span>
                      <span className="text-muted-foreground text-sm">
                        {post.author.username}
                      </span>
                      <span className="text-muted-foreground text-sm">·</span>
                      <span className="text-muted-foreground text-sm">
                        {post.timestamp}
                      </span>
                    </div>
                  </div>

                  <p className="text-foreground">{post.content}</p>

                  {post.trade && (
                    <Card className="p-4 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {post.trade.type === 'long' ? (
                            <TrendingUp className="w-5 h-5 text-success" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-destructive" />
                          )}
                          <div>
                            <div className="font-semibold">{post.trade.symbol}</div>
                            <div className="text-sm text-muted-foreground">
                              {post.trade.type.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-success">
                            +${post.trade.profit.toLocaleString()}
                          </div>
                          <div className="text-sm text-success">
                            +{post.trade.profitPercent}%
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  <div className="flex gap-6 pt-2">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Heart className="w-4 h-4" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      {post.shares}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
