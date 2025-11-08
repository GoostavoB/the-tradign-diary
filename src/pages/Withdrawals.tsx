import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { TrendingDown, Calendar, Edit2, Trash2, Plus, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatNumberInput, parseDecimalInput } from '@/utils/numberFormatting';
import { getFinancialColor } from '@/lib/utils';
import { usePageMeta } from '@/hooks/usePageMeta';
import { pageMeta } from '@/utils/seoHelpers';

interface WithdrawalEntry {
  id: string;
  amount_withdrawn: number;
  withdrawal_date: string;
  total_after: number;
  notes: string | null;
  created_at: string;
}

const Withdrawals = () => {
  usePageMeta(pageMeta.withdrawals);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalEntry[]>([]);
  const [currentMargin, setCurrentMargin] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WithdrawalEntry | null>(null);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [withdrawalDate, setWithdrawalDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user) {
      fetchWithdrawals();
      calculateCurrentMargin();
    }
  }, [user]);

  const calculateCurrentMargin = async () => {
    if (!user) return;

    // Get total deposits from capital_log
    const { data: deposits } = await supabase
      .from('capital_log')
      .select('amount_added')
      .eq('user_id', user.id);

    const totalDeposits = deposits?.reduce((sum, d) => sum + Number(d.amount_added), 0) || 0;

    // Get total withdrawals
    const { data: withdrawalsData } = await supabase
      .from('withdrawal_log')
      .select('amount_withdrawn')
      .eq('user_id', user.id);

    const totalWithdrawals = withdrawalsData?.reduce((sum, w) => sum + Number(w.amount_withdrawn), 0) || 0;
    setTotalWithdrawn(totalWithdrawals);

    // Get total P&L from trades
    const { data: trades } = await supabase
      .from('trades')
      .select('profit_loss')
      .eq('user_id', user.id)
      .is('deleted_at', null);

    const totalPnL = trades?.reduce((sum, t) => sum + (Number(t.profit_loss) || 0), 0) || 0;

    // Current margin = deposits + P&L - withdrawals
    const margin = totalDeposits + totalPnL - totalWithdrawals;
    setCurrentMargin(margin);
  };

  const fetchWithdrawals = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('withdrawal_log')
        .select('*')
        .eq('user_id', user.id)
        .order('withdrawal_date', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error('Failed to load withdrawal history');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsedAmount = parseDecimalInput(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }

    setLoading(true);
    try {
      // Calculate new total after withdrawal
      const totalAfter = currentMargin - parsedAmount;

      if (editingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('withdrawal_log')
          .update({
            amount_withdrawn: parsedAmount,
            withdrawal_date: withdrawalDate,
            total_after: totalAfter,
            notes: notes || null,
          })
          .eq('id', editingEntry.id);

        if (error) throw error;
        toast.success('Withdrawal updated successfully');
      } else {
        // Insert new entry
        const { error } = await supabase
          .from('withdrawal_log')
          .insert({
            user_id: user.id,
            amount_withdrawn: parsedAmount,
            withdrawal_date: withdrawalDate,
            total_after: totalAfter,
            notes: notes || null,
          });

        if (error) throw error;
        toast.success('Withdrawal recorded successfully');
      }

      // Reset form
      setAmount('');
      setWithdrawalDate(format(new Date(), 'yyyy-MM-dd'));
      setNotes('');
      setEditingEntry(null);
      setIsAddDialogOpen(false);

      // Refresh data
      await fetchWithdrawals();
      await calculateCurrentMargin();
    } catch (error) {
      console.error('Error saving withdrawal:', error);
      toast.error('Failed to save withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry: WithdrawalEntry) => {
    setEditingEntry(entry);
    setAmount(entry.amount_withdrawn.toString());
    setWithdrawalDate(entry.withdrawal_date);
    setNotes(entry.notes || '');
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this withdrawal record?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('withdrawal_log')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Withdrawal deleted successfully');
      
      await fetchWithdrawals();
      await calculateCurrentMargin();
    } catch (error) {
      console.error('Error deleting withdrawal:', error);
      toast.error('Failed to delete withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setEditingEntry(null);
    setAmount('');
    setWithdrawalDate(format(new Date(), 'yyyy-MM-dd'));
    setNotes('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Withdrawals</h1>
            <p className="text-muted-foreground">Track your capital withdrawals for accurate margin calculations</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingEntry(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Withdrawal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? 'Edit Withdrawal' : 'Record New Withdrawal'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount Withdrawn *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-9"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="date">Withdrawal Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      value={withdrawalDate}
                      onChange={(e) => setWithdrawalDate(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tax withdrawal, profit taking, etc."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Saving...' : editingEntry ? 'Update' : 'Record Withdrawal'}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 glass">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Margin Available</p>
                <p className={`text-2xl font-bold ${getFinancialColor(currentMargin)}`}>
                  ${formatNumberInput(currentMargin)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-neon-red/10 rounded-lg">
                <TrendingDown className="h-6 w-6 text-neon-red" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Withdrawn</p>
                <p className="text-2xl font-bold text-neon-red">
                  ${formatNumberInput(totalWithdrawn)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Withdrawals</p>
                <p className="text-2xl font-bold">
                  {withdrawals.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Withdrawal History */}
        <Card className="glass">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold">Withdrawal History</h2>
          </div>
          
          {loading && withdrawals.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading withdrawal history...
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No withdrawals recorded yet</p>
              <p className="text-sm mt-2">Start tracking your capital withdrawals for accurate margin calculations</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {withdrawals.map((entry) => (
                <div key={entry.id} className="p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-neon-red/10 rounded">
                          <TrendingDown className="h-4 w-4 text-neon-red" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg text-neon-red">
                            -${formatNumberInput(entry.amount_withdrawn)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(entry.withdrawal_date), 'MMMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground mt-2 ml-12">
                          {entry.notes}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-2 ml-12">
                        Balance after: ${formatNumberInput(entry.total_after)}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
  );
};

export default Withdrawals;
