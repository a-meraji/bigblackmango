import { useState, useRef, useEffect } from 'react';
import { requestOtp } from '@api/auth';
import { isValidIranianMobile } from '@utils/validators';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import styles from './OtpRequestForm.module.css';

interface OtpRequestFormProps {
  onSuccess: (mobile: string, expiresIn: number, retryAfter: number) => void;
}

export default function OtpRequestForm({ onSuccess }: OtpRequestFormProps) {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const mobileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    mobileRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!isValidIranianMobile(mobile)) {
      setError('شماره موبایل معتبر نیست');
      return;
    }

    setLoading(true);
    try {
      const res = await requestOtp({ mobile });
      onSuccess(mobile, res.otpExpiresInSeconds, res.retryAfterSeconds);
    } catch (err: unknown) {
      const apiErr = err as { code?: string; message?: string };
      if (apiErr.code === 'RATE_LIMITED') {
        setError('تعداد درخواست‌ها زیاد است. لطفاً کمی صبر کنید.');
      } else {
        setError(apiErr.message ?? 'خطا در ارسال کد. دوباره تلاش کنید.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <h1 className={styles.title}>ورود / ثبت‌نام</h1>
      <p className={styles.subtitle}>شماره موبایل خود را وارد کنید</p>

      <Input
        label="شماره موبایل"
        type="tel"
        inputMode="numeric"
        placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        error={error}
        required
        ref={mobileRef}
        dir="ltr"
      />

      <Button type="submit" fullWidth loading={loading} className={styles.submitBtn}>
        دریافت کد تایید
      </Button>
    </form>
  );
}
