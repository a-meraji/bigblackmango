import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Plus, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import Modal from '@components/modal/Modal';
import EmptyState from '@components/empty-state/EmptyState';
import Spinner from '@components/spinner/Spinner';
import {
  adminListTestimonials,
  adminCreateTestimonial,
  adminUpdateTestimonial,
  adminDeleteTestimonial,
  type TestimonialPayload,
} from '@api/admin/testimonials';
import type { AdminPartyServicePage, AdminServiceTestimonial } from '@t/admin-content';
import { useToast } from '@hooks/useToast';
import { shouldSuppressAuthToast } from '@utils/auth-errors';
import TestimonialFormModal from './TestimonialFormModal';
import styles from './TestimonialsManager.module.css';

interface Props {
  service: AdminPartyServicePage;
  onClose: () => void;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className={styles.stars} aria-label={`امتیاز ${rating}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? styles.starOn : styles.starOff}>★</span>
      ))}
    </span>
  );
}

export default function TestimonialsManager({ service, onClose }: Props) {
  const qc = useQueryClient();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminServiceTestimonial | null>(null);

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['admin', 'testimonials', service.id],
    queryFn: () => adminListTestimonials(service.id),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminUpdateTestimonial(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'testimonials', service.id] }),
    onError: () => toast.error('خطا در بروزرسانی.'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteTestimonial,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'testimonials', service.id] });
      toast.success('نظر حذف شد.');
    },
    onError: () => toast.error('خطا در حذف.'),
  });

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(t: AdminServiceTestimonial) {
    setEditing(t);
    setShowForm(true);
  }

  function handleDelete(t: AdminServiceTestimonial) {
    if (!window.confirm(`حذف نظر «${t.authorName}»؟`)) return;
    deleteMutation.mutate(t.id);
  }

  async function handleSave(payload: Partial<TestimonialPayload>) {
    try {
      if (editing) {
        const { servicePageId: _sid, ...updatePayload } = payload;
        await adminUpdateTestimonial(editing.id, updatePayload);
        toast.success('نظر بروزرسانی شد.');
      } else {
        await adminCreateTestimonial(payload as TestimonialPayload);
        toast.success('نظر ثبت شد.');
      }
      qc.invalidateQueries({ queryKey: ['admin', 'testimonials', service.id] });
      setShowForm(false);
    } catch (err) {
      if (shouldSuppressAuthToast(err)) return;
      toast.error('خطا در ذخیره نظر.');
      throw err;
    }
  }

  return (
    <>
      <Modal isOpen onClose={onClose} title={`نظرات «${service.title}»`} size="lg">
        <div className={styles.wrap}>
          <div className={styles.toolbar}>
            {testimonials.length > 0 && (
              <span className={styles.count}>{testimonials.length} نظر</span>
            )}
            <button type="button" className={styles.addBtn} onClick={openCreate}>
              <Plus size={13} strokeWidth={2.5} />
              افزودن نظر
            </button>
          </div>

          {isLoading ? (
            <div className={styles.spinnerWrap}>
              <Spinner size="md" label="در حال بارگذاری" />
            </div>
          ) : testimonials.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="نظری وجود ندارد"
              description="اولین نظر مشتری را اضافه کنید"
              actionLabel="افزودن نظر"
              onAction={openCreate}
            />
          ) : (
            <ul className={styles.list}>
              {testimonials.map((t) => (
                <li key={t.id} className={clsx(styles.item, !t.isActive && styles.itemDim)}>
                  <div className={styles.row}>
                    <span className={styles.author}>{t.authorName}</span>
                    {t.role && <span className={styles.role}>{t.role}</span>}
                    <Stars rating={t.rating} />
                    {t.sortOrder != null && (
                      <span className={styles.order}>#{t.sortOrder}</span>
                    )}
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={clsx(styles.iconBtn, t.isActive ? styles.iconBtnOn : styles.iconBtnOff)}
                        title={t.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                        onClick={() => toggleMutation.mutate({ id: t.id, isActive: !t.isActive })}
                        disabled={toggleMutation.isPending}
                      >
                        {t.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      <button
                        type="button"
                        className={clsx(styles.iconBtn, styles.iconBtnEdit)}
                        title="ویرایش"
                        onClick={() => openEdit(t)}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        className={clsx(styles.iconBtn, styles.iconBtnDel)}
                        title="حذف"
                        onClick={() => handleDelete(t)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p className={styles.excerpt}>{t.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>

      {showForm && (
        <TestimonialFormModal
          servicePageId={service.id}
          initial={editing}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
