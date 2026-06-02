import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminListStories,
  adminCreateStory,
  adminDeleteStory,
  type StoryPayload,
} from '@api/admin/stories';
import AdminTable, { type Column } from '@components/admin-table/AdminTable';
import AdminToolbar from '@components/admin-toolbar/AdminToolbar';
import StoryFormModal from '@features/admin/stories/components/StoryFormModal';
import type { AdminStory } from '@t/admin-content';
import { toJalaliWithTime } from '@utils/format-date';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import { useToast } from '@hooks/useToast';
import shared from '@styles/admin-shared.module.css';
import styles from './StoriesPage.module.css';

function isExpired(story: AdminStory): boolean {
  return new Date(story.expiresAt) < new Date();
}

export default function StoriesPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['admin', 'stories'],
    queryFn: adminListStories,
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteStory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'stories'] });
      toast.success('استوری حذف شد.');
    },
    onError: () => toast.error('خطا در حذف استوری.'),
  });

  function handleDelete(story: AdminStory) {
    if (!window.confirm(`حذف استوری «${story.title || 'بدون عنوان'}»؟`)) return;
    deleteMutation.mutate(story.id);
  }

  const columns: Column<AdminStory>[] = [
    {
      key: 'thumb',
      label: 'تصویر',
      width: '72px',
      render: (s) => {
        const src = resolveMediaUrl(s.thumbnailUrl ?? s.mediaUrl);
        return src ? (
          <img src={src} alt={s.title} className={shared.thumb} loading="lazy" />
        ) : (
          <span className={shared.thumbPlaceholder}>—</span>
        );
      },
    },
    {
      key: 'title',
      label: 'عنوان',
      render: (s) => <strong>{s.title || '—'}</strong>,
    },
    {
      key: 'type',
      label: 'نوع',
      width: '80px',
      render: (s) => (s.mediaType === 'video' ? 'ویدیو' : 'تصویر'),
    },
    {
      key: 'expires',
      label: 'انقضا',
      render: (s) => {
        const expired = isExpired(s);
        return (
          <span className={expired ? styles.expiredText : undefined}>
            {toJalaliWithTime(s.expiresAt)}
            {expired ? ' (منقضی شده)' : ''}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'عملیات',
      width: '80px',
      render: (s) => (
        <button
          type="button"
          className={shared.deleteBtn}
          onClick={() => handleDelete(s)}
          disabled={deleteMutation.isPending}
        >
          حذف
        </button>
      ),
    },
  ];

  return (
    <div>
      <AdminToolbar onAdd={() => setShowForm(true)} addLabel="استوری جدید" />
      <AdminTable
        columns={columns}
        rows={stories}
        rowKey={(s) => s.id}
        loading={isLoading}
        emptyMessage="استوری‌ای وجود ندارد."
        rowClassName={(s) => (isExpired(s) ? styles.expiredRow : undefined)}
      />
      {showForm && (
        <StoryFormModal
          onClose={() => setShowForm(false)}
          onSave={async (payload: StoryPayload) => {
            await adminCreateStory(payload);
            qc.invalidateQueries({ queryKey: ['admin', 'stories'] });
            setShowForm(false);
            toast.success('استوری ایجاد شد.');
          }}
        />
      )}
    </div>
  );
}
