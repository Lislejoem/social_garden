'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface UserSettings {
  userName: string | null;
}

interface UserSettingsContextValue {
  settings: UserSettings;
  isLoading: boolean;
  updateUserName: (userName: string | null) => Promise<void>;
}

const defaultSettings: UserSettings = {
  userName: null,
};

const UserSettingsContext = createContext<UserSettingsContextValue | null>(null);

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings({ userName: data.userName });
        }
      } catch (error) {
        console.error('Failed to fetch user settings:', error);
        // Keep default settings on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateUserName = useCallback(async (userName: string | null) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update settings');
      }

      const data = await response.json();
      setSettings({ userName: data.userName });
    } catch (error) {
      console.error('Failed to update user settings:', error);
      throw error; // Re-throw so caller can handle
    }
  }, []);

  return (
    <UserSettingsContext.Provider value={{ settings, isLoading, updateUserName }}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings(): UserSettingsContextValue {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
}
