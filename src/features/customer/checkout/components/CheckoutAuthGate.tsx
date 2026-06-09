import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { requestOtp, verifyOtp } from '@api/auth';
import { mergeLocalCartAfterAuth } from '@features/customer/cart/cart-operations';
import { useAuthStore } from '@store/auth.store';
import { useCartStore } from '@store/cart.store';
import Input from '@components/input/Input';
import { formatDigits } from '@utils/locale';
import Button from '@components/button/Button';
import { isValidIranianMobile } from '@utils/validators';
import styles from './CheckoutAuthGate.module.css';

interface Props {
  onSuccess: () => void;
  onBack: () => void;
}

type Phase = 'mobile' | 'otp';

export default function CheckoutAuthGate({ onSuccess, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('mobile');
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const syncCart = useCartStore((s) => s.syncCart);
  const qc = useQueryClient();
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase === 'otp') {
      codeRef.current?.focus();
    }
  }, [phase]);

  async function sendOtp() {
    setError('');
    const trimmed = mobile.trim();
    if (!isValidIranianMobile(trimmed)) {
      setError('شماره موبایل معتبر نیست');
      return;
    }
    setLoading(true);
    try {
      await requestOtp({ mobile: trimmed });
      setPhase('otp');
    } catch {
      setError('خطا در ارسال کد.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      setError('کد ۶ رقمی را وارد کنید');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await verifyOtp({ mobile: mobile.trim(), code });
      setUser(res.user);
      const cart = await mergeLocalCartAfterAuth();
      syncCart(cart);
      qc.setQueryData(['cart'], cart);
      await qc.invalidateQueries({ queryKey: ['me'] });
      onSuccess();
    } catch (err: unknown) {
      const apiErr = err as { code?: string };
      if (apiErr.code === 'OTP_EXPIRED') setError('کد منقضی شد.');
      else setError('کد اشتباه است.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.gate}>
      {phase === 'mobile' && (
        <>
          <p className={styles.info}>
            برای ادامه، شماره موبایل خود را وارد کنید تا وارد شوید یا ثبت‌نام کنید.
          </p>
          <Input
            label="شماره موبایل"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            error={error}
            type="tel"
            inputMode="numeric"
            dir="ltr"
            autoComplete="tel"
            required
          />
          <Button fullWidth onClick={() => void sendOtp()} loading={loading}>
            دریافت کد تایید
          </Button>
          <button type="button" className={styles.backBtn} onClick={onBack}>
            بازگشت
          </button>
        </>
      )}

      {phase === 'otp' && (
        <>
          <p className={styles.info}>
            کد ارسال‌شده به <strong dir="ltr">{formatDigits(mobile.trim())}</strong> را وارد کنید.
          </p>
          <form onSubmit={verifyCode} className={styles.form} noValidate>
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
              تایید و ادامه
            </Button>
          </form>
          <Button
            fullWidth
            variant="ghost"
            type="button"
            onClick={() => void sendOtp()}
            loading={loading}
          >
            ارسال مجدد کد
          </Button>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => {
              setPhase('mobile');
              setCode('');
              setError('');
            }}
          >
            ویرایش شماره
          </button>
        </>
      )}
    </div>
  );
}
