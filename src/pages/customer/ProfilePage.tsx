import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus, X, Check, Phone, LogOut } from 'lucide-react';
import {
  getProfile,
  updateProfile,
  createAddress,
  updateAddress,
  deleteAddress,
} from '@api/profile';
import type { Address } from '@api/profile';
import { logout } from '@api/auth';
import { useAuthStore } from '@store/auth.store';
import PageShell from '@components/page-shell/PageShell';
import Skeleton from '@components/skeleton/Skeleton';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import { useToast } from '@hooks/useToast';
import { formatDigits } from '@utils/locale';
import styles from './ProfilePage.module.css';

type AddressFormState = {
  label: string;
  addressLine: string;
  unit: string;
  postalCode: string;
  notes: string;
};

const emptyForm = (): AddressFormState => ({
  label: '',
  addressLine: '',
  unit: '',
  postalCode: '',
  notes: '',
});

export default function ProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const clearUser = useAuthStore((s) => s.clearUser);
  const toast = useToast();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getProfile,
  });

  // Name editing
  const [editingName, setEditingName] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  function startEditName() {
    setFirstName(profile?.firstName ?? '');
    setLastName(profile?.lastName ?? '');
    setEditingName(true);
  }

  const updateNameMutation = useMutation({
    mutationFn: () => updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      setEditingName(false);
      toast.success('نام با موفقیت ذخیره شد');
    },
    onError: () => toast.error('ذخیره نام ناموفق بود'),
  });

  // Address management
  const [addingAddress, setAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyForm);

  function startAddAddress() {
    setEditingAddressId(null);
    setAddressForm(emptyForm());
    setAddingAddress(true);
  }

  function startEditAddress(addr: Address) {
    setAddingAddress(false);
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label ?? '',
      addressLine: addr.addressLine,
      unit: addr.unit ?? '',
      postalCode: addr.postalCode ?? '',
      notes: addr.notes ?? '',
    });
  }

  function cancelAddressForm() {
    setAddingAddress(false);
    setEditingAddressId(null);
    setAddressForm(emptyForm());
  }

  const createAddressMutation = useMutation({
    mutationFn: () =>
      createAddress({
        label: addressForm.label.trim() || undefined,
        addressLine: addressForm.addressLine.trim(),
        unit: addressForm.unit.trim() || undefined,
        postalCode: addressForm.postalCode.trim() || undefined,
        notes: addressForm.notes.trim() || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      cancelAddressForm();
      toast.success('آدرس اضافه شد');
    },
    onError: () => toast.error('افزودن آدرس ناموفق بود'),
  });

  const updateAddressMutation = useMutation({
    mutationFn: (id: string) =>
      updateAddress(id, {
        label: addressForm.label.trim() || undefined,
        addressLine: addressForm.addressLine.trim(),
        unit: addressForm.unit.trim() || undefined,
        postalCode: addressForm.postalCode.trim() || undefined,
        notes: addressForm.notes.trim() || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      cancelAddressForm();
      toast.success('آدرس ویرایش شد');
    },
    onError: () => toast.error('ویرایش آدرس ناموفق بود'),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('آدرس حذف شد');
    },
    onError: () => toast.error('حذف آدرس ناموفق بود'),
  });

  async function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!addressForm.addressLine.trim()) return;
    if (editingAddressId) {
      updateAddressMutation.mutate(editingAddressId);
    } else {
      createAddressMutation.mutate();
    }
  }

  const addressMutating =
    createAddressMutation.isPending || updateAddressMutation.isPending;

  async function handleLogout() {
    // Leave the protected route before clearing auth — otherwise RequireAuth
    // redirects to /auth/otp before navigate('/') can run.
    navigate('/', { replace: true });
    try {
      await logout();
    } finally {
      clearUser();
    }
  }

  if (isLoading) {
    return (
      <PageShell narrow>
        <div className={styles.loading}>
          <Skeleton height={28} width={160} borderRadius="var(--radius-md)" />
          <Skeleton height={120} borderRadius="var(--radius-lg)" />
          <Skeleton height={160} borderRadius="var(--radius-lg)" />
        </div>
      </PageShell>
    );
  }

  const addresses = profile?.addresses ?? [];

  return (
    <PageShell narrow>
      <h1 className={styles.title}>پروفایل</h1>

      {/* Name / identity section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>اطلاعات شخصی</h2>
          {!editingName && (
            <Button variant="ghost" size="sm" onClick={startEditName}>
              <Pencil size={14} aria-hidden />
              &nbsp;ویرایش
            </Button>
          )}
        </div>

        {editingName ? (
          <div className={styles.infoRow}>
            <Input
              label="نام"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
            />
            <Input
              label="نام خانوادگی"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
            />
            <div className={styles.formActions}>
              <Button
                size="sm"
                onClick={() => updateNameMutation.mutate()}
                loading={updateNameMutation.isPending}
              >
                <Check size={14} aria-hidden />
                &nbsp;ذخیره
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingName(false)}
                disabled={updateNameMutation.isPending}
              >
                <X size={14} aria-hidden />
                &nbsp;لغو
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.infoRow}>
            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-size-sm)' }}>
                نام و نام خانوادگی
              </span>
              <p style={{ margin: '4px 0 0', fontWeight: 500, color: 'var(--text-heading)' }}>
                {[profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || '—'}
              </p>
            </div>
          </div>
        )}

        <div className={styles.metaRow}>
          <Phone size={15} aria-hidden />
          <span className={styles.metaLabel}>موبایل:</span>
          <span dir="ltr">{profile?.mobile ? formatDigits(profile.mobile) : '—'}</span>
        </div>
      </section>

      {/* Addresses section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>آدرس‌های من</h2>
          {!addingAddress && !editingAddressId && (
            <Button variant="ghost" size="sm" onClick={startAddAddress}>
              <Plus size={14} aria-hidden />
              &nbsp;افزودن
            </Button>
          )}
        </div>

        {addresses.length > 0 && (
          <ul className={styles.addressList}>
            {addresses.map((addr) =>
              editingAddressId === addr.id ? (
                <li key={addr.id}>
                  <AddressForm
                    title="ویرایش آدرس"
                    value={addressForm}
                    onChange={setAddressForm}
                    onSubmit={handleAddressSubmit}
                    onCancel={cancelAddressForm}
                    loading={addressMutating}
                  />
                </li>
              ) : (
                <li key={addr.id} className={styles.addressCard}>
                  <div className={styles.addressCardHeader}>
                    <span className={styles.addressLabel}>
                      {addr.label?.trim() || 'آدرس'}
                      {addr.isDefault && <span className={styles.defaultBadge}>پیش‌فرض</span>}
                    </span>
                    <div className={styles.addressActions}>
                      <button
                        type="button"
                        className={styles.addressActionBtn}
                        onClick={() => startEditAddress(addr)}
                        aria-label="ویرایش آدرس"
                        disabled={deleteAddressMutation.isPending}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.addressActionBtn} ${styles.danger}`}
                        onClick={() => deleteAddressMutation.mutate(addr.id)}
                        aria-label="حذف آدرس"
                        disabled={deleteAddressMutation.isPending}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <p className={styles.addressLine}>
                    {addr.addressLine}
                    {addr.unit ? ` — واحد ${addr.unit}` : ''}
                  </p>
                </li>
              ),
            )}
          </ul>
        )}

        {addingAddress && (
          <div style={{ marginBlockStart: addresses.length > 0 ? 'var(--space-3)' : undefined }}>
            <AddressForm
              title="آدرس جدید"
              value={addressForm}
              onChange={setAddressForm}
              onSubmit={handleAddressSubmit}
              onCancel={cancelAddressForm}
              loading={addressMutating}
            />
          </div>
        )}

        {addresses.length === 0 && !addingAddress && (
          <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-size-sm)', margin: 0 }}>
            هنوز آدرسی ذخیره نشده است.
          </p>
        )}
      </section>

      {/* Logout */}
      <div className={styles.logoutSection}>
        <Button variant="ghost" fullWidth onClick={() => void handleLogout()}>
          <LogOut size={16} aria-hidden />
          &nbsp;خروج از حساب
        </Button>
      </div>
    </PageShell>
  );
}

