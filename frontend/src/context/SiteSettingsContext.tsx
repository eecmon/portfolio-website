import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getSettings, putSettings, type Settings } from "@/api/settingsApi";
import { applySettings } from "@/lib/applySettings";

interface SiteSettingsContextValue {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSettings()
      .then((fetched) => {
        applySettings(fetched);
        setSettings(fetched);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load settings")
      )
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      if (!settings) return;
      const next = { ...settings, ...patch };
      applySettings(next);
      setSettings(next);
      await putSettings(next);
    },
    [settings]
  );

  return (
    <SiteSettingsContext value={{ settings, loading, error, updateSettings }}>
      {children}
    </SiteSettingsContext>
  );
}

export function useSiteSettings(): SiteSettingsContextValue {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("useSiteSettings must be used inside <SiteSettingsProvider>");
  return ctx;
}
