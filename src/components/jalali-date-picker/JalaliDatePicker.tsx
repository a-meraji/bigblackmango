import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import clsx from 'clsx';
import { gregorianDateToIso, isoToGregorianDate } from '@utils/locale';
import 'react-multi-date-picker/styles/colors/teal.css';
import styles from './JalaliDatePicker.module.css';

interface JalaliDatePickerProps {
  value: string;
  onChange: (gregorianDate: string) => void;
  label?: string;
  className?: string;
  compact?: boolean;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  id?: string;
}

function gregorianToPickerValue(dateStr: string): DateObject | undefined {
  if (!dateStr) return undefined;
  return new DateObject({
    date: new Date(gregorianDateToIso(dateStr)),
    calendar: persian,
    locale: persian_fa,
  });
}

function pickerToGregorian(d: DateObject): string {
  return isoToGregorianDate(d.toDate().toISOString());
}

export default function JalaliDatePicker({
  value,
  onChange,
  label,
  className,
  compact = false,
  placeholder = '۱۴۰۳/۰۱/۰۱',
  minDate,
  maxDate,
  id,
}: JalaliDatePickerProps) {
  function handleChange(d: DateObject | null) {
    if (!d) {
      onChange('');
      return;
    }
    const greg = pickerToGregorian(d);
    if (greg) onChange(greg);
  }

  return (
    <div className={clsx(styles.wrapper, compact && styles.compact, className)}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <DatePicker
        id={id}
        className={styles.picker}
        calendar={persian}
        locale={persian_fa}
        digits={['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']}
        format="YYYY/MM/DD"
        placeholder={placeholder}
        value={gregorianToPickerValue(value)}
        onChange={handleChange}
        minDate={minDate ? gregorianToPickerValue(minDate) : undefined}
        maxDate={maxDate ? gregorianToPickerValue(maxDate) : undefined}
        calendarPosition="bottom-right"
        onOpenPickNewDate={false}
      />
    </div>
  );
}
