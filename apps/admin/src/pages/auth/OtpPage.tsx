import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '@components/auth/AuthLayout';
import OtpRequestForm from '@components/auth/OtpRequestForm';
import OtpVerifyForm from '@components/auth/OtpVerifyForm';

type Step = 'request' | 'verify';

export default function OtpPage() {
  const [step, setStep] = useState<Step>('request');
  const [mobile, setMobile] = useState('');
  const [retryAfter, setRetryAfter] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();

  function handleRequestSuccess(m: string, _expiresIn: number, retryAfterSeconds: number) {
    setMobile(m);
    setRetryAfter(retryAfterSeconds);
    setStep('verify');
  }

  function handleVerifySuccess() {
    const from = (location.state as { from?: { pathname?: string } })?.from?.pathname;
    navigate(from ?? '/admin', { replace: true });
  }

  return (
    <AuthLayout>
      {step === 'request' ? (
        <OtpRequestForm onSuccess={handleRequestSuccess} />
      ) : (
        // Admin login needs no guest-cart merge → no onAuthenticated callback.
        <OtpVerifyForm
          mobile={mobile}
          retryAfterSeconds={retryAfter}
          onBack={() => setStep('request')}
          onSuccess={handleVerifySuccess}
        />
      )}
    </AuthLayout>
  );
}
