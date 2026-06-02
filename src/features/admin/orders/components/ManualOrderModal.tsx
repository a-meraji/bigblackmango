import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { adminGetDailyMenu } from '@api/admin/daily-menu';
import { adminCreateManualOrder, type ManualOrderPayload } from '@api/admin/orders';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import CustomSelect from '@components/custom-select/CustomSelect';
import { formatPrice } from '@utils/format-price';
import styles from './ManualOrderModal.module.css';

interface ManualOrderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface ItemSelection {
  menuItemId: string;
  foodName: string;
  quantity: number;
  stock: number;
  unitPrice: number;
}

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ManualOrderModal({ onClose, onSuccess }: ManualOrderModalProps) {
  const today = todayIsoDate();
  const { data: menu, isLoading: menuLoading } = useQuery({
    queryKey: ['admin', 'daily-menu', today],
    queryFn: () => adminGetDailyMenu(today),
  });

  const menuItems = menu?.items ?? [];

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [unit, setUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('paid');
  const [selections, setSelections] = useState<ItemSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleItem(
    menuItemId: string,
    foodName: string,
    stock: number,
    unitPrice: number,
  ) {
    if (selections.some((s) => s.menuItemId === menuItemId)) {
      setSelections((prev) => prev.filter((s) => s.menuItemId !== menuItemId));
    } else {
      setSelections((prev) => [
        ...prev,
        { menuItemId, foodName, quantity: 1, stock, unitPrice },
      ]);
    }
  }

  function updateQty(menuItemId: string, qty: number) {
    setSelections((prev) =>
      prev.map((s) =>
        s.menuItemId === menuItemId
          ? { ...s, quantity: Math.max(1, Math.min(qty, s.stock)) }
          : s,
      ),
    );
  }

  const estimatedSubtotal = selections.reduce(
    (sum, s) => sum + s.unitPrice * s.quantity,
    0,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!firstName.trim()) nextErrors.firstName = 'الزامی';
    if (!lastName.trim()) nextErrors.lastName = 'الزامی';
    if (!mobile.trim()) nextErrors.mobile = 'الزامی';
    if (!addressLine.trim()) nextErrors.addressLine = 'الزامی';
    if (selections.length === 0) nextErrors.items = 'حداقل یک غذا انتخاب کنید';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: ManualOrderPayload = {
      customer: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobile: mobile.trim(),
      },
      address: {
        addressLine: addressLine.trim(),
        unit: unit.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      items: selections.map((s) => ({
        menuItemId: s.menuItemId,
        quantity: s.quantity,
      })),
      paymentStatus,
      notes: notes.trim() || undefined,
    };

    setLoading(true);
    setErrors({});
    try {
      await adminCreateManualOrder(payload);
      onSuccess();
    } catch (err: unknown) {
      const apiErr = err as { code?: string; message?: string };
      if (apiErr.code === 'OUT_OF_STOCK') {
        setErrors({ items: 'موجودی یک یا چند غذا کافی نیست.' });
      } else if (apiErr.code === 'CONFLICT') {
        setErrors({ form: apiErr.message ?? 'تعارض در ثبت سفارش.' });
      } else {
        setErrors({ form: 'خطا در ثبت سفارش.' });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="ثبت سفارش دستی" size="lg">
      <form onSubmit={handleSubmit} className={styles.form}>
        {errors.form && (
          <p className={styles.formError} role="alert">
            {errors.form}
          </p>
        )}

        <div className={styles.grid}>
          <Input
            label="نام"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={errors.firstName}
            required
          />
          <Input
            label="نام خانوادگی"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={errors.lastName}
            required
          />
          <Input
            label="موبایل"
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            error={errors.mobile}
            dir="ltr"
            required
          />
        </div>

        <Input
          label="آدرس"
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
          error={errors.addressLine}
          required
        />
        <Input
          label="واحد (اختیاری)"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />

        <div>
          <label className={styles.selectLabel} htmlFor="manual-payment">
            وضعیت پرداخت
          </label>
          <CustomSelect
            id="manual-payment"
            value={paymentStatus}
            onChange={(v) => setPaymentStatus(v as 'paid' | 'unpaid')}
            options={[
              { value: 'paid', label: 'پرداخت‌شده (نقدی / حضوری)' },
              { value: 'unpaid', label: 'پرداخت‌نشده' },
            ]}
          />
        </div>

        <Input
          label="یادداشت سفارش (اختیاری)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <section className={styles.menuSection}>
          <h3 className={styles.menuTitle}>انتخاب از منوی امروز</h3>
          {errors.items && (
            <p className={styles.itemsError} role="alert">
              {errors.items}
            </p>
          )}
          {menuLoading && <p className={styles.noMenu}>در حال بارگذاری منو...</p>}
          {!menuLoading && menuItems.length === 0 && (
            <p className={styles.noMenu}>منویی برای امروز تعریف نشده است.</p>
          )}
          <ul className={styles.menuList}>
            {menuItems.map((item) => {
              const sel = selections.find((s) => s.menuItemId === item.id);
              const stockClass =
                item.stock === 0
                  ? styles.stockDanger
                  : item.stock <= 3
                    ? styles.stockWarning
                    : undefined;
              return (
                <li
                  key={item.id}
                  className={clsx(styles.menuItem, sel && styles.selected)}
                >
                  <label className={styles.menuItemLabel}>
                    <input
                      type="checkbox"
                      checked={!!sel}
                      disabled={item.stock === 0}
                      onChange={() =>
                        toggleItem(item.id, item.food.name, item.stock, item.food.price)
                      }
                    />
                    <span className={styles.menuName}>{item.food.name}</span>
                    <span className={clsx(styles.menuStock, stockClass)}>
                      {item.stock.toLocaleString('fa-IR')} موجود ·{' '}
                      <span dir="ltr">{formatPrice(item.food.price)}</span>
                    </span>
                  </label>
                  {sel && (
                    <input
                      type="number"
                      min={1}
                      max={item.stock}
                      value={sel.quantity}
                      onChange={(e) => updateQty(item.id, Number(e.target.value))}
                      className={styles.qtyInput}
                      dir="ltr"
                      aria-label={`تعداد ${item.food.name}`}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {selections.length > 0 && (
          <p className={styles.estimate}>
            برآورد جزء: <span dir="ltr">{formatPrice(estimatedSubtotal)}</span>
            <span className={styles.estimateNote}> (هزینه ارسال در سرور محاسبه می‌شود)</span>
          </p>
        )}

        <Button type="submit" fullWidth loading={loading} disabled={menuItems.length === 0}>
          ثبت سفارش
        </Button>
      </form>
    </Modal>
  );
}
