import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { BookOpen, Plus, Edit2, Trash2, TrendingUp, TrendingDown, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface JournalEntry {
  id: string;
  user_id: string;
  trade_id?: string;
  title: string;
  content: string;
  mood: 'confident' | 'anxious' | 'neutral' | 'frustrated' | 'excited';
  lessons_learned: string;
  tags: string[];
  entry_date: string;
  created_at: string;
  updated_at: string;
}

export const TradingJournal = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral' as JournalEntry['mood'],
    lessons_learned: '',
    tags: '',
    entry_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false });

    if (error) {
      console.error('Error fetching journal entries:', error);
      return;
    }

    setEntries((data || []) as JournalEntry[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const entryData = {
      user_id: user.id,
      title: formData.title,
      content: formData.content,
      mood: formData.mood,
      lessons_learned: formData.lessons_learned,
      tags: tagsArray,
      entry_date: formData.entry_date,
    };

    if (editingEntry) {
      const { error } = await supabase
        .from('journal_entries')
        .update(entryData)
        .eq('id', editingEntry.id);

      if (error) {
        toast.error('Failed to update entry');
        return;
      }
      toast.success('Entry updated');
    } else {
      const { error } = await supabase
        .from('journal_entries')
        .insert(entryData);

      if (error) {
        toast.error('Failed to create entry');
        return;
      }
      toast.success('Entry created');
    }

    setIsOpen(false);
    setEditingEntry(null);
    setFormData({
      title: '',
      content: '',
      mood: 'neutral',
      lessons_learned: '',
      tags: '',
      entry_date: new Date().toISOString().split('T')[0],
    });
    fetchEntries();
  };

  const handleDelete = async (entryId: string) => {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      toast.error('Failed to delete entry');
      return;
    }

    toast.success('Entry deleted');
    fetchEntries();
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      lessons_learned: entry.lessons_learned,
      tags: entry.tags.join(', '),
      entry_date: entry.entry_date,
    });
    setIsOpen(true);
  };

  const getMoodIcon = (mood: JournalEntry['mood']) => {
    switch (mood) {
      case 'confident':
        return '😎';
      case 'anxious':
        return '😰';
      case 'neutral':
        return '😐';
      case 'frustrated':
        return '😤';
      case 'excited':
        return '🤩';
    }
  };

  const getMoodColor = (mood: JournalEntry['mood']) => {
    switch (mood) {
      case 'confident':
        return 'bg-neon-green/20 text-neon-green border-neon-green/30';
      case 'anxious':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'neutral':
        return 'bg-muted/20 text-muted-foreground border-muted/30';
      case 'frustrated':
        return 'bg-neon-red/20 text-neon-red border-neon-red/30';
      case 'excited':
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Trading Journal
          </h3>
          <p className="text-sm text-muted-foreground">
            Reflect on your trades and track your growth
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="entry_date">Date</Label>
                  <Input
                    id="entry_date"
                    type="date"
                    value={formData.entry_date}
                    onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mood">Mood</Label>
                  <Select
                    value={formData.mood}
                    onValueChange={(value: JournalEntry['mood']) =>
                      setFormData({ ...formData, mood: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confident">😎 Confident</SelectItem>
                      <SelectItem value="excited">🤩 Excited</SelectItem>
                      <SelectItem value="neutral">😐 Neutral</SelectItem>
                      <SelectItem value="anxious">😰 Anxious</SelectItem>
                      <SelectItem value="frustrated">😤 Frustrated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Great day trading BTC"
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">What happened today?</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Describe your trading session, decisions made, market conditions..."
                  rows={6}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lessons_learned">Lessons Learned</Label>
                <Textarea
                  id="lessons_learned"
                  value={formData.lessons_learned}
                  onChange={(e) =>
                    setFormData({ ...formData, lessons_learned: e.target.value })
                  }
                  placeholder="What did you learn? What would you do differently?"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., breakout, patience, FOMO"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingEntry ? 'Update Entry' : 'Create Entry'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setEditingEntry(null);
                    setFormData({
                      title: '',
                      content: '',
                      mood: 'neutral',
                      lessons_learned: '',
                      tags: '',
                      entry_date: new Date().toISOString().split('T')[0],
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No journal entries yet</p>
          <p className="text-sm">
            Start documenting your trading journey to identify patterns and improve
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card
              key={entry.id}
              className="p-4 bg-muted/20 border-border hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getMoodIcon(entry.mood)}</span>
                    <h4 className="font-semibold text-lg">{entry.title}</h4>
                    <Badge variant="outline" className={getMoodColor(entry.mood)}>
                      {entry.mood}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(entry.entry_date), 'MMMM dd, yyyy')}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(entry)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(entry.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>

                {entry.lessons_learned && (
                  <div className="border-l-2 border-primary pl-3 bg-primary/5 py-2">
                    <p className="text-xs font-semibold text-primary mb-1">Lessons Learned</p>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {entry.lessons_learned}
                    </p>
                  </div>
                )}

                {entry.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-3 h-3 text-muted-foreground" />
                    {entry.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};
