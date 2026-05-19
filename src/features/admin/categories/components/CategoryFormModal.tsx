import { useState } from 'react';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import type { AdminCategory } from '@types/admin-catalog';
import type { CategoryPayload } from '@api/admin/categories';
import styles from './CategoryFormModal.module.css';

interface CategoryFormModalProps {
  initial: AdminCategory | null;
  onClose: () => void;
  onCreate: (payload: CategoryPayload) => Promise<void>;
  onUpdate: (id: string, payload: Partial<CategoryPayload>) => Promise<void>;
}

export default function CategoryFormModal({
  initial,
  onClose,
  onCreate,
  onUpdate,
}: CategoryFormModalProps) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? '');
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('نام الزامی است');
      return;
    }

    const order = Number(sortOrder);
    if (Number.isNaN(order)) {
      setError('ترتیب نمایش معتبر نیست');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = { name: name.trim(), sortOrder: order, isActive };
      if (isEdit && initial) {
        await onUpdate(initial.id, payload);
      } else {
        await onCreate(payload);
      }
    } catch (err: unknown) {
      const apiErr = err as { code?: string };
      if (apiErr.code === 'CONFLICT') setError('این نام قبلاً ثبت شده است.');
      else setError('خطا در ذخیره‌سازی.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="نام دسته‌بندی"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          required
        />
        <Input
          label="ترتیب نمایش"
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          dir="ltr"
        />
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          فعال
        </label>
        <Button type="submit" fullWidth loading={loading} className={styles.submit}>
          {isEdit ? 'ذخیره تغییرات' : 'ایجاد'}
        </Button>
      </form>
    </Modal>
  );
}
