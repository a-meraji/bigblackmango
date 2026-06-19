import DatePicker, { DateObject } from 'react-multi-date-picker';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import clsx from 'clsx';
import { jalaliDateTimeToIso, toEnglishDigits } from '@utils/locale';
import 'react-multi-date-picker/styles/colors/teal.css';
import styles from './JalaliDatePicker.module.css';

interface JalaliDateTimePickerProps {
  value: string;
  onChange: (iso: string) => void;
  label?: string;
  className?: string;
  id?: string;
}

function isoToPickerValue(iso: string): DateObject | undefined {
  if (!iso) return undefined;
  return new DateObject({
    date: new Date(iso),
    calendar: persian,
    locale: persian_fa,
  });
}

export default function JalaliDateTimePicker({
  value,
  onChange,
  label,
  className,
  id,
}: JalaliDateTimePickerProps) {
  function handleChange(d: DateObject | null) {
    if (!d) return;
    const jalaliDate = toEnglishDigits(d.format('YYYY/MM/DD'));
    const time = toEnglishDigits(d.format('HH:mm'));
    const iso = jalaliDateTimeToIso(jalaliDate, time);
    if (iso) onChange(iso);
  }

  return (
    <div className={clsx(styles.wrapper, className)}>
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
        format="YYYY/MM/DD HH:mm"
        value={isoToPickerValue(value)}
        onChange={handleChange}
        plugins={[<TimePicker key="time" position="bottom" hideSeconds mStep={5} />]}
        calendarPosition="bottom-right"
      />
    </div>
  );
}
