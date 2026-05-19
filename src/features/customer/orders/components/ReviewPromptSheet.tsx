import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getReviewPrompts, dismissReviewPrompt } from '@api/orders';
import { submitReviews } from '@api/reviews';
import { useAuthStore } from '@store/auth.store';
import StarPickerRow from './StarPickerRow';
import styles from './ReviewPromptSheet.module.css';

export default function ReviewPromptSheet() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const qc = useQueryClient();
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [ratings, setRatings] = useState<Record<string, { rating: number; comment: string }>>({});
  const [submitting, setSubmitting] = useState(false);

  const { data: prompts } = useQuery({
    queryKey: ['review-prompts'],
    queryFn: getReviewPrompts,
    enabled: isAuthenticated,
  });

  const unshown = prompts?.filter((p) => !p.promptShown) ?? [];
  const currentPrompt = unshown[activePromptIndex];

  useEffect(() => {
    if (unshown.length > 0) setIsVisible(true);
  }, [unshown.length]);

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

  async function advanceOrClose() {
    if (activePromptIndex < unshown.length - 1) {
      setActivePromptIndex((i) => i + 1);
    } else {
      setIsVisible(false);
    }
    qc.invalidateQueries({ queryKey: ['review-prompts'] });
  }

  async function handleDismiss() {
    if (currentPrompt) await dismissReviewPrompt(currentPrompt.orderId);
    await advanceOrClose();
  }

  async function handleSubmit() {
    if (!currentPrompt) return;
    setSubmitting(true);
    try {
      const items = currentPrompt.foods.map((f) => ({
        foodId: f.foodId,
        rating: ratings[f.foodId]?.rating ?? 0,
        comment: ratings[f.foodId]?.comment,
      }));
      await submitReviews(currentPrompt.orderId, items);
      await dismissReviewPrompt(currentPrompt.orderId);
      await advanceOrClose();
    } finally {
      setSubmitting(false);
    }
  }

  if (!isVisible || !currentPrompt) return null;

  const allRated = currentPrompt.foods.every((f) => (ratings[f.foodId]?.rating ?? 0) > 0);

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="ثبت نظر">
      <div className={styles.shell}>
        <div className={styles.sheet}>
        <h2 className={styles.title}>نظر شما درباره سفارش {currentPrompt.trackingCode}</h2>
        <p className={styles.subtitle}>چند ثانیه وقت دارید؟ امتیاز بدهید.</p>

        {currentPrompt.foods.map((food) => (
          <StarPickerRow
            key={food.foodId}
            foodName={food.name}
            value={ratings[food.foodId]?.rating ?? 0}
            comment={ratings[food.foodId]?.comment ?? ''}
            onChange={(rating, comment) =>
              setRatings((r) => ({ ...r, [food.foodId]: { rating, comment } }))
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
