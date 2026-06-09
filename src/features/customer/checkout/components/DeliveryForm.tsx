import { useState, useEffect } from 'react';
import { useAuthStore } from '@store/auth.store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile, createAddress, updateProfile } from '@api/profile';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import type { CheckoutPayload } from '@t/checkout';
import type { DiscountValidationResult } from '@t/discount-code';
import { isValidIranianMobile } from '@utils/validators';
import AddressPicker from './AddressPicker';
import CheckoutOrderSummary from './CheckoutOrderSummary';
import DiscountCodeInput from './DiscountCodeInput';
import styles from './DeliveryForm.module.css';

interface CartPricing {
  subtotal: number;
  deliveryFee: number;
  total: number;
}

interface Props {
  onSubmit: (payload: CheckoutPayload) => void | Promise<void>;
  loading: boolean;
  cartPricing: CartPricing | null;
  appliedDiscount: DiscountValidationResult | null;
  onDiscountApplied: (result: DiscountValidationResult) => void;
  onDiscountClear: () => void;
}

export default function DeliveryForm({
  onSubmit,
  loading,
  cartPricing,
  appliedDiscount,
  onDiscountApplied,
  onDiscountClear,
}: Props) {
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['me'],
    queryFn: getProfile,
    enabled: isAuthenticated,
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>();
  const [addressMode, setAddressMode] = useState<'saved' | 'new'>('new');
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newAddressUnit, setNewAddressUnit] = useState('');
  const [newAddressPostal, setNewAddressPostal] = useState('');
  const [newAddressNotes, setNewAddressNotes] = useState('');
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName ?? '');
    setLastName(profile.lastName ?? '');
    setMobile(profile.mobile ?? '');
    if (profile.addresses.length > 0) {
      const defaultAddr = profile.addresses.find((a) => a.isDefault) ?? profile.addresses[0];
      setSelectedAddressId(defaultAddr.id);
      setAddressMode('saved');
    } else {
      setSelectedAddressId(undefined);
      setAddressMode('new');
    }
  }, [profile]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'نام الزامی است';
    if (!lastName.trim()) e.lastName = 'نام خانوادگی الزامی است';
    if (!mobile.trim()) e.mobile = 'شماره موبایل الزامی است';
    else if (!isValidIranianMobile(mobile.trim())) e.mobile = 'شماره موبایل معتبر نیست';

    if (addressMode === 'saved') {
      if (!selectedAddressId) e.address = 'یک آدرس انتخاب کنید';
    } else {
      if (!newAddressLine.trim()) e.address = 'آدرس الزامی است';
      if (saveNewAddress && !newAddressLabel.trim()) {
        e.addressLabel = 'برای ذخیره، عنوان آدرس را وارد کنید';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    let payload: CheckoutPayload;

    if (addressMode === 'saved' && selectedAddressId) {
      payload = {
        contact: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          mobile: mobile.trim(),
        },
        addressId: selectedAddressId,
      };
    } else if (saveNewAddress && newAddressLine.trim()) {
      try {
        const created = await createAddress({
          label: newAddressLabel.trim() || 'آدرس',
          addressLine: newAddressLine.trim(),
          unit: newAddressUnit.trim() || undefined,
          postalCode: newAddressPostal.trim() || undefined,
          notes: newAddressNotes.trim() || undefined,
        });
        await qc.invalidateQueries({ queryKey: ['me'] });
        payload = {
          contact: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            mobile: mobile.trim(),
          },
          addressId: created.id,
        };
      } catch {
        setErrors((prev) => ({
          ...prev,
          address: 'ذخیره آدرس ناموفق بود. دوباره تلاش کنید یا بدون ذخیره ادامه دهید.',
        }));
        return;
      }
    } else {
      payload = {
        contact: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          mobile: mobile.trim(),
        },
        address: {
          label: newAddressLabel.trim() || undefined,
          addressLine: newAddressLine.trim(),
          unit: newAddressUnit.trim() || undefined,
          postalCode: newAddressPostal.trim() || undefined,
          notes: newAddressNotes.trim() || undefined,
        },
      };
    }

    // Persist name back to profile for future autofill
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (fn && ln && (fn !== (profile?.firstName ?? '') || ln !== (profile?.lastName ?? ''))) {
      updateProfile({ firstName: fn, lastName: ln })
        .then(() => qc.invalidateQueries({ queryKey: ['me'] }))
        .catch(() => {});
    }

    await onSubmit({
      ...payload,
      ...(appliedDiscount ? { discountCode: appliedDiscount.discount.code } : {}),
    });
  }

  const displayPricing = appliedDiscount?.pricing ?? cartPricing;

  const hasSavedAddresses = Boolean(profile?.addresses.length);
  const showNewAddressFields = !hasSavedAddresses || addressMode === 'new';

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className={styles.form} noValidate>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>اطلاعات تحویل گیرنده</h2>
        <Input
          label="نام"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errors.firstName}
          autoComplete="given-name"
          required
        />
        <Input
          label="نام خانوادگی"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={errors.lastName}
          autoComplete="family-name"
          required
        />
        <Input
          label="شماره موبایل"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          error={errors.mobile}
          type="tel"
          inputMode="numeric"
          dir="ltr"
          autoComplete="tel"
          required
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>آدرس تحویل</h2>

        {hasSavedAddresses && profile && (
          <AddressPicker
            addresses={profile.addresses}
            selectedId={addressMode === 'saved' ? selectedAddressId : undefined}
            onSelectSaved={(id) => {
              setAddressMode('saved');
              setSelectedAddressId(id);
            }}
            onChooseNew={() => {
              setAddressMode('new');
              setSelectedAddressId(undefined);
            }}
            disabled={loading}
          />
        )}

        {showNewAddressFields && (
          <>
            {saveNewAddress && (
              <Input
                label="عنوان آدرس (مثلاً منزل، محل کار)"
                value={newAddressLabel}
                onChange={(e) => setNewAddressLabel(e.target.value)}
                error={errors.addressLabel}
                autoComplete="off"
              />
            )}
            <Input
              label="آدرس پستی"
              value={newAddressLine}
              onChange={(e) => setNewAddressLine(e.target.value)}
              error={errors.address}
              autoComplete="street-address"
              required
            />
            <Input
              label="واحد"
              value={newAddressUnit}
              onChange={(e) => setNewAddressUnit(e.target.value)}
              autoComplete="address-line2"
            />
            <Input
              label="کد پستی (اختیاری)"
              value={newAddressPostal}
              onChange={(e) => setNewAddressPostal(e.target.value)}
              dir="ltr"
              autoComplete="postal-code"
            />
            <Input
              label="توضیحات (اختیاری)"
              value={newAddressNotes}
              onChange={(e) => setNewAddressNotes(e.target.value)}
            />
            <label className={styles.saveRow}>
              <input
                type="checkbox"
                checked={saveNewAddress}
                onChange={(e) => setSaveNewAddress(e.target.checked)}
              />
              <span>ذخیره در آدرس‌های من</span>
            </label>
          </>
        )}
      </section>

      {displayPricing && <CheckoutOrderSummary pricing={displayPricing} />}

      <DiscountCodeInput
        appliedCode={appliedDiscount?.discount.code ?? null}
        onApplied={onDiscountApplied}
        onClear={onDiscountClear}
        disabled={loading}
      />

      <Button type="submit" fullWidth loading={loading}>
        تایید و پرداخت
      </Button>
    </form>
  );
}
