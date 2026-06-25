import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  dismissReviewPrompt,
  getPendingReviewPrompts,
  getReviewPromptForOrder,
  type ReviewPrompt,
} from '@api/orders';
import { submitReviews } from '@api/reviews';
import { useToast } from '@hooks/useToast';
import { useAuthStore } from '@store/auth.store';
import { useReviewPrompt } from '../context/ReviewPromptContext';
import StarPickerRow from './StarPickerRow';
import styles from './ReviewPromptSheet.module.css';

const REVIEW_PROMPTS_QUERY_KEY = ['review-prompts'] as const;

export default function ReviewPromptSheet() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { manualOrderId, clearManualOrder } = useReviewPrompt();
  const toast = useToast();
  const qc = useQueryClient();
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [ratings, setRatings] = useState<Record<string, { rating: number; comment: string }>>({});
  const [submitting, setSubmitting] = useState(false);

  const { data: autoPrompts = [] } = useQuery({
    queryKey: REVIEW_PROMPTS_QUERY_KEY,
    queryFn: getPendingReviewPrompts,
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });

  const { data: manualPrompt } = useQuery({
    queryKey: ['review-prompt-manual', manualOrderId],
    queryFn: () => getReviewPromptForOrder(manualOrderId!),
    enabled: isAuthenticated && Boolean(manualOrderId),
  });

  const prompts = useMemo<ReviewPrompt[]>(() => {
    if (manualOrderId) {
      return manualPrompt ? [manualPrompt] : [];
    }
    return autoPrompts;
  }, [manualOrderId, manualPrompt, autoPrompts]);

  const currentPrompt = prompts[activePromptIndex];

  useEffect(() => {
    setActivePromptIndex(0);
  }, [manualOrderId, autoPrompts.length]);

  useEffect(() => {
    if (prompts.length > 0) {
      setIsVisible(true);
      return;
    }
    setIsVisible(false);
  }, [prompts.length]);

  useEffect(() => {
    if (!manualOrderId || manualPrompt !== null) {
      return;
    }
    clearManualOrder();
    toast.info('مهلت ثبت نظر این سفارش به پایان رسیده است.');
  }, [manualOrderId, manualPrompt, clearManualOrder, toast]);

  useEffect(() => {
    if (!isVisible) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isVisible]);

  useEffect(() => {
    setRatings({});
  }, [currentPrompt?.orderId]);

  async function invalidateReviewQueries() {
    await Promise.all([
      qc.invalidateQueries({ queryKey: REVIEW_PROMPTS_QUERY_KEY }),
      qc.invalidateQueries({ queryKey: ['orders'] }),
      qc.invalidateQueries({ queryKey: ['review-prompt-manual'] }),
    ]);
  }

  async function advanceOrClose() {
    if (activePromptIndex < prompts.length - 1) {
      setActivePromptIndex((index) => index + 1);
      await invalidateReviewQueries();
      return;
    }

    setIsVisible(false);
    clearManualOrder();
    await invalidateReviewQueries();
  }

  async function handleDismiss() {
    if (currentPrompt && !manualOrderId) {
      await dismissReviewPrompt(currentPrompt.orderId);
    }
    await advanceOrClose();
  }

  async function handleSubmit() {
    if (!currentPrompt) return;
    setSubmitting(true);
    try {
      const items = currentPrompt.foods.map((food) => ({
        foodId: food.foodId,
        rating: ratings[food.foodId]?.rating ?? 0,
        comment: ratings[food.foodId]?.comment,
      }));
      await submitReviews(currentPrompt.orderId, items);
      await advanceOrClose();
    } finally {
      setSubmitting(false);
    }
  }

  if (!isVisible || !currentPrompt) return null;

  const allRated = currentPrompt.foods.every((food) => (ratings[food.foodId]?.rating ?? 0) > 0);

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="ثبت نظر سفارش قبلی">
      <div className={styles.shell}>
        <div className={styles.sheet}>
          <h2 className={styles.title}>سفارش قبلی‌تان چطور بود؟</h2>
          <p className={styles.subtitle}>به غذاهای این سفارش امتیاز دهید.</p>

          {currentPrompt.foods.map((food) => (
            <StarPickerRow
              key={food.foodId}
              foodName={food.name}
              value={ratings[food.foodId]?.rating ?? 0}
              comment={ratings[food.foodId]?.comment ?? ''}
              onChange={(rating, comment) =>
                setRatings((prev) => ({ ...prev, [food.foodId]: { rating, comment } }))
              }
            />
          ))}

          <div className={styles.actions}>
            <button type="button" className={styles.skipBtn} onClick={() => void handleDismiss()}>
              بعداً
            </button>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={() => void handleSubmit()}
              disabled={submitting || !allRated}
            >
              {submitting ? 'در حال ارسال...' : 'ثبت نظر'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
