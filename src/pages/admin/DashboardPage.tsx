import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getAdminDashboard } from '@api/admin/dashboard';
import KpiCard from '@features/admin/dashboard/components/KpiCard';
import SalesReportSection from '@features/admin/dashboard/components/SalesReportSection';
import Icon from '@components/icon/Icon';
import { formatPrice } from '@utils/format-price';
import {
  ADMIN_NAV_OPERATIONS,
  ADMIN_NAV_MANAGEMENT,
} from '@features/admin/dashboard/admin-nav';
import styles from './DashboardPage.module.css';

const QUICK_NAV = [
  ...ADMIN_NAV_OPERATIONS.filter((item) => item.path !== '/admin'),
  ...ADMIN_NAV_MANAGEMENT,
];

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getAdminDashboard,
    refetchInterval: 1000 * 60 * 2,
  });

  return (
    <div className={styles.page}>
      {isError && (
        <p className={styles.fetchError} role="alert">
          بارگذاری داشبورد ناموفق بود. اتصال را بررسی کنید.
        </p>
      )}

      {/* ── Section 1: Operational Status ── */}
      <section aria-labelledby="ops-heading">
        <h2 id="ops-heading" className={styles.sectionHeading}>
          وضعیت عملیاتی
        </h2>
        <div className={styles.kpiGrid}>
          <KpiCard
            label="سفارش‌های امروز"
            value={data?.todayOrders}
            loading={isLoading}
            href="/admin/orders"
          />
          <KpiCard
            label="در انتظار تایید"
            value={data?.pendingOrders}
            loading={isLoading}
            variant="warning"
            href="/admin/orders"
          />
          <KpiCard
            label="فروش امروز"
            value={data != null ? formatPrice(data.todaySales) : undefined}
            loading={isLoading}
            variant="success"
            href="#sales-report"
          />
          <KpiCard
            label="کم موجودی"
            value={data?.lowStockCount}
            loading={isLoading}
            variant="danger"
            href="/admin/foods"
          />
          <KpiCard
            label="نظرات نیازمند بررسی"
            value={data?.pendingReviewIssues}
            loading={isLoading}
            href="/admin/reviews"
          />
          <KpiCard
            label="استعلام کیترینگ"
            value={data?.partyServiceInquiries}
            loading={isLoading}
            href="/admin/party-services"
          />
        </div>
      </section>

      {/* ── Section 2: Quick Access ── */}
      <section aria-labelledby="quick-heading">
        <h2 id="quick-heading" className={styles.sectionHeading}>
          دسترسی سریع
        </h2>
        <nav className={styles.quickScroll} aria-label="بخش‌های مدیریت">
          {QUICK_NAV.map((item) => (
            <Link key={item.path} to={item.path} className={styles.quickCard}>
              <Icon icon={item.icon} size="md" className={styles.quickIcon} decorative />
              <span className={styles.quickLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </section>

      {/* ── Section 3: Sales Analytics ── */}
      <section aria-labelledby="report-heading">
        <h2 id="report-heading" className={styles.sectionHeading}>
          گزارش فروش
        </h2>
        <SalesReportSection />
      </section>
    </div>
  );
}
