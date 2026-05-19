import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import AuthLayout from '@layouts/AuthLayout';
import OtpRequestForm from '@features/auth/OtpRequestForm';
import OtpVerifyForm from '@features/auth/OtpVerifyForm';

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
    // Read fresh store state — React subscription may not have updated yet
    const user = useAuthStore.getState().user;
    const from = (location.state as { from?: { pathname?: string } })?.from?.pathname;
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate(from ?? '/', { replace: true });
    }
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
          onSuccess={handleVerifySuccess}
        />
      )}
    </AuthLayout>
  );
}
