import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '@components/modal/Modal';
import OtpRequestForm from '@features/auth/OtpRequestForm';
import OtpVerifyForm from '@features/auth/OtpVerifyForm';
import { useAuthStore } from '@store/auth.store';
import { useToast } from '@hooks/useToast';
import styles from './AuthReauthModal.module.css';

type Step = 'request' | 'verify';

export default function AuthReauthModal() {
  const reauthOpen = useAuthStore((s) => s.reauthOpen);
  const reauthMessage = useAuthStore((s) => s.reauthMessage);
  const closeReauth = useAuthStore((s) => s.closeReauth);
  const [step, setStep] = useState<Step>('request');
  const [mobile, setMobile] = useState('');
  const [retryAfter, setRetryAfter] = useState(60);
  const qc = useQueryClient();
  const toast = useToast();

  useEffect(() => {
    if (reauthOpen) {
      setStep('request');
      setMobile('');
    }
  }, [reauthOpen]);

  function handleRequestSuccess(m: string, _expiresIn: number, retryAfterSeconds: number) {
    setMobile(m);
    setRetryAfter(retryAfterSeconds);
    setStep('verify');
  }

  function handleVerifySuccess() {
    closeReauth();
    setStep('request');
    setMobile('');
    void qc.invalidateQueries();
    toast.success('ورود مجدد انجام شد');
  }

  function handleBack() {
    setStep('request');
  }

  if (!reauthOpen) return null;

  return (
    <Modal
      isOpen
      onClose={() => {}}
      title="ورود مجدد"
      size="sm"
      preventClose
    >
      <p className={styles.message}>
        {reauthMessage ?? 'نشست شما منقضی شده است. برای ادامه، دوباره وارد شوید.'}
      </p>
      {step === 'request' ? (
        <OtpRequestForm onSuccess={handleRequestSuccess} />
      ) : (
        <OtpVerifyForm
          mobile={mobile}
          retryAfterSeconds={retryAfter}
          onBack={handleBack}
          onSuccess={handleVerifySuccess}
        />
      )}
    </Modal>
  );
}
