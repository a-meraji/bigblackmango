import { useState, useEffect, useRef } from 'react';
import { verifyOtp, requestOtp } from '@api/auth';
import { mergeLocalCartAfterAuth } from '@features/customer/cart/cart-operations';
import { useAuthStore } from '@store/auth.store';
import { useCartStore } from '@store/cart.store';
import { useQueryClient } from '@tanstack/react-query';
import Input from '@components/input/Input';
import { formatDigits } from '@utils/locale';
import Button from '@components/button/Button';
import styles from './OtpVerifyForm.module.css';

interface OtpVerifyFormProps {
  mobile: string;
  retryAfterSeconds: number;
  onBack: () => void;
  onSuccess: () => void;
}

export default function OtpVerifyForm({
  mobile,
  retryAfterSeconds,
  onBack,
  onSuccess,
}: OtpVerifyFormProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(retryAfterSeconds);
  const setUser = useAuthStore((s) => s.setUser);
  const syncCart = useCartStore((s) => s.syncCart);
  const qc = useQueryClient();
  const codeRef = useRef<HTMLInputElement>(null);

  // Focus code input on mount
  useEffect(() => {
    codeRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (code.length !== 6) {
      setError('کد ۶ رقمی را وارد کنید');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp({ mobile, code });
      setUser(res.user);
      const cart = await mergeLocalCartAfterAuth();
      syncCart(cart);
      qc.setQueryData(['cart'], cart);
      await qc.invalidateQueries({ queryKey: ['me'] });
      onSuccess();
    } catch (err: unknown) {
      const apiErr = err as { code?: string };
      if (apiErr.code === 'OTP_EXPIRED') setError('کد منقضی شده است. کد جدید دریافت کنید.');
      else if (apiErr.code === 'OTP_INVALID') setError('کد وارد شده صحیح نیست.');
      else setError('خطا در تایید. دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      const res = await requestOtp({ mobile });
      setResendCountdown(res.retryAfterSeconds);
      setCode('');
      setError('');
    } catch {
      setError('خطا در ارسال مجدد کد.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <h1 className={styles.title}>کد تایید</h1>
      <p className={styles.subtitle}>
        کد ارسال شده به{' '}
        <span dir="ltr" className={styles.mobile}>
          {formatDigits(mobile)}
        </span>{' '}
        را وارد کنید
      </p>

      <Input
        label="کد ۶ رقمی"
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        digitsOnly
        error={error}
        ref={codeRef}
        dir="ltr"
        autoComplete="one-time-code"
      />

      <Button type="submit" fullWidth loading={loading}>
        تایید و ورود
      </Button>

      <div className={styles.footer}>
        {resendCountdown > 0 ? (
          <span className={styles.countdown}>ارسال مجدد تا {resendCountdown} ثانیه دیگر</span>
        ) : (
          <button type="button" className={styles.resendBtn} onClick={handleResend}>
            ارسال مجدد کد
          </button>
        )}
        <button type="button" className={styles.backBtn} onClick={onBack}>
          ویرایش شماره
        </button>
      </div>
    </form>
  );
}
