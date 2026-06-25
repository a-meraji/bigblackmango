import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface ReviewPromptContextValue {
  openForOrder: (orderId: string) => void;
  manualOrderId: string | null;
  clearManualOrder: () => void;
}

const ReviewPromptContext = createContext<ReviewPromptContextValue | null>(null);

export function ReviewPromptProvider({ children }: { children: ReactNode }) {
  const [manualOrderId, setManualOrderId] = useState<string | null>(null);

  const openForOrder = useCallback((orderId: string) => {
    setManualOrderId(orderId);
  }, []);

  const clearManualOrder = useCallback(() => {
    setManualOrderId(null);
  }, []);

  const value = useMemo(
    () => ({
      openForOrder,
      manualOrderId,
      clearManualOrder,
    }),
    [openForOrder, manualOrderId, clearManualOrder],
  );

  return (
    <ReviewPromptContext.Provider value={value}>{children}</ReviewPromptContext.Provider>
  );
}

export function useReviewPrompt() {
  const context = useContext(ReviewPromptContext);
  if (!context) {
    throw new Error('useReviewPrompt must be used within ReviewPromptProvider');
  }
  return context;
}
