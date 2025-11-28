import { createContext, useContext, useState, ReactNode } from 'react';

interface AIAssistantContextType {
  openWithPrompt: (prompt: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  initialPrompt: string | null;
  clearInitialPrompt: () => void;
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export const AIAssistantProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);

  const openWithPrompt = (prompt: string) => {
    setInitialPrompt(prompt);
    setIsOpen(true);
  };

  const clearInitialPrompt = () => {
    setInitialPrompt(null);
  };

  return (
    <AIAssistantContext.Provider value={{ 
      openWithPrompt, 
      isOpen, 
      setIsOpen, 
      initialPrompt, 
      clearInitialPrompt 
    }}>
      {children}
    </AIAssistantContext.Provider>
  );
};

export const useAIAssistant = () => {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant must be used within AIAssistantProvider');
  }
  return context;
};
