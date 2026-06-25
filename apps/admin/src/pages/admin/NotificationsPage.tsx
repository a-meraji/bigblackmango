import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Send, Plus, Pencil, Trash2, CheckCircle, XCircle, Eye, EyeOff, Clock, Radio } from 'lucide-react';
import clsx from 'clsx';
import CustomSelect from '@components/custom-select/CustomSelect';
import {
  adminGetNotificationStats,
  adminListTemplates,
  adminCreateTemplate,
  adminUpdateTemplate,
  adminDeleteTemplate,
  adminSendNotification,
  adminGetSchedule,
  adminUpdateSchedule,
  adminListChannels,
  adminUpdateChannel,
} from '@api/admin/notifications';
import type {
  NotificationTemplate,
  CreateTemplatePayload,
  SendNotificationPayload,
  NotificationChannel,
  ChannelKey,
  ChannelConfig,
} from '@t/notifications';
import Button from '@components/button/Button';
import Spinner from '@components/spinner/Spinner';
import { useToast } from '@hooks/useToast';
import { toJalaliWithTime } from '@utils/format-date';
import { toPersianDigits } from '@utils/locale';
import RawLocalizedInput from '@components/input/RawLocalizedInput';
import { useLocalizedDigits } from '@hooks/useLocalizedDigits';
import styles from './NotificationsPage.module.css';

const PLACEHOLDERS = '{food1}، {food2}، {food3}';

/** Backend sentinel for an already-stored secret (never the real value). */
const SECRET_MASK = '__SECRET_SET__';

interface ChannelFieldMeta {
  key: string;
  label: string;
  secret?: boolean;
  placeholder?: string;
}

const CHANNEL_META: Record<
  ChannelKey,
  { label: string; desc: string; fields: ChannelFieldMeta[] }
> = {
  web_push: {
    label: 'نوتیفیکیشن وب (Web Push)',
    desc: 'پوش مرورگر برای کاربرانی که اجازه داده‌اند. کانال اصلی.',
    fields: [],
  },
  sms: {
    label: 'پیامک (کاوه‌نگار)',
    desc: '⚠️ پیامک به همهٔ مشتریان دارای شماره ',
    fields: [
      { key: 'apiKey', label: 'API Key', secret: true, placeholder: 'کلید API کاوه‌نگار' },
      { key: 'sender', label: 'شماره فرستنده', placeholder: '10008663' },
    ],
  },
  telegram: {
    label: 'تلگرام',
    desc: 'ارسال منوی روزانه به کانال/چت تلگرام. کاربران در کانال عضو می‌شوند.',
    fields: [
      { key: 'botToken', label: 'Bot Token', secret: true, placeholder: '123456:ABC...' },
      { key: 'chatId', label: 'شناسه چت / کانال', placeholder: '@my_channel یا -100...' },
    ],
  },
  bale: {
    label: 'بله',
    desc: 'ارسال منوی روزانه به کانال/چت بله.',
    fields: [
      { key: 'botToken', label: 'Bot Token', secret: true, placeholder: 'توکن ربات بله' },
      { key: 'chatId', label: 'شناسه چت / کانال', placeholder: '@my_channel یا شناسه عددی' },
    ],
  },
};

const CHANNEL_ORDER: ChannelKey[] = ['web_push', 'sms', 'telegram', 'bale'];

// ─── Template Form ────────────────────────────────────────────────────────────

interface TemplateFormProps {
  initial?: NotificationTemplate;
  onSave: (payload: CreateTemplatePayload) => void;
  onCancel: () => void;
  saving: boolean;
}

