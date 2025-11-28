import { useState, useEffect } from 'react';
import { PremiumCard } from '@/components/ui/PremiumCard';
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
import { Receipt, Plus, Edit2, Trash2, DollarSign, TrendingDown, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Expense {
  id: string;
  user_id: string;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  recurring: boolean;
  created_at: string;
}

const EXPENSE_CATEGORIES = [
  'Platform Fees',
  'Data Subscription',
  'Trading Tools',
  'Education',
  'Internet/Hardware',
  'Tax Software',
  'Other',
];

export const ExpenseTracker = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    category: 'Platform Fees',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    recurring: false,
  });

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  const fetchExpenses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('trading_expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('expense_date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      return;
    }

    setExpenses((data || []) as unknown as Expense[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const expenseData = {
      user_id: user.id,
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      expense_date: formData.expense_date,
      recurring: formData.recurring,
    };

    if (editingExpense) {
      const { error } = await supabase
        .from('trading_expenses')
        .update(expenseData)
        .eq('id', editingExpense.id);

      if (error) {
        toast.error('Failed to update expense');
        return;
      }
      toast.success('Expense updated');
    } else {
      const { error } = await supabase
        .from('trading_expenses')
        .insert(expenseData);

      if (error) {
        toast.error('Failed to add expense');
        return;
      }
      toast.success('Expense added');
    }

    setIsOpen(false);
    setEditingExpense(null);
    setFormData({
      category: 'Platform Fees',
      description: '',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0],
      recurring: false,
    });
    fetchExpenses();
  };

  const handleDelete = async (expenseId: string) => {
    const { error } = await supabase
      .from('trading_expenses')
      .delete()
      .eq('id', expenseId);

    if (error) {
      toast.error('Failed to delete expense');
      return;
    }

    toast.success('Expense deleted');
    fetchExpenses();
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      expense_date: expense.expense_date,
      recurring: expense.recurring,
    });
    setIsOpen(true);
  };

  // Calculate summary
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlyRecurring = expenses
    .filter(e => e.recurring)
    .reduce((sum, e) => sum + e.amount, 0);

  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <PremiumCard className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Trading Expenses
          </h3>
          <p className="text-sm text-muted-foreground">
            Track your trading-related costs
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expense_date">Date</Label>
                  <Input
                    id="expense_date"
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="49.99"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., TradingView Pro subscription"
                  rows={3}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.recurring}
                  onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="recurring" className="cursor-pointer">
                  Recurring monthly expense
                </Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setEditingExpense(null);
                    setFormData({
                      category: 'Platform Fees',
                      description: '',
                      amount: '',
                      expense_date: new Date().toISOString().split('T')[0],
                      recurring: false,
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <PremiumCard className="p-4 bg-neon-red/10 border-neon-red/30">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-neon-red" />
            <span className="text-xs text-muted-foreground">Total Expenses</span>
          </div>
          <div className="text-2xl font-bold text-neon-red">
            -${totalExpenses.toFixed(2)}
          </div>
        </PremiumCard>

        <PremiumCard className="p-4 bg-primary/10 border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Monthly Recurring</span>
          </div>
          <div className="text-2xl font-bold">
            ${monthlyRecurring.toFixed(2)}/mo
          </div>
        </PremiumCard>

        <PremiumCard className="p-4 bg-muted/20 border-border">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total Items</span>
          </div>
          <div className="text-2xl font-bold">
            {expenses.length}
          </div>
        </PremiumCard>
      </div>

      {/* Category Breakdown */}
      {Object.keys(expensesByCategory).length > 0 && (
        <PremiumCard className="p-4 bg-muted/20 border-border mb-6">
          <h4 className="font-semibold mb-3 text-sm">Expenses by Category</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <div key={category} className="flex flex-col">
                <span className="text-xs text-muted-foreground mb-1">{category}</span>
                <span className="text-sm font-medium">${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </PremiumCard>
      )}

      {/* Expense List */}
      {expenses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No expenses tracked yet</p>
          <p className="text-sm">
            Start tracking your trading costs to calculate true net profit
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <PremiumCard
              key={expense.id}
              className="p-4 bg-muted/20 border-border hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{expense.category}</Badge>
                    {expense.recurring && (
                      <Badge variant="secondary" className="text-xs">
                        Recurring
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm mb-1">{expense.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(expense.expense_date), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-right">
                    <div className="text-lg font-bold text-neon-red">
                      -${expense.amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(expense)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(expense.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </PremiumCard>
          ))}
        </div>
      )}
    </PremiumCard>
  );
};
