import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import {
  adminListStories,
  adminDeleteStory,
  adminReactivateStory,
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

type StoryFilter = 'all' | 'active' | 'expired';

function isExpired(story: AdminStory): boolean {
  return new Date(story.expiresAt) < new Date();
}

function needsReactivation(story: AdminStory): boolean {
  return isExpired(story) || !story.isActive;
}

function storyStatus(story: AdminStory): 'active' | 'inactive' | 'expired' {
  if (isExpired(story)) return 'expired';
  if (!story.isActive) return 'inactive';
  return 'active';
}

const STATUS_LABELS: Record<ReturnType<typeof storyStatus>, string> = {
  active: 'فعال',
  inactive: 'غیرفعال',
  expired: 'منقضی',
};

function listParams(filter: StoryFilter) {
  if (filter === 'active') return { isActive: true, expired: false };
  if (filter === 'expired') return { expired: true };
  return {};
}

const FILTER_OPTIONS: { id: StoryFilter; label: string }[] = [
  { id: 'all', label: 'همه' },
  { id: 'active', label: 'فعال' },
  { id: 'expired', label: 'منقضی' },
];

export default function StoriesPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [filter, setFilter] = useState<StoryFilter>('all');
  const [editingStory, setEditingStory] = useState<AdminStory | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['admin', 'stories', filter],
    queryFn: () => adminListStories(listParams(filter)),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteStory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'stories'] });
      toast.success('استوری حذف شد.');
    },
    onError: () => toast.error('خطا در حذف استوری.'),
  });

  const reactivateMutation = useMutation({
    mutationFn: (storyId: string) => adminReactivateStory(storyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'stories'] });
      toast.success('استوری دوباره فعال شد.');
    },
    onError: () => toast.error('خطا در فعال‌سازی مجدد استوری.'),
  });

  function openCreate() {
    setEditingStory(null);
    setShowForm(true);
  }

  function openEdit(story: AdminStory) {
    setEditingStory(story);
    setShowForm(true);
  }

  function handleDelete(story: AdminStory) {
    if (!window.confirm(`حذف استوری «${story.title || 'بدون عنوان'}»؟`)) return;
    deleteMutation.mutate(story.id);
  }

  function handleQuickReactivate(story: AdminStory) {
    const label = story.title || 'بدون عنوان';
    if (
      !window.confirm(
        `فعال‌سازی مجدد استوری «${label}» با انقضای ۲۴ ساعت آینده؟`,
      )
    ) {
      return;
    }
    reactivateMutation.mutate(story.id);
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
      key: 'status',
      label: 'وضعیت',
      width: '96px',
      render: (s) => {
        const status = storyStatus(s);
        return (
          <span className={clsx(styles.statusBadge, styles[`status_${status}`])}>
            {STATUS_LABELS[status]}
          </span>
        );
      },
    },
    {
      key: 'expires',
      label: 'انقضا',
      render: (s) => {
        const expired = isExpired(s);
        return (
          <span className={expired ? styles.expiredText : undefined}>
            {toJalaliWithTime(s.expiresAt)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'عملیات',
      width: '220px',
      render: (s) => (
        <div className={shared.actions}>
          {needsReactivation(s) && (
            <button
              type="button"
              className={styles.reactivateBtn}
              onClick={() => handleQuickReactivate(s)}
              disabled={reactivateMutation.isPending}
            >
              فعال‌سازی مجدد
            </button>
          )}
          <button type="button" className={shared.editBtn} onClick={() => openEdit(s)}>
            ویرایش
          </button>
          <button
            type="button"
            className={shared.deleteBtn}
            onClick={() => handleDelete(s)}
            disabled={deleteMutation.isPending}
          >
            حذف
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminToolbar onAdd={openCreate} addLabel="استوری جدید">
        <div className={styles.filterTabs} role="tablist" aria-label="فیلتر استوری‌ها">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={filter === opt.id}
              className={filter === opt.id ? styles.filterTabActive : styles.filterTab}
              onClick={() => setFilter(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </AdminToolbar>
      <AdminTable
        columns={columns}
        rows={stories}
        rowKey={(s) => s.id}
        loading={isLoading}
        emptyMessage={
          filter === 'expired'
            ? 'استوری منقضی‌ای وجود ندارد.'
            : filter === 'active'
              ? 'استوری فعالی وجود ندارد.'
              : 'استوری‌ای وجود ندارد.'
        }
        rowClassName={(s) => (isExpired(s) ? styles.expiredRow : undefined)}
      />
      {showForm && (
        <StoryFormModal
          initial={editingStory}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