function TemplateForm({ initial, onSave, onCancel, saving }: TemplateFormProps) {
  const [key, setKey] = useState(initial?.key ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [actionUrl, setActionUrl] = useState(initial?.actionUrl ?? '/menu');
  const [actionLabel, setActionLabel] = useState(initial?.actionLabel ?? 'مشاهده منو');
  const [tag, setTag] = useState(initial?.tag ?? '');
  const bodyProps = useLocalizedDigits(body, setBody);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ key: key.trim(), title: title.trim(), body: body.trim(), actionUrl, actionLabel, tag: tag.trim() || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formRow}>
        <label className={styles.label}>کلید (key) *</label>
        <RawLocalizedInput
          className={styles.input}
          value={key}
          onChange={setKey}
          placeholder="daily_menu"
          required
          disabled={!!initial}
          dir="ltr"
        />
        <span className={styles.hint}>کلید یکتا — قابل ویرایش نیست بعد از ساخت</span>
      </div>

      <div className={styles.formRow}>
        <label className={styles.label}>عنوان *</label>
        <RawLocalizedInput
          className={styles.input}
          value={title}
          onChange={setTitle}
          placeholder="منوی امروز آماده‌ست 🍛"
          required
          maxLength={120}
        />
        <span className={styles.hint}>پلیس‌هولدر: {PLACEHOLDERS}</span>
      </div>

      <div className={styles.formRow}>
        <label className={styles.label}>متن اصلی *</label>
        <textarea
          className={styles.textarea}
          placeholder="{food1} و {food2} روی منوئه — بزن بریم!"
          required
          maxLength={400}
          rows={3}
          {...bodyProps}
        />
        <span className={styles.hint}>پلیس‌هولدرها با نام غذاهای امروز جایگزین می‌شن</span>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formRow}>
          <label className={styles.label}>لینک باز شدن</label>
          <RawLocalizedInput className={styles.input} value={actionUrl} onChange={setActionUrl} placeholder="/menu" dir="ltr" />
        </div>
        <div className={styles.formRow}>
          <label className={styles.label}>متن دکمه</label>
          <RawLocalizedInput className={styles.input} value={actionLabel} onChange={setActionLabel} placeholder="مشاهده منو" />
        </div>
        <div className={styles.formRow}>
          <label className={styles.label}>تگ (tag)</label>
          <RawLocalizedInput className={styles.input} value={tag} onChange={setTag} placeholder="daily-menu" dir="ltr" />
        </div>
      </div>

      <div className={styles.formActions}>
        <Button type="submit" variant="primary" loading={saving}>ذخیره</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>انصراف</Button>
      </div>
    </form>
  );
}

// ─── Send Form ────────────────────────────────────────────────────────────────

interface SendFormProps {
  templates: NotificationTemplate[];
  onSend: (payload: SendNotificationPayload) => void;
  sending: boolean;
}

function SendForm({ templates, onSend, sending }: SendFormProps) {
  const [selectedKey, setSelectedKey] = useState<string>('custom');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [actionUrl, setActionUrl] = useState('/menu');
  const bodyProps = useLocalizedDigits(body, setBody);

  function handleTemplateChange(key: string) {
    setSelectedKey(key);
    if (key !== 'custom') {
      const tpl = templates.find((t) => t.key === key);
      if (tpl) { setTitle(tpl.title); setBody(tpl.body); setActionUrl(tpl.actionUrl ?? '/menu'); }
    } else {
      setTitle(''); setBody(''); setActionUrl('/menu');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tpl = templates.find((t) => t.key === selectedKey);
    onSend({ title: title.trim(), body: body.trim(), actionUrl, templateId: tpl?.id });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formRow}>
        <label className={styles.label}>قالب</label>
        <CustomSelect
          value={selectedKey}
          onChange={handleTemplateChange}
          options={[
            { value: 'custom', label: '✏️ دستی (بدون قالب)' },
            ...templates.filter((t) => t.isActive).map((t) => ({ value: t.key, label: t.title })),
          ]}
        />
      </div>

      <div className={styles.sendGrid}>
        <div className={styles.formRow}>
          <label className={styles.label}>عنوان *</label>
          <RawLocalizedInput className={styles.input} value={title} onChange={setTitle} required maxLength={120} placeholder="عنوان نوتیفیکیشن" />
        </div>
        <div className={styles.formRow}>
          <label className={styles.label}>لینک باز شدن</label>
          <RawLocalizedInput className={styles.input} value={actionUrl} onChange={setActionUrl} dir="ltr" />
        </div>
      </div>

      <div className={styles.formRow}>
        <label className={styles.label}>متن *</label>
        <textarea className={styles.textarea} required maxLength={400} rows={2} placeholder="متن نوتیفیکیشن..." {...bodyProps} />
      </div>

      <div className={styles.sendFooter}>
        <p className={styles.sendWarning}>⚠️ بلافاصله برای همه مشترکین ارسال می‌شه.</p>
        <button type="submit" className={styles.sendBtn} disabled={sending}>
          <Send size={14} />
          ارسال همین الان
        </button>
      </div>
    </form>
  );
}

