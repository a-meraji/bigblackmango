import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import AuthLayout from '@components/auth/AuthLayout';
import OtpRequestForm from '@components/auth/OtpRequestForm';
import OtpVerifyForm from '@components/auth/OtpVerifyForm';
import { useCartStore } from '@store/cart.store';
import { mergeLocalCartAfterAuth } from '@features/customer/cart/cart-operations';

type Step = 'request' | 'verify';

export default function OtpPage() {
  const [step, setStep] = useState<Step>('request');
  const [mobile, setMobile] = useState('');
  const [retryAfter, setRetryAfter] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();
  const syncCart = useCartStore((s) => s.syncCart);
  const qc = useQueryClient();

  function handleRequestSuccess(m: string, _expiresIn: number, retryAfterSeconds: number) {
    setMobile(m);
    setRetryAfter(retryAfterSeconds);
    setStep('verify');
  }

  // Customer-specific post-auth work: merge the guest cart into the now-authenticated cart.
  async function mergeGuestCart() {
    const cart = await mergeLocalCartAfterAuth();
    syncCart(cart);
    qc.setQueryData(['cart'], cart);
  }

  function handleVerifySuccess() {
    const from = (location.state as { from?: { pathname?: string } })?.from?.pathname;
    navigate(from ?? '/', { replace: true });
  }

  return (
    <AuthLayout>
      {step === 'request' ? (
        <OtpRequestForm onSuccess={handleRequestSuccess} />
      ) : (
        <OtpVerifyForm
          mobile={mobile}
          retryAfterSeconds={retryAfter}
          onBack={() => setStep('request')}
          onAuthenticated={mergeGuestCart}
          onSuccess={handleVerifySuccess}
        />
      )}
    </AuthLayout>
  );
}
