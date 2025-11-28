import { useState } from 'react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const PlanChecklist = () => {
    const [items, setItems] = useState([
        { id: 1, text: 'Check daily trend', checked: false },
        { id: 2, text: 'Identify key support/resistance', checked: false },
        { id: 3, text: 'Check news calendar', checked: false },
    ]);
    const [newItem, setNewItem] = useState('');

    const toggleItem = (id: number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    const addItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.trim()) return;
        setItems([...items, { id: Date.now(), text: newItem, checked: false }]);
        setNewItem('');
    };

    const deleteItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    return (
        <PremiumCard className="p-6">
            <h2 className="text-2xl font-bold mb-6">Pre-Trade Checklist</h2>

            <div className="space-y-4 mb-6">
                {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <Checkbox
                            id={`item-${item.id}`}
                            checked={item.checked}
                            onCheckedChange={() => toggleItem(item.id)}
                        />
                        <Label
                            htmlFor={`item-${item.id}`}
                            className={`flex-1 cursor-pointer ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                        >
                            {item.text}
                        </Label>
                        <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <form onSubmit={addItem} className="flex gap-2">
                <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add new checklist item..."
                />
                <Button type="submit" size="icon">
                    <Plus className="h-4 w-4" />
                </Button>
            </form>
        </PremiumCard>
    );
};