interface AddressFormProps {
  title: string;
  value: AddressFormState;
  onChange: (v: AddressFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
}

function AddressForm({ title, value, onChange, onSubmit, onCancel, loading }: AddressFormProps) {
  function field(key: keyof AddressFormState) {
    return (v: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...value, [key]: v.target.value });
  }

  return (
    <form className={styles.addressForm} onSubmit={onSubmit} noValidate>
      <p className={styles.addressFormTitle}>{title}</p>
      <Input
        label="عنوان (مثلاً منزل، محل کار)"
        value={value.label}
        onChange={field('label')}
        autoComplete="off"
      />
      <Input
        label="آدرس پستی"
        value={value.addressLine}
        onChange={field('addressLine')}
        autoComplete="street-address"
        required
      />
      <Input
        label="واحد"
        value={value.unit}
        onChange={field('unit')}
        autoComplete="address-line2"
      />
      <Input
        label="کد پستی (اختیاری)"
        value={value.postalCode}
        onChange={field('postalCode')}
        dir="ltr"
        autoComplete="postal-code"
      />
      <Input
        label="توضیحات (اختیاری)"
        value={value.notes}
        onChange={field('notes')}
      />
      <div className={styles.addressFormActions}>
        <Button type="submit" size="sm" loading={loading}>
          ذخیره
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
          لغو
        </Button>
      </div>
    </form>
  );
}
