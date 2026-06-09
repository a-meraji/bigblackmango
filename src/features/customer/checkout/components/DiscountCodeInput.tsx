import { useState } from 'react';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import { validateDiscountCode } from '@api/discount-codes';
import type { DiscountValidationResult } from '@t/discount-code';
import styles from './DiscountCodeInput.module.css';

const ERROR_MESSAGES: Record<string, string> = {
  DISCOUNT_CODE_INVALID: 'کد تخفیف معتبر نیست.',
  DISCOUNT_CODE_NOT_APPLICABLE: 'این کد تخفیف برای سفارش شما قابل استفاده نیست.',
  DISCOUNT_CODE_EXPIRED: 'کد تخفیف منقضی شده است.',
  DISCOUNT_CODE_USAGE_LIMIT: 'سقف استفاده از این کد تخفیف تکمیل شده است.',
};

interface Props {
  appliedCode: string | null;
  onApplied: (result: DiscountValidationResult) => void;
  onClear: () => void;
  disabled?: boolean;
}

export default function DiscountCodeInput({
  appliedCode,
  onApplied,
  onClear,
  disabled = false,
}: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleApply() {
    const trimmed = code.trim();
    if (!trimmed) {
      setError('کد تخفیف را وارد کنید.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await validateDiscountCode(trimmed);
      onApplied(result);
      setCode('');
    } catch (err: unknown) {
      const apiErr = err as { code?: string; message?: string };
      setError(ERROR_MESSAGES[apiErr.code ?? ''] ?? apiErr.message ?? 'خطا در اعمال کد تخفیف.');
    } finally {
      setLoading(false);
    }
  }

  if (appliedCode) {
    return (
      <div className={styles.field}>
        <span className={styles.label}>کد تخفیف</span>
        <div className={styles.appliedRow}>
          <span className={styles.appliedCode} dir="ltr">
            {appliedCode}
          </span>
          <button
            type="button"
            className={styles.removeBtn}
            onClick={onClear}
            disabled={disabled}
          >
            حذف
          </button>
        </div>
        <p className={styles.success} role="status">
          کد تخفیف اعمال شد.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.field}>
      <span className={styles.label}>کد تخفیف</span>
      <div className={styles.row}>
        <div className={styles.inputWrap}>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="مثلاً SUMMER20"
            dir="ltr"
            disabled={disabled || loading}
            error={error || undefined}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handleApply()}
          loading={loading}
          disabled={disabled}
        >
          اعمال
        </Button>
      </div>
    </div>
  );
}
