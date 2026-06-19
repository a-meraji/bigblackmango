import { useState } from 'react';
import clsx from 'clsx';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import FormErrorBanner from '@components/form-error-banner/FormErrorBanner';
import { JalaliDateTimePicker } from '@/components/jalali-date-picker';
import {
  adminCreateDiscountCode,
  adminGenerateDiscountCode,
  adminUpdateDiscountCode,
} from '@api/admin/discount-codes';
import { useAdminEntityForm } from '@hooks/useAdminEntityForm';
import type { AdminDiscountCode, DiscountCodePayload } from '@t/discount-code';
import styles from './DiscountCodeFormModal.module.css';

interface Props {
  initial: AdminDiscountCode | null;
  onClose: () => void;
}

export default function DiscountCodeFormModal({ initial, onClose }: Props) {
  const isEdit = !!initial;

  const [code, setCode] = useState(initial?.code ?? '');
  const [type, setType] = useState<'percentage' | 'fixed_amount'>(initial?.type ?? 'percentage');
  const [value, setValue] = useState(String(initial?.value ?? ''));
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(
    initial?.maxDiscountAmount != null ? String(initial.maxDiscountAmount) : '',
  );
  const [minOrderAmount, setMinOrderAmount] = useState(
    initial?.minOrderAmount != null ? String(initial.minOrderAmount) : '',
  );
  const [usageLimit, setUsageLimit] = useState(
    initial?.usageLimit != null ? String(initial.usageLimit) : '',
  );
  const [perUserLimit, setPerUserLimit] = useState(String(initial?.perUserLimit ?? 1));
  const [startsAt, setStartsAt] = useState(initial?.startsAt ?? '');
  const [expiresAt, setExpiresAt] = useState(initial?.expiresAt ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  const { submit, loading, submitError, clearSubmitError } =
    useAdminEntityForm<DiscountCodePayload>({
      entity: 'discount-code',
      isEdit,
      recordId: initial?.id,
      createFn: adminCreateDiscountCode,
      updateFn: adminUpdateDiscountCode,
      invalidateKeys: [['admin', 'discount-codes']],
      messages: {
        create: 'کد تخفیف ایجاد شد.',
        update: 'کد تخفیف بروزرسانی شد.',
      },
      onSuccess: onClose,
    });

  async function handleGenerate() {
    setGenerating(true);
    try {
      const result = await adminGenerateDiscountCode();
      setCode(result.code);
    } finally {
      setGenerating(false);
    }
  }

  function buildPayload(): DiscountCodePayload | null {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      setError('کد تخفیف الزامی است.');
      return null;
    }
    if (!/^[A-Z0-9-]+$/.test(normalizedCode)) {
      setError('کد فقط شامل حروف بزرگ انگلیسی، اعداد و خط‌تیره می‌شود.');
      return null;
    }

    const numericValue = Number(value);
    if (!Number.isInteger(numericValue) || numericValue < 1) {
      setError('مقدار تخفیف معتبر نیست.');
      return null;
    }
    if (type === 'percentage' && numericValue > 100) {
      setError('درصد تخفیف باید بین ۱ تا ۱۰۰ باشد.');
      return null;
    }

    const perUser = Number(perUserLimit);
    if (!Number.isInteger(perUser) || perUser < 1) {
      setError('محدودیت استفاده برای هر کاربر معتبر نیست.');
      return null;
    }

    setError('');

    return {
      code: normalizedCode,
      type,
      value: numericValue,
      maxDiscountAmount:
        type === 'percentage' && maxDiscountAmount.trim()
          ? Number(maxDiscountAmount)
          : undefined,
      minOrderAmount: minOrderAmount.trim() ? Number(minOrderAmount) : undefined,
      usageLimit: usageLimit.trim() ? Number(usageLimit) : undefined,
      perUserLimit: perUser,
      startsAt: startsAt || undefined,
      expiresAt: expiresAt || undefined,
      isActive,
      description: description.trim() || undefined,
    };
  }

  async function save() {
    const payload = buildPayload();
    if (!payload) return;
    await submit(payload);
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'ویرایش کد تخفیف' : 'کد تخفیف جدید'}
      closeOnBackdropClick={!loading}
    >
      <form
        className={styles.formGrid}
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
        noValidate
      >
        <FormErrorBanner
          message={error || submitError}
          onDismiss={() => {
            setError('');
            clearSubmitError();
          }}
        />

        <div className={styles.codeRow}>
          <div className={styles.codeInput}>
            <Input
              label="کد تخفیف"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              dir="ltr"
              required
              disabled={isEdit}
            />
          </div>
          {!isEdit && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleGenerate()}
              loading={generating}
            >
              تولید خودکار
            </Button>
          )}
        </div>

        <div>
          <span className={styles.typeRow}>نوع تخفیف</span>
          <div className={styles.typeRow}>
            <button
              type="button"
              className={clsx(styles.typeBtn, type === 'percentage' && styles.typeBtnActive)}
              onClick={() => setType('percentage')}
            >
              درصدی
            </button>
            <button
              type="button"
              className={clsx(styles.typeBtn, type === 'fixed_amount' && styles.typeBtnActive)}
              onClick={() => setType('fixed_amount')}
            >
              مبلغ ثابت
            </button>
          </div>
        </div>

        <Input
          label={type === 'percentage' ? 'درصد تخفیف' : 'مبلغ تخفیف (تومان)'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="number"
          min={1}
          max={type === 'percentage' ? 100 : undefined}
          dir="ltr"
          required
        />

        {type === 'percentage' && (
          <Input
            label="حداکثر مبلغ تخفیف (اختیاری)"
            value={maxDiscountAmount}
            onChange={(e) => setMaxDiscountAmount(e.target.value)}
            type="number"
            min={1}
            dir="ltr"
          />
        )}

        <Input
          label="حداقل مبلغ سفارش (اختیاری)"
          value={minOrderAmount}
          onChange={(e) => setMinOrderAmount(e.target.value)}
          type="number"
          min={0}
          dir="ltr"
        />

        <Input
          label="سقف استفاده کلی (اختیاری)"
          value={usageLimit}
          onChange={(e) => setUsageLimit(e.target.value)}
          type="number"
          min={1}
          dir="ltr"
        />

        <Input
          label="محدودیت برای هر کاربر"
          value={perUserLimit}
          onChange={(e) => setPerUserLimit(e.target.value)}
          type="number"
          min={1}
          dir="ltr"
          required
        />

        <JalaliDateTimePicker
          id="discount-starts-at"
          label="شروع اعتبار (اختیاری)"
          value={startsAt}
          onChange={setStartsAt}
        />

        <JalaliDateTimePicker
          id="discount-expires-at"
          label="پایان اعتبار (اختیاری)"
          value={expiresAt}
          onChange={setExpiresAt}
        />

        <Input
          label="توضیحات (اختیاری)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span>فعال</span>
        </label>

        <Button type="submit" fullWidth loading={loading}>
          {isEdit ? 'ذخیره تغییرات' : 'ایجاد کد تخفیف'}
        </Button>
      </form>
    </Modal>
  );
}
