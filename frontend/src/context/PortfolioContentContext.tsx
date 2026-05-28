import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getContent, putContent, type Content } from "@/api/contentApi";

interface PortfolioContentContextValue {
  content: Content | null;
  loading: boolean;
  error: string | null;
  updateContent: (patch: Partial<Content>) => Promise<void>;
}

const PortfolioContentContext = createContext<PortfolioContentContextValue | null>(null);

export function PortfolioContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getContent()
      .then(setContent)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load content")
      )
      .finally(() => setLoading(false));
  }, []);

  const updateContent = useCallback(
    async (patch: Partial<Content>) => {
      if (!content) return;
      const next = { ...content, ...patch };
      setContent(next);
      await putContent(next);
    },
    [content]
  );

  return (
    <PortfolioContentContext value={{ content, loading, error, updateContent }}>
      {children}
    </PortfolioContentContext>
  );
}

export function usePortfolioContent(): PortfolioContentContextValue {
  const ctx = useContext(PortfolioContentContext);
  if (!ctx) throw new Error("usePortfolioContent must be used inside <PortfolioContentProvider>");
  return ctx;
}
