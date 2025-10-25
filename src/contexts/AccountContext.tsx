import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Account {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  type: string | null;
  color: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

interface AccountContextType {
  accounts: Account[];
  activeAccount: Account | null;
  isLoading: boolean;
  switchAccount: (accountId: string) => Promise<void>;
  refetchAccounts: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccounts = async () => {
    if (!user) {
      setAccounts([]);
      setActiveAccountId(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('accounts', {
        method: 'GET',
      });

      if (error) throw error;

      setAccounts(data.accounts || []);
      setActiveAccountId(data.activeAccountId);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchAccount = async (accountId: string) => {
    try {
      const { error } = await supabase.functions.invoke('accounts', {
        method: 'POST',
        body: {},
        // Using the path parameter approach
      });

      if (error) throw error;

      // Direct API call for activation
      const { error: activateError } = await supabase.functions.invoke(
        `accounts/${accountId}/activate`,
        { method: 'POST' }
      );

      if (activateError) throw activateError;

      setActiveAccountId(accountId);
      
      // Reload the page to refresh all data with new account context
      window.location.reload();
    } catch (error) {
      console.error('Error switching account:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAccounts();

    // Subscribe to account changes
    const channel = supabase
      .channel('account-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accounts',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchAccounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const activeAccount = accounts.find((acc) => acc.id === activeAccountId) || null;

  return (
    <AccountContext.Provider
      value={{
        accounts,
        activeAccount,
        isLoading,
        switchAccount,
        refetchAccounts: fetchAccounts,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};
