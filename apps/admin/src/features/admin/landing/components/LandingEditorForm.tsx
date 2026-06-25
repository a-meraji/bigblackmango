import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import IconButton from '@components/icon-button/IconButton';
import FormErrorBanner from '@components/form-error-banner/FormErrorBanner';
import IconPicker from '@components/icon-picker/IconPicker';
import { MediaPickerField } from '@components/media-picker';
import FaqEditor from '@features/admin/party-services/components/FaqEditor';
import { adminGetLanding, adminUpdateLanding } from '@api/admin/landing';
import type {
  AdminLandingPage,
  LandingFinalCta,
  LandingFoodShowcase,
  LandingFooterContent,
  LandingHowItWorks,
  LandingPartySection,
  LandingTestimonial,
  UpdateLandingPayload,
} from '@t/landing';
import type { FaqItem, ServiceStat } from '@t/party-service';
import { useToast } from '@hooks/useToast';
import Spinner from '@components/spinner/Spinner';
import LandingCardListEditor from './LandingCardListEditor';
import LandingFoodPicker from './LandingFoodPicker';
import LandingLinksEditor from './LandingLinksEditor';
import LandingTestimonialsEditor from './LandingTestimonialsEditor';
import styles from './LandingEditorForm.module.css';

export default function LandingEditorForm() {
  const qc = useQueryClient();
  const toast = useToast();
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [heroImageAlt, setHeroImageAlt] = useState('');
  const [heroBadge, setHeroBadge] = useState('');
  const [heroTrustLine, setHeroTrustLine] = useState('');
  const [socialItems, setSocialItems] = useState<string[]>([]);
  const [foodShowcase, setFoodShowcase] = useState<
    LandingFoodShowcase & { featuredFoodIds: string[] }
  >({
    sectionTitle: '',
    sectionIcon: null,
    lead: '',
    featuredFoodIds: [],
  });
  const [stats, setStats] = useState<ServiceStat[]>([]);
  const [trustSectionTitle, setTrustSectionTitle] = useState('');
  const [howItWorks, setHowItWorks] = useState<LandingHowItWorks>({
    sectionTitle: '',
    steps: [],
  });
  const [partySection, setPartySection] = useState<LandingPartySection>({
    title: '',
    caption: '',
  });
  const [testimonials, setTestimonials] = useState<LandingTestimonial[]>([]);
  const [testimonialsSectionTitle, setTestimonialsSectionTitle] = useState('');
  const [faq, setFaq] = useState<FaqItem[]>([]);
  const [finalCta, setFinalCta] = useState<LandingFinalCta>({
    title: '',
    subtitle: '',
    trustItems: [],
    links: [],
  });
  const [footer, setFooter] = useState<LandingFooterContent>({
    brandName: '',
    tagline: '',
    phone: '',
    address: '',
    hours: '',
    quickLinks: [],
  });
  const [isActive, setIsActive] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [foodShowcaseIconOpen, setFoodShowcaseIconOpen] = useState(false);
  const [openStatIconIndex, setOpenStatIconIndex] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'landing'],
    queryFn: adminGetLanding,
  });

  useEffect(() => {
    if (!data) return;
    applyLanding(data);
  }, [data]);

  function applyLanding(landing: AdminLandingPage) {
    setHeroTitle(landing.heroTitle);
    setHeroSubtitle(landing.heroSubtitle ?? '');
    setHeroImageUrl(landing.heroImageUrl ?? '');
    setHeroImageAlt(landing.heroImageAlt ?? '');
    setHeroBadge(landing.heroBadge);
    setHeroTrustLine(landing.heroTrustLine);
    setSocialItems(landing.socialStrip.items);
    setFoodShowcase(landing.foodShowcase);
    setStats(landing.stats);
    setTrustSectionTitle(landing.trustSectionTitle);
    setHowItWorks(landing.howItWorks);
    setPartySection(landing.partySection);
    setTestimonials(landing.testimonials);
    setTestimonialsSectionTitle(landing.testimonialsSectionTitle);
    setFaq(landing.faq);
    setFinalCta(landing.finalCta);
    setFooter(landing.footer);
    setIsActive(landing.isActive);
  }

  const saveMutation = useMutation({
    mutationFn: (payload: UpdateLandingPayload) => adminUpdateLanding(payload),
    onSuccess: (landing) => {
      applyLanding(landing);
      qc.invalidateQueries({ queryKey: ['admin', 'landing'] });
      qc.invalidateQueries({ queryKey: ['landing'] });
      toast.success('صفحه لندینگ ذخیره شد.');
      setSubmitError(null);
    },
    onError: () => {
      setSubmitError('ذخیره ناموفق بود.');
      toast.error('ذخیره ناموفق بود.');
    },
  });

  function addStat() {
    setStats((s) => [...s, { label: '', value: '', icon: null }]);
  }

  function removeStat(i: number) {
    setStats((s) => s.filter((_, idx) => idx !== i));
    if (openStatIconIndex === i) setOpenStatIconIndex(null);
    else if (openStatIconIndex !== null && openStatIconIndex > i) {
      setOpenStatIconIndex(openStatIconIndex - 1);
    }
  }

  function updateStat(i: number, field: 'label' | 'value', val: string) {
    setStats((s) => s.map((stat, idx) => (idx === i ? { ...stat, [field]: val } : stat)));
  }

  function updateStatIcon(i: number, iconName: string | null) {
    setStats((s) => s.map((stat, idx) => (idx === i ? { ...stat, icon: iconName } : stat)));
  }

  function addSocialItem() {
    if (socialItems.length >= 6) return;
    setSocialItems((items) => [...items, '']);
  }

  function removeSocialItem(index: number) {
    setSocialItems((items) => items.filter((_, i) => i !== index));
  }

  function updateSocialItem(index: number, value: string) {
    setSocialItems((items) => items.map((item, i) => (i === index ? value : item)));
  }

  function addTrustItem() {
    if (finalCta.trustItems.length >= 8) return;
    setFinalCta((cta) => ({ ...cta, trustItems: [...cta.trustItems, ''] }));
  }

  function removeTrustItem(index: number) {
    setFinalCta((cta) => ({
      ...cta,
      trustItems: cta.trustItems.filter((_, i) => i !== index),
    }));
  }

  function updateTrustItem(index: number, value: string) {
    setFinalCta((cta) => ({
      ...cta,
      trustItems: cta.trustItems.map((item, i) => (i === index ? value : item)),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!heroTitle.trim()) {
      setSubmitError('عنوان هیرو الزامی است.');
      return;
    }

    const payload: UpdateLandingPayload = {
      heroTitle: heroTitle.trim(),
      heroSubtitle: heroSubtitle.trim() || undefined,
      heroImageUrl: heroImageUrl.trim() || undefined,
      heroImageAlt: heroImageAlt.trim() || undefined,
      heroBadge: heroBadge.trim() || undefined,
      heroTrustLine: heroTrustLine.trim() || undefined,
      socialStrip: {
        items: socialItems.map((item) => item.trim()).filter(Boolean),
      },
      foodShowcase: {
        sectionTitle: foodShowcase.sectionTitle.trim(),
        sectionIcon: foodShowcase.sectionIcon,
        lead: foodShowcase.lead.trim(),
        featuredFoodIds: foodShowcase.featuredFoodIds,
      },
      stats: stats.filter((s) => s.label.trim() && s.value.trim()),
      trustSectionTitle: trustSectionTitle.trim() || undefined,
      howItWorks: {
        sectionTitle: howItWorks.sectionTitle.trim(),
        steps: howItWorks.steps.filter((step) => step.title.trim() && step.body.trim()),
      },
      partySection: {
        title: partySection.title.trim(),
        caption: partySection.caption.trim(),
      },
      testimonials: testimonials.filter((t) => t.authorName.trim() && t.text.trim()),
      testimonialsSectionTitle: testimonialsSectionTitle.trim() || undefined,
      faq: faq.filter((f) => f.question.trim() && f.answer.trim()),
      finalCta: {
        title: finalCta.title.trim(),
        subtitle: finalCta.subtitle.trim(),
        trustItems: finalCta.trustItems.map((item) => item.trim()).filter(Boolean),
        links: finalCta.links.filter((link) => link.label.trim() && link.href.trim()),
      },
      footer: {
        brandName: footer.brandName.trim(),
        tagline: footer.tagline.trim(),
        phone: footer.phone.trim(),
        address: footer.address.trim(),
        hours: footer.hours.trim(),
        quickLinks: footer.quickLinks.filter((link) => link.label.trim() && link.href.trim()),
      },
      isActive,
    };

    saveMutation.mutate(payload);
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" label="در حال بارگذاری" />
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {submitError && <FormErrorBanner message={submitError} />}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>هیرو</h2>
        <div className={styles.heroTitleRow}>
          <Input label="نشان" value={heroBadge} onChange={(e) => setHeroBadge(e.target.value)} />
          <Input
            label="عنوان"
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            required
          />
          <Input
            label="زیرعنوان"
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
          />
        </div>
        <MediaPickerField
          label="تصویر هیرو"
          value={heroImageUrl}
          onChange={setHeroImageUrl}
          allowedTypes="image"
          uploadFolder="general"
          previewAlt={heroImageAlt || heroTitle || 'تصویر هیرو'}
        />
        <div className={styles.heroMetaRow}>
          <Input
            label="متن جایگزین تصویر"
            value={heroImageAlt}
            onChange={(e) => setHeroImageAlt(e.target.value)}
          />
          <Input
            label="خط اعتماد"
            value={heroTrustLine}
            onChange={(e) => setHeroTrustLine(e.target.value)}
          />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>نوار اعتماد</h2>
          <button type="button" className={styles.addBtn} onClick={addSocialItem}>
            + افزودن
          </button>
        </div>
        {socialItems.length > 0 && (
          <div className={styles.socialStripGrid}>
            {socialItems.map((item, index) => (
              <div key={index} className={styles.socialStripCell}>
                <span className={styles.socialStripCellLabel}>ستون {index + 1}</span>
                <div className={styles.socialStripCellInner}>
                  <Input
                    value={item}
                    onChange={(e) => updateSocialItem(index, e.target.value)}
                    aria-label={`ستون ${index + 1}`}
                    className={styles.socialStripInput}
                  />
                  <IconButton
                    icon={Trash2}
                    label={`حذف ستون ${index + 1}`}
                    variant="ghost"
                    className={styles.socialStripRemove}
                    onClick={() => removeSocialItem(index)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>نمایش غذاها</h2>
        <div className={styles.cardFieldsGrid}>
          <Input
            label="عنوان بخش"
            value={foodShowcase.sectionTitle}
            onChange={(e) =>
              setFoodShowcase((s) => ({ ...s, sectionTitle: e.target.value }))
            }
          />
          <IconPicker
            label="آیکون"
            value={foodShowcase.sectionIcon}
            onChange={(icon) => setFoodShowcase((s) => ({ ...s, sectionIcon: icon }))}
            layout="gridSpan"
            open={foodShowcaseIconOpen}
            onOpenChange={setFoodShowcaseIconOpen}
          />
          <Input
            label="متن راهنما"
            value={foodShowcase.lead}
            onChange={(e) => setFoodShowcase((s) => ({ ...s, lead: e.target.value }))}
          />
        </div>
        <LandingFoodPicker
          selectedIds={foodShowcase.featuredFoodIds}
          onChange={(featuredFoodIds) =>
            setFoodShowcase((s) => ({ ...s, featuredFoodIds }))
          }
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>آمار اعتماد</h2>
          <button type="button" className={styles.addBtn} onClick={addStat}>
            + افزودن
          </button>
        </div>
        <Input
          label="عنوان بخش آمار"
          value={trustSectionTitle}
          onChange={(e) => setTrustSectionTitle(e.target.value)}
        />
        {stats.map((stat, i) => (
          <div key={i} className={styles.cardItem}>
            <div className={styles.cardItemHeader}>
              <span className={styles.rowLabel}>آمار {i + 1}</span>
              <IconButton
                icon={Trash2}
                label={`حذف آمار ${i + 1}`}
                variant="ghost"
                className={styles.cardRemoveBtn}
                onClick={() => removeStat(i)}
              />
            </div>
            <div className={styles.cardFieldsGrid}>
              <Input
                label="برچسب"
                value={stat.label}
                onChange={(e) => updateStat(i, 'label', e.target.value)}
              />
              <Input
                label="مقدار"
                value={stat.value}
                onChange={(e) => updateStat(i, 'value', e.target.value)}
              />
              <IconPicker
                label="آیکون"
                value={stat.icon ?? null}
                onChange={(icon) => updateStatIcon(i, icon)}
                layout="gridSpan"
                open={openStatIconIndex === i}
                onOpenChange={(open) => setOpenStatIconIndex(open ? i : null)}
              />
            </div>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>مراحل سفارش</h2>
        <Input
          label="عنوان بخش"
          value={howItWorks.sectionTitle}
          onChange={(e) => setHowItWorks((s) => ({ ...s, sectionTitle: e.target.value }))}
        />
        <LandingCardListEditor
          label="قدم‌ها"
          items={howItWorks.steps}
          onChange={(steps) => setHowItWorks((s) => ({ ...s, steps }))}
          itemLabel="قدم"
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>بخش پذیرایی و مجالس</h2>
        <p className={styles.hint}>اسلایدها از بخش «بنرهای کیترینگ» مدیریت می‌شوند.</p>
        <div className={styles.heroMetaRow}>
          <Input
            label="عنوان"
            value={partySection.title}
            onChange={(e) => setPartySection((s) => ({ ...s, title: e.target.value }))}
          />
          <Input
            label="زیرنویس"
            value={partySection.caption}
            onChange={(e) => setPartySection((s) => ({ ...s, caption: e.target.value }))}
          />
        </div>
      </section>

      <LandingTestimonialsEditor
        sectionTitle={testimonialsSectionTitle}
        onSectionTitleChange={setTestimonialsSectionTitle}
        testimonials={testimonials}
        onChange={setTestimonials}
      />

      <section className={styles.section}>
        <FaqEditor faq={faq} onChange={setFaq} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>دعوت نهایی (CTA)</h2>
        <div className={styles.heroMetaRow}>
          <Input
            label="عنوان"
            value={finalCta.title}
            onChange={(e) => setFinalCta((s) => ({ ...s, title: e.target.value }))}
          />
          <Input
            label="زیرعنوان"
            value={finalCta.subtitle}
            onChange={(e) => setFinalCta((s) => ({ ...s, subtitle: e.target.value }))}
          />
        </div>
        <div className={styles.sectionHeader}>
          <span className={styles.subLabel}>مزایا</span>
          <button type="button" className={styles.addBtn} onClick={addTrustItem}>
            + افزودن
          </button>
        </div>
        {finalCta.trustItems.length > 0 && (
          <div className={styles.socialStripGrid}>
            {finalCta.trustItems.map((item, index) => (
              <div key={index} className={styles.socialStripCell}>
                <span className={styles.socialStripCellLabel}>مزیت {index + 1}</span>
                <div className={styles.socialStripCellInner}>
                  <Input
                    value={item}
                    onChange={(e) => updateTrustItem(index, e.target.value)}
                    aria-label={`مزیت ${index + 1}`}
                    className={styles.socialStripInput}
                  />
                  <IconButton
                    icon={Trash2}
                    label={`حذف مزیت ${index + 1}`}
                    variant="ghost"
                    className={styles.socialStripRemove}
                    onClick={() => removeTrustItem(index)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <LandingLinksEditor
          label="لینک‌های اضافی"
          links={finalCta.links}
          onChange={(links) => setFinalCta((s) => ({ ...s, links }))}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>پاورقی</h2>
        <Input label="نام برند" value={footer.brandName} onChange={(e) => setFooter((s) => ({ ...s, brandName: e.target.value }))} />
        <Input label="شعار" value={footer.tagline} onChange={(e) => setFooter((s) => ({ ...s, tagline: e.target.value }))} />
        <Input label="تلفن" value={footer.phone} onChange={(e) => setFooter((s) => ({ ...s, phone: e.target.value }))} />
        <Input label="آدرس" value={footer.address} onChange={(e) => setFooter((s) => ({ ...s, address: e.target.value }))} />
        <Input label="ساعات کاری" value={footer.hours} onChange={(e) => setFooter((s) => ({ ...s, hours: e.target.value }))} />
        <LandingLinksEditor
          label="لینک‌های سریع"
          links={footer.quickLinks}
          onChange={(quickLinks) => setFooter((s) => ({ ...s, quickLinks }))}
        />
      </section>

      <div className={styles.formFooterSpacer} aria-hidden="true" />

      <div className={styles.formFooter}>
        <label className={styles.checkbox}>
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          <span>صفحه لندینگ فعال است</span>
        </label>
        <Button type="submit" loading={saveMutation.isPending}>
          ذخیره تغییرات
        </Button>
      </div>
    </form>
  );
}