// ─── Schedule Card ──────────────────────────────────────────────────────────────

function ScheduleCard() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: schedule, isLoading } = useQuery({
    queryKey: ['admin', 'notifications', 'schedule'],
    queryFn: adminGetSchedule,
  });

  const [time, setTime] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);

  const currentTime = time ?? schedule?.tehranTime ?? '10:30';
  const currentEnabled = enabled ?? schedule?.isEnabled ?? true;

  const mutation = useMutation({
    mutationFn: adminUpdateSchedule,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'notifications', 'schedule'] });
      toast.success('زمان‌بندی ذخیره شد.');
      setTime(null);
      setEnabled(null);
    },
    onError: () => toast.error('خطا در ذخیرهٔ زمان‌بندی.'),
  });

  if (isLoading) return <Spinner />;

  return (
    <div className={styles.scheduleCard}>
      <div className={styles.scheduleRow}>
        <div className={styles.formRow}>
          <label className={styles.label}>ساعت ارسال روزانه (به وقت تهران)</label>
          <input
            type="time"
            dir="ltr"
            className={styles.timeInput}
            value={currentTime}
            onChange={(e) => setTime(e.target.value)}
          />
          <span className={styles.hint}>
            هر روز ساعت {toPersianDigits(currentTime)} به وقت تهران ارسال می‌شود.
          </span>
        </div>

        <label className={styles.switchLabel}>
          <input
            type="checkbox"
            checked={currentEnabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <span>{currentEnabled ? 'فعال' : 'غیرفعال'}</span>
        </label>
      </div>

      <div className={styles.formActions}>
        <Button
          type="button"
          variant="primary"
          loading={mutation.isPending}
          onClick={() =>
            mutation.mutate({ tehranTime: currentTime, isEnabled: currentEnabled })
          }
        >
          ذخیره زمان‌بندی
        </Button>
      </div>
    </div>
  );
}

// ─── Channels Card ──────────────────────────────────────────────────────────────

