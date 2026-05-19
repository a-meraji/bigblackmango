import React from 'react';
import { CircleAlert } from 'lucide-react';
import Icon from '@components/icon/Icon';
import Button from '@components/button/Button';
import styles from './ErrorBoundary.module.css';

interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className={styles.wrapper} role="alert">
          <div className={styles.iconWrap} aria-hidden="true">
            <Icon icon={CircleAlert} size="lg" decorative />
          </div>
          <h2 className={styles.title}>مشکلی پیش آمد</h2>
          <p className={styles.message}>این بخش به درستی بارگذاری نشد.</p>
          <Button variant="primary" onClick={this.handleRetry}>
            تلاش مجدد
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
