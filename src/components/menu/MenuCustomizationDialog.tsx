import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Plus, Trash2, GripVertical, Circle, Star, TrendingUp, BarChart3, PieChart, Activity, Target, Zap, Sparkles, LineChart, TrendingDown, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GlassCard } from '@/components/ui/glass-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CustomMenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  order_index: number;
}

export const MenuCustomizationDialog = () => {
  const [open, setOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<CustomMenuItem[]>([]);
  const [newItem, setNewItem] = useState({ label: '', icon: 'Circle', route: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadMenuItems();
    }
  }, [open]);

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_menu_items')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load custom menu items',
        variant: 'destructive',
      });
    }
  };

  const addMenuItem = async () => {
    if (!newItem.label.trim()) {
      toast({
        title: 'Error',
        description: 'Menu item name is required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('custom_menu_items').insert({
        user_id: user.id,
        label: newItem.label,
        icon: newItem.icon,
        route: newItem.route || `/custom/${newItem.label.toLowerCase().replace(/\s+/g, '-')}`,
        order_index: menuItems.length,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Menu item added successfully',
      });

      setNewItem({ label: '', icon: 'Circle', route: '' });
      loadMenuItems();
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add menu item',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Menu item deleted',
      });

      loadMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete menu item',
        variant: 'destructive',
      });
    }
  };

  const iconOptions = [
    { name: 'Circle', component: Circle },
    { name: 'Star', component: Star },
    { name: 'TrendingUp', component: TrendingUp },
    { name: 'TrendingDown', component: TrendingDown },
    { name: 'BarChart3', component: BarChart3 },
    { name: 'PieChart', component: PieChart },
    { name: 'Activity', component: Activity },
    { name: 'Target', component: Target },
    { name: 'Zap', component: Zap },
    { name: 'Sparkles', component: Sparkles },
    { name: 'LineChart', component: LineChart },
    { name: 'DollarSign', component: DollarSign },
  ];

  const getIconComponent = (iconName: string) => {
    const found = iconOptions.find(opt => opt.name === iconName);
    return found ? found.component : Circle;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Customize Menu
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Navigation Menu</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Items */}
          <div>
            <h3 className="text-sm font-medium mb-3">Your Custom Menu Items</h3>
            {menuItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No custom menu items yet. Add one below!</p>
            ) : (
              <div className="space-y-2">
                {menuItems.map((item) => {
                  const IconComponent = getIconComponent(item.icon);
                  return (
                    <GlassCard key={item.id} className="p-3 flex items-center justify-between hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.route}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMenuItem(item.id)}
                        className="hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add New Item */}
          <div>
            <h3 className="text-sm font-medium mb-3">Add New Menu Item</h3>
            <GlassCard className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Menu Item Name</Label>
                <Input
                  id="label"
                  placeholder="e.g., My Custom Analytics"
                  value={newItem.label}
                  onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select value={newItem.icon} onValueChange={(value) => setNewItem({ ...newItem, icon: value })}>
                  <SelectTrigger id="icon">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const IconComponent = getIconComponent(newItem.icon);
                          return <IconComponent className="h-4 w-4" />;
                        })()}
                        <span>{newItem.icon}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((option) => (
                      <SelectItem key={option.name} value={option.name}>
                        <div className="flex items-center gap-2">
                          <option.component className="h-4 w-4" />
                          <span>{option.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="route">Route (optional)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-xs">
                          The URL path for your custom page (e.g., /my-analytics). 
                          If left blank, it will be auto-generated from your menu item name.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="route"
                  placeholder="Leave blank for auto-generated"
                  value={newItem.route}
                  onChange={(e) => setNewItem({ ...newItem, route: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Example: /custom/my-page or leave blank
                </p>
              </div>

              <Button onClick={addMenuItem} disabled={loading} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Menu Item
              </Button>
            </GlassCard>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
