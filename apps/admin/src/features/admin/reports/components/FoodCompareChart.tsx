import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { FoodCompareResponse } from '@api/admin/reports';
import { useChartTheme, TOOLTIP_CONTENT_STYLE } from '../chart-colors';
import { formatPrice } from '@utils/format-price';
import { useMediaQuery } from '@hooks/useMediaQuery';
import chartStyles from './chart-shared.module.css';
import { formatNumber } from '@utils/locale';

interface FoodCompareChartProps {
  data: FoodCompareResponse;
}

export default function FoodCompareChart({ data }: FoodCompareChartProps) {
  const theme = useChartTheme();
  const isMonetary = data.chart.metric !== 'quantity';
  const isMobile = !useMediaQuery('(min-width: 640px)');

  return (
    <section className={chartStyles.wrapper}>
      <h3 className={chartStyles.title}>مقایسه غذاها</h3>
      <ResponsiveContainer width="100%" height={Math.max(240, data.chart.items.length * 32)}>
        <BarChart
          data={data.chart.items}
          layout="vertical"
          margin={{ top: 8, right: isMobile ? 4 : 24, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: isMobile ? 10 : 12, fill: theme.axis }}
            tickFormatter={(v: number) =>
              isMonetary
                ? `${formatNumber(Math.round(v / 1000))}K`
                : formatNumber(v)
            }
          />
          <YAxis
            type="category"
            dataKey="foodName"
            tick={{ fontSize: isMobile ? 10 : 12, fill: theme.axis }}
            width={isMobile ? 72 : 110}
          />
          <Tooltip
            formatter={(value: number) => [
              isMonetary ? formatPrice(value) : formatNumber(value),
              'مقدار',
            ]}
            contentStyle={{
              ...TOOLTIP_CONTENT_STYLE,
              background: theme.tooltipBg,
              color: theme.tooltipText,
              border: 'none',
              borderRadius: 'var(--radius-md)',
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.chart.items.map((_, i) => (
              <Cell key={i} fill={theme.bars[i % theme.bars.length] ?? theme.primary} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
