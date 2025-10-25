import { useState } from 'react';
import { ChevronDown, Plus, Copy, Edit, Trash2, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAccount } from '@/contexts/AccountContext';
import { CreateAccountDialog } from './CreateAccountDialog';
import { DuplicateAccountDialog } from './DuplicateAccountDialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const AccountSwitcher = () => {
  const { accounts, activeAccount, switchAccount, isLoading } = useAccount();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleSwitchAccount = async (accountId: string) => {
    if (accountId === activeAccount?.id) return;
    
    try {
      await switchAccount(accountId);
      toast.success('Account switched successfully');
    } catch (error) {
      toast.error('Failed to switch account');
    }
  };

  if (isLoading) {
    return (
      <div className="h-9 w-40 bg-muted/50 animate-pulse rounded-md" />
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            {activeAccount?.color && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activeAccount.color }}
              />
            )}
            <span className="max-w-32 truncate">{activeAccount?.name || 'Select Account'}</span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {accounts.map((account) => (
            <DropdownMenuItem
              key={account.id}
              onClick={() => handleSwitchAccount(account.id)}
              className="gap-2"
            >
              {account.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: account.color }}
                />
              )}
              <span className="flex-1 truncate">{account.name}</span>
              {account.type && (
                <span className="text-xs text-muted-foreground">{account.type}</span>
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Account
          </DropdownMenuItem>
          
          {activeAccount && (
            <DropdownMenuItem onClick={() => setDuplicateDialogOpen(true)}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate Account
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={() => navigate('/settings/accounts')}>
            <Settings className="w-4 h-4 mr-2" />
            Manage Accounts
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateAccountDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      
      {activeAccount && (
        <DuplicateAccountDialog
          open={duplicateDialogOpen}
          onOpenChange={setDuplicateDialogOpen}
          sourceAccount={activeAccount}
        />
      )}
    </>
  );
};
