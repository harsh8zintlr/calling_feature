import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CallerDeskConfig {
  authCode: string;
  isConfigured: boolean;
}

interface CallerDeskContextType {
  config: CallerDeskConfig;
  setAuthCode: (authCode: string) => void;
  clearConfig: () => void;
}

const CallerDeskContext = createContext<CallerDeskContextType | undefined>(undefined);

export function CallerDeskProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<CallerDeskConfig>(() => {
    const saved = localStorage.getItem('callerdesk_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { authCode: parsed.authCode || '', isConfigured: !!parsed.authCode };
    }
    return { authCode: '', isConfigured: false };
  });

  const setAuthCode = useCallback((authCode: string) => {
    const newConfig = { authCode, isConfigured: !!authCode };
    setConfig(newConfig);
    localStorage.setItem('callerdesk_config', JSON.stringify(newConfig));
  }, []);

  const clearConfig = useCallback(() => {
    setConfig({ authCode: '', isConfigured: false });
    localStorage.removeItem('callerdesk_config');
  }, []);

  return (
    <CallerDeskContext.Provider value={{ config, setAuthCode, clearConfig }}>
      {children}
    </CallerDeskContext.Provider>
  );
}

export function useCallerDesk() {
  const context = useContext(CallerDeskContext);
  if (context === undefined) {
    throw new Error('useCallerDesk must be used within a CallerDeskProvider');
  }
  return context;
}
