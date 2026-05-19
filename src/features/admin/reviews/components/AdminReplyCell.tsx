import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  adminUpsertReply,
  adminDeleteReply,
  type AdminReview,
} from '@api/admin/reviews';
import { useToast } from '@hooks/useToast';
import { toJalali } from '@utils/format-date';
import styles from './AdminReplyCell.module.css';

interface AdminReplyCellProps {
  review: AdminReview;
  onRefresh: () => void;
}

export default function AdminReplyCell({ review, onRefresh }: AdminReplyCellProps) {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(review.adminReply?.message ?? '');

  useEffect(() => {
    if (!isEditing) {
      setMessage(review.adminReply?.message ?? '');
    }
  }, [review.adminReply?.message, isEditing]);

  const upsertMutation = useMutation({
    mutationFn: (msg: string) => adminUpsertReply(review.id, msg.trim()),
    onSuccess: () => {
      toast.success('پاسخ ذخیره شد.');
      setIsEditing(false);
      onRefresh();
    },
    onError: () => toast.error('خطا در ذخیره پاسخ.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminDeleteReply(review.id),
    onSuccess: () => {
      toast.success('پاسخ حذف شد.');
      setMessage('');
      setIsEditing(false);
      onRefresh();
    },
    onError: () => toast.error('خطا در حذف پاسخ.'),
  });

  if (!isEditing && !review.adminReply) {
    return (
      <button
        type="button"
        className={styles.addReplyBtn}
        onClick={() => setIsEditing(true)}
      >
        + پاسخ دادن
      </button>
    );
  }

  if (!isEditing && review.adminReply) {
    return (
      <div className={styles.existingReply}>
        <p className={styles.replyText}>{review.adminReply.message}</p>
        <p className={styles.replyDate}>
          {toJalali(review.adminReply.repliedAt)}
        </p>
        <div className={styles.replyActions}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => {
              setMessage(review.adminReply!.message);
              setIsEditing(true);
            }}
          >
            ویرایش
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => {
              if (window.confirm('حذف پاسخ مدیر؟')) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
          >
            حذف
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editor}>
      <textarea
        className={styles.textarea}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="پاسخ خود را بنویسید..."
        maxLength={1000}
        autoFocus
      />
      <div className={styles.editorActions}>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={() => upsertMutation.mutate(message)}
          disabled={!message.trim() || upsertMutation.isPending}
        >
          {upsertMutation.isPending ? 'در حال ذخیره...' : 'ذخیره'}
        </button>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => {
            setIsEditing(false);
            setMessage(review.adminReply?.message ?? '');
          }}
        >
          انصراف
        </button>
      </div>
    </div>
  );
}
