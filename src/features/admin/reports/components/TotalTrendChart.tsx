import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TotalTrendResponse } from '@api/admin/reports';
import { useChartTheme, TOOLTIP_CONTENT_STYLE } from '../chart-colors';
import { formatPrice } from '@utils/format-price';
import { useMediaQuery } from '@hooks/useMediaQuery';
import chartStyles from './chart-shared.module.css';

interface TotalTrendChartProps {
  data: TotalTrendResponse;
}

export default function TotalTrendChart({ data }: TotalTrendChartProps) {
  const theme = useChartTheme();
  const isMonetary = data.chart.metric !== 'quantity';
  const isMobile = !useMediaQuery('(min-width: 640px)');

  return (
    <section className={chartStyles.wrapper}>
      <h3 className={chartStyles.title}>روند کلی فروش</h3>
      <ResponsiveContainer width="100%" height={isMobile ? 240 : 320}>
        <LineChart
          data={data.chart.points}
          margin={{ top: 8, right: isMobile ? 4 : 16, left: isMobile ? 0 : 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: isMobile ? 10 : 12, fill: theme.axis }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: isMobile ? 10 : 12, fill: theme.axis }}
            width={isMobile ? 44 : 60}
            tickFormatter={(v: number) =>
              isMonetary
                ? `${Math.round(v / 1000).toLocaleString('fa-IR')}K`
                : v.toLocaleString('fa-IR')
            }
          />
          <Tooltip
            formatter={(value: number) => [
              isMonetary ? formatPrice(value) : value.toLocaleString('fa-IR'),
              'مقدار',
            ]}
            labelFormatter={(label) => `تاریخ: ${label}`}
            contentStyle={{
              ...TOOLTIP_CONTENT_STYLE,
              background: theme.tooltipBg,
              color: theme.tooltipText,
              border: 'none',
              borderRadius: 'var(--radius-md)',
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={theme.primary}
            strokeWidth={2.5}
            dot={{ r: isMobile ? 2 : 3, fill: theme.primary }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
