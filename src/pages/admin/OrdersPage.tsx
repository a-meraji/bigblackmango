import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminGetOrders,
  adminUpdateOrderStatus,
  type AdminOrderFilters,
  type AdminOrderListItem,
} from '@api/admin/orders';
import AdminTable, { type Column } from '@components/admin-table/AdminTable';
import Pagination from '@components/pagination/Pagination';
import OrderFilterBar from '@features/admin/orders/components/OrderFilterBar';
import OrderStatusBadge from '@features/admin/orders/components/OrderStatusBadge';
import StatusTransitionButtons from '@features/admin/orders/components/StatusTransitionButtons';
import OrderDetailDrawer from '@features/admin/orders/components/OrderDetailDrawer';
import ManualOrderModal from '@features/admin/orders/components/ManualOrderModal';
import OrderStatusConfirmModal, {
  type OrderStatusConfirmPayload,
} from '@features/admin/orders/components/OrderStatusConfirmModal';
import { formatPrice } from '@utils/format-price';
import { toJalaliWithTime } from '@utils/format-date';
import type { OrderStatus } from '@t/order';
import { useToast } from '@hooks/useToast';
import styles from './OrdersPage.module.css';

function paymentBadgeClass(status: string): string {
  return status === 'paid' ? styles.paid : styles.unpaid;
}

export default function OrdersPage() {
  const qc = useQueryClient();
  const toast = useToast();

  const [filters, setFilters] = useState<AdminOrderFilters>({ page: 1, limit: 20 });
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [statusConfirm, setStatusConfirm] = useState<OrderStatusConfirmPayload | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', filters],
    queryFn: () => adminGetOrders(filters),
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      adminUpdateOrderStatus(orderId, status),
    onSuccess: (_, { orderId }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'order', orderId] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setStatusConfirm(null);
      toast.success('وضعیت سفارش بروزرسانی شد.');
    },
    onError: (err: { code?: string }) => {
      if (err.code === 'CONFLICT') {
        toast.error('انتقال وضعیت مجاز نیست.');
      } else {
        toast.error('خطا در تغییر وضعیت.');
      }
    },
  });

  function openStatusConfirm(payload: OrderStatusConfirmPayload) {
    setStatusConfirm(payload);
  }

  function handleConfirmStatusChange() {
    if (!statusConfirm) return;
    statusMutation.mutate({
      orderId: statusConfirm.orderId,
      status: statusConfirm.nextStatus,
    });
  }

  const orders = data?.items ?? [];

  const columns: Column<AdminOrderListItem>[] = [
    {
      key: 'tracking',
      label: 'کد پیگیری',
      render: (o) => (
        <button
          type="button"
          className={styles.trackingBtn}
          onClick={() => setSelectedOrderId(o.id)}
          dir="ltr"
        >
          {o.trackingCode}
        </button>
      ),
    },
    {
      key: 'status',
      label: 'وضعیت',
      render: (o) => <OrderStatusBadge status={o.status} />,
    },
    {
      key: 'payment',
      label: 'پرداخت',
      width: '100px',
      render: (o) => (
        <span className={paymentBadgeClass(o.paymentStatus)}>
          {o.paymentStatus === 'paid' ? 'پرداخت‌شده' : 'پرداخت‌نشده'}
        </span>
      ),
    },
    {
      key: 'customer',
      label: 'مشتری',
      render: (o) => (
        <div className={styles.customerCell}>
          <span>{o.customer.fullName}</span>
          {o.customer.mobile && (
            <span className={styles.customerMobile} dir="ltr">
              {o.customer.mobile}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'total',
      label: 'مبلغ',
      render: (o) => <span dir="ltr">{formatPrice(o.total)}</span>,
    },
    {
      key: 'date',
      label: 'تاریخ',
      render: (o) => toJalaliWithTime(o.orderedAt),
    },
    {
      key: 'actions',
      label: 'تغییر وضعیت',
      width: '12rem',
      render: (o) => (
        <StatusTransitionButtons
          currentStatus={o.status}
          onTransition={(newStatus) =>
            openStatusConfirm({
              orderId: o.id,
              trackingCode: o.trackingCode,
              currentStatus: o.status,
              nextStatus: newStatus,
            })
          }
          loading={statusMutation.isPending}
        />
      ),
    },
  ];

  return (
    <div>
      <OrderFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onManualOrder={() => setShowManualForm(true)}
      />

      <AdminTable
        columns={columns}
        rows={orders}
        rowKey={(o) => o.id}
        loading={isLoading}
        emptyMessage="سفارشی با این فیلترها یافت نشد."
      />

      {data && (
        <Pagination
          page={filters.page ?? 1}
          total={data.meta.total}
          limit={filters.limit ?? 20}
          onChange={(p) => setFilters((f) => ({ ...f, page: p }))}
        />
      )}

      {selectedOrderId && (
        <OrderDetailDrawer
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          statusLoading={statusMutation.isPending}
          onStatusChange={({ nextStatus, trackingCode, currentStatus }) =>
            openStatusConfirm({
              orderId: selectedOrderId,
              trackingCode,
              currentStatus,
              nextStatus,
            })
          }
        />
      )}

      <OrderStatusConfirmModal
        open={statusConfirm !== null}
        payload={statusConfirm}
        loading={statusMutation.isPending}
        onClose={() => setStatusConfirm(null)}
        onConfirm={handleConfirmStatusChange}
      />

      {showManualForm && (
        <ManualOrderModal
          onClose={() => setShowManualForm(false)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
            qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
            setShowManualForm(false);
            toast.success('سفارش دستی ثبت شد.');
          }}
        />
      )}
    </div>
  );
}
