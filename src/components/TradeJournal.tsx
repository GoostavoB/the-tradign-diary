import { useState } from 'react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Plus, Calendar } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface JournalEntry {
  id: string;
  date: Date;
  trade: string;
  notes: string;
  emotions: string;
  lessons: string;
}

export const TradeJournal = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({
    trade: '',
    notes: '',
    emotions: '',
    lessons: ''
  });

  const handleSubmit = () => {
    if (!newEntry.trade || !newEntry.notes) {
      toast({
        title: t('common.error'),
        description: t('journal.fillRequired'),
        variant: 'destructive'
      });
      return;
    }

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date(),
      ...newEntry
    };

    setEntries([entry, ...entries]);
    setNewEntry({ trade: '', notes: '', emotions: '', lessons: '' });
    setIsAdding(false);

    toast({
      title: t('common.success'),
      description: t('journal.entrySaved')
    });
  };

  return (
    <PremiumCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">{t('journal.title')}</h2>
        </div>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('journal.newEntry')}
        </Button>
      </div>

      {isAdding && (
        <PremiumCard className="p-4 mb-4 bg-muted/50">
          <div className="space-y-4">
            <div>
              <Label htmlFor="trade">{t('journal.tradePair')} *</Label>
              <Input
                id="trade"
                value={newEntry.trade}
                onChange={(e) => setNewEntry({ ...newEntry, trade: e.target.value })}
                placeholder="BTC/USDT"
              />
            </div>
            <div>
              <Label htmlFor="notes">{t('journal.notes')} *</Label>
              <Textarea
                id="notes"
                value={newEntry.notes}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                placeholder={t('journal.notesPlaceholder')}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="emotions">{t('journal.emotions')}</Label>
              <Input
                id="emotions"
                value={newEntry.emotions}
                onChange={(e) => setNewEntry({ ...newEntry, emotions: e.target.value })}
                placeholder={t('journal.emotionsPlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="lessons">{t('journal.lessons')}</Label>
              <Textarea
                id="lessons"
                value={newEntry.lessons}
                onChange={(e) => setNewEntry({ ...newEntry, lessons: e.target.value })}
                placeholder={t('journal.lessonsPlaceholder')}
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit}>{t('common.save')}</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </PremiumCard>
      )}

      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{t('journal.noEntries')}</p>
          </div>
        ) : (
          entries.map((entry) => (
            <PremiumCard key={entry.id} className="p-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{entry.trade}</h3>
                    <span className="text-sm text-muted-foreground">
                      {format(entry.date, 'PPp')}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{entry.notes}</p>
                  {entry.emotions && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">{t('journal.emotions')}:</span> {entry.emotions}
                    </p>
                  )}
                  {entry.lessons && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">{t('journal.lessons')}:</span> {entry.lessons}
                    </p>
                  )}
                </div>
              </div>
            </PremiumCard>
          ))
        )}
      </div>
    </PremiumCard>
  );
};
