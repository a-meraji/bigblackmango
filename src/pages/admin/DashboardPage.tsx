import { useQuery } from '@tanstack/react-query';
import { getAdminDashboard } from '@api/admin/dashboard';
import KpiCard from '@features/admin/dashboard/components/KpiCard';
import { formatPrice } from '@utils/format-price';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getAdminDashboard,
    refetchInterval: 1000 * 60 * 2,
  });

  return (
    <div className={styles.page}>
      {isError && (
        <p className={styles.error} role="alert">
          بارگذاری داشبورد ناموفق بود. اتصال را بررسی کنید.
        </p>
      )}

      <div className={styles.kpiGrid}>
        <KpiCard label="سفارش‌های امروز" value={data?.todayOrders} loading={isLoading} />
        <KpiCard
          label="در انتظار تایید"
          value={data?.pendingOrders}
          loading={isLoading}
          variant="warning"
        />
        <KpiCard
          label="فروش امروز"
          value={data != null ? formatPrice(data.todaySales) : undefined}
          loading={isLoading}
          variant="success"
        />
        <KpiCard
          label="کم موجودی"
          value={data?.lowStockCount}
          loading={isLoading}
          variant="danger"
        />
        <KpiCard
          label="نظرات نیازمند بررسی"
          value={data?.pendingReviewIssues}
          loading={isLoading}
        />
        <KpiCard
          label="استعلام کیترینگ"
          value={data?.partyServiceInquiries}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
