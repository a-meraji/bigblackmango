import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import IconButton from '@components/icon-button/IconButton';
import styles from './BackButton.module.css';

interface Props {
  /** Fallback when history is empty */
  to?: string;
  className?: string;
}

export default function BackButton({ to, className }: Props) {
  const navigate = useNavigate();

  function handleClick() {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (to) {
      navigate(to);
    } else {
      navigate('/');
    }
  }

  return (
    <IconButton
      icon={ArrowRight}
      label="بازگشت"
      variant="secondary"
      className={`${styles.back} ${className ?? ''}`}
      onClick={handleClick}
    />
  );
}