function ChannelRow({
  channel,
  onSave,
  saving,
}: {
  channel: NotificationChannel;
  onSave: (payload: { isEnabled: boolean; config: ChannelConfig }) => void;
  saving: boolean;
}) {
  const meta = CHANNEL_META[channel.channel];
  const [enabled, setEnabled] = useState(channel.isEnabled);
  const [config, setConfig] = useState<ChannelConfig>(() => {
    const init: ChannelConfig = {};
    for (const f of meta.fields) {
      // Secret fields start blank (stored value is masked); others prefill.
      init[f.key] = f.secret ? '' : channel.config[f.key] ?? '';
    }
    return init;
  });

  function handleSave() {
    onSave({ isEnabled: enabled, config });
  }

  return (
    <div className={clsx(styles.channelItem, !enabled && styles.tplDim)}>
      <div className={styles.channelHead}>
        <div>
          <span className={styles.channelName}>{meta.label}</span>
          <p className={styles.channelDesc}>{meta.desc}</p>
        </div>
        <label className={styles.switchLabel}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <span>{enabled ? 'فعال' : 'غیرفعال'}</span>
        </label>
      </div>

      {meta.fields.length > 0 && (
        <div className={styles.channelFields}>
          {meta.fields.map((f) => {
            const isStored = f.secret && channel.config[f.key] === SECRET_MASK;
            return (
              <div key={f.key} className={styles.formRow}>
                <label className={styles.label}>{f.label}</label>
                <RawLocalizedInput
                  className={styles.input}
                  value={config[f.key] ?? ''}
                  onChange={(v) => setConfig((c) => ({ ...c, [f.key]: v }))}
                  placeholder={isStored ? '•••••• (ذخیره شده)' : f.placeholder}
                  dir="ltr"
                  type={f.secret ? 'password' : 'text'}
                />
                {f.secret && (
                  <span className={styles.hint}>
                    {isStored
                      ? 'برای تغییر، مقدار جدید وارد کنید؛ خالی بگذارید تا همان بماند.'
                      : 'این مقدار محرمانه است و ذخیره می‌شود.'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.formActions}>
        <Button type="button" variant="primary" loading={saving} onClick={handleSave}>
          ذخیره
        </Button>
      </div>
    </div>
  );
}

function ChannelsCard() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: channels = [], isLoading } = useQuery({
    queryKey: ['admin', 'notifications', 'channels'],
    queryFn: adminListChannels,
  });

  const mutation = useMutation({
    mutationFn: ({ channel, payload }: { channel: ChannelKey; payload: { isEnabled: boolean; config: ChannelConfig } }) =>
      adminUpdateChannel(channel, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'notifications', 'channels'] });
      toast.success('کانال ذخیره شد.');
    },
    onError: () => toast.error('خطا در ذخیرهٔ کانال.'),
  });

  if (isLoading) return <Spinner />;

  const ordered = CHANNEL_ORDER.map((key) => channels.find((c) => c.channel === key)).filter(
    (c): c is NotificationChannel => Boolean(c),
  );

  return (
    <div className={styles.channelList}>
      {ordered.map((channel) => (
        <ChannelRow
          key={channel.channel}
          channel={channel}
          saving={mutation.isPending && mutation.variables?.channel === channel.channel}
          onSave={(payload) => mutation.mutate({ channel: channel.channel, payload })}
        />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'notifications', 'stats'],
    queryFn: adminGetNotificationStats,
    refetchInterval: 30_000,
  });

  const { data: templates = [], isLoading: tplLoading } = useQuery({
    queryKey: ['admin', 'notifications', 'templates'],
    queryFn: adminListTemplates,
  });

  const createMutation = useMutation({
    mutationFn: adminCreateTemplate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'notifications', 'templates'] });
      setShowNewForm(false);
      toast.success('قالب ساخته شد.');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'خطا در ساخت قالب.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateTemplatePayload> }) =>
      adminUpdateTemplate(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'notifications', 'templates'] });
      setEditingTemplate(null);
      toast.success('قالب بروزرسانی شد.');
    },
    onError: () => toast.error('خطا در بروزرسانی قالب.'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteTemplate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'notifications', 'templates'] });
      toast.success('قالب حذف شد.');
    },
    onError: () => toast.error('خطا در حذف قالب.'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminUpdateTemplate(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'notifications', 'templates'] }),
    onError: () => toast.error('خطا در تغییر وضعیت.'),
  });

  const sendMutation = useMutation({
    mutationFn: adminSendNotification,
    onSuccess: (result) => {
      setSendResult(result);
      qc.invalidateQueries({ queryKey: ['admin', 'notifications', 'stats'] });
    },
    onError: () => toast.error('خطا در ارسال نوتیفیکیشن.'),
  });

  function handleDelete(tpl: NotificationTemplate) {
    if (!window.confirm(`حذف قالب «${tpl.title}»؟`)) return;
    deleteMutation.mutate(tpl.id);
  }

  const weekSent = stats?.recentNotifications?.slice(0, 7).reduce((s, n) => s + n.totalSent, 0) ?? 0;
  const lastSent = stats?.recentNotifications?.[0]
    ? toJalaliWithTime(stats.recentNotifications[0].sentAt)
    : '—';

  return (
    <div className={styles.page}>

      {/* ── Stats ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><Bell size={15} />وضعیت سیستم</h2>
        {statsLoading ? <Spinner /> : (
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statVal}>{stats?.activeSubscriptions ?? 0}</span>
              <span className={styles.statLbl}>مشترک فعال</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statVal}>{weekSent}</span>
              <span className={styles.statLbl}>ارسال ۷ روز اخیر</span>
            </div>
            <div className={styles.statItem}>
              <span className={clsx(styles.statVal, styles.statDate)}>{lastSent}</span>
              <span className={styles.statLbl}>آخرین ارسال</span>
            </div>
          </div>
        )}
      </section>

      {/* ── Daily schedule ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><Clock size={15} />زمان ارسال روزانه</h2>
        <ScheduleCard />
      </section>

      {/* ── Delivery channels ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><Radio size={15} />کانال‌های ارسال</h2>
        <p className={styles.empty}>
          منوی روزانه به همهٔ کانال‌های فعال ارسال می‌شود. کانال‌های پیامک/تلگرام/بله برای
          کاربرانی که پوش وب ندارند.
        </p>
        <ChannelsCard />
      </section>

      {/* ── Send now ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><Send size={15} />ارسال دستی</h2>
        {sendResult && (
          <div className={styles.sendResult}>
            <CheckCircle size={13} />
            {sendResult.sent} ارسال موفق
            {sendResult.failed > 0 && (
              <span className={styles.resultFail}>
                <XCircle size={13} /> {sendResult.failed} ناموفق
              </span>
            )}
          </div>
        )}
        {tplLoading ? <Spinner /> : (
          <SendForm
            templates={templates}
            onSend={(payload) => { setSendResult(null); sendMutation.mutate(payload); }}
            sending={sendMutation.isPending}
          />
        )}
      </section>

      {/* ── Templates ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>قالب‌ها
            {templates.length > 0 && <span className={styles.count}>{templates.length}</span>}
          </h2>
          {!showNewForm && (
            <button
              type="button"
              className={styles.addBtn}
              onClick={() => { setShowNewForm(true); setEditingTemplate(null); }}
            >
              <Plus size={13} strokeWidth={2.5} />
              قالب جدید
            </button>
          )}
        </div>

        {showNewForm && (
          <div className={styles.formCard}>
            <p className={styles.formCardTitle}>قالب جدید</p>
            <TemplateForm
              onSave={(p) => createMutation.mutate(p)}
              onCancel={() => setShowNewForm(false)}
              saving={createMutation.isPending}
            />
          </div>
        )}

        {tplLoading ? <Spinner /> : (
          <div className={styles.tplList}>
            {templates.map((tpl) =>
              editingTemplate?.id === tpl.id ? (
                <div key={tpl.id} className={styles.formCard}>
                  <p className={styles.formCardTitle}>ویرایش: {tpl.key}</p>
                  <TemplateForm
                    initial={tpl}
                    onSave={(p) => updateMutation.mutate({ id: tpl.id, payload: p })}
                    onCancel={() => setEditingTemplate(null)}
                    saving={updateMutation.isPending}
                  />
                </div>
              ) : (
                <div key={tpl.id} className={clsx(styles.tplItem, !tpl.isActive && styles.tplDim)}>
                  <div className={styles.tplRow}>
                    <code className={styles.tplKey}>{tpl.key}</code>
                    <span className={styles.tplTitle}>{tpl.title}</span>
                    <span className={clsx(styles.badge, tpl.isActive ? styles.badgeOn : styles.badgeOff)}>
                      {tpl.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={clsx(styles.iconBtn, tpl.isActive ? styles.iconBtnOn : styles.iconBtnOff)}
                        title={tpl.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                        onClick={() => toggleMutation.mutate({ id: tpl.id, isActive: !tpl.isActive })}
                        disabled={toggleMutation.isPending}
                      >
                        {tpl.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      <button
                        type="button"
                        className={clsx(styles.iconBtn, styles.iconBtnEdit)}
                        title="ویرایش"
                        onClick={() => { setEditingTemplate(tpl); setShowNewForm(false); }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        className={clsx(styles.iconBtn, styles.iconBtnDel)}
                        title="حذف"
                        onClick={() => handleDelete(tpl)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className={styles.tplBody}>{tpl.body}</p>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      {/* ── History ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>تاریخچه ارسال</h2>
        {statsLoading ? <Spinner /> : !stats?.recentNotifications?.length ? (
          <p className={styles.empty}>هنوز هیچ نوتیفیکیشنی ارسال نشده.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>زمان ارسال</th>
                  <th>موفق</th>
                  <th>ناموفق</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentNotifications.map((log) => (
                  <tr key={log.id}>
                    <td>{log.title}</td>
                    <td dir="ltr">{toJalaliWithTime(log.sentAt)}</td>
                    <td className={styles.sent}>{log.totalSent}</td>
                    <td className={log.totalFailed > 0 ? styles.failed : ''}>{log.totalFailed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
