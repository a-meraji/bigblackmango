import { Suspense, type ReactNode } from 'react';
import ErrorBoundary from '@components/error-boundary/ErrorBoundary';
import Spinner from '@components/spinner/Spinner';

export function PageFallback() {
  return (
    <div className="page-fallback" role="status" aria-label="در حال بارگذاری">
      <Spinner size="lg" />
    </div>
  );
}

export function pageBoundary(children: ReactNode) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

export function lazyPage(children: ReactNode) {
  return pageBoundary(<Suspense fallback={<PageFallback />}>{children}</Suspense>);
}
