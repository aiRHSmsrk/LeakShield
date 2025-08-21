import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthPromptContextValue {
  user: any;
  showPrompt: boolean;
  dismiss: () => void;
}

const AuthPromptContext = createContext<AuthPromptContextValue | undefined>(undefined);

export const AuthPromptProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setShowPrompt(false);
        setTimerStarted(false);
      } else if (!u && !timerStarted) {
        setTimerStarted(true);
        // show prompt after 45s viewing dashboard unauthenticated
        const t = setTimeout(() => setShowPrompt(true), 45000);
        return () => clearTimeout(t);
      }
    });
    return () => unsub();
  }, [timerStarted]);

  const dismiss = () => setShowPrompt(false);

  return (
    <AuthPromptContext.Provider value={{ user, showPrompt, dismiss }}>
      {children}
    </AuthPromptContext.Provider>
  );
};

export const useAuthPrompt = () => {
  const ctx = useContext(AuthPromptContext);
  if (!ctx) throw new Error('useAuthPrompt must be used within AuthPromptProvider');
  return ctx;
};
