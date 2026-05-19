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
import chartStyles from './chart-shared.module.css';

interface FoodCompareChartProps {
  data: FoodCompareResponse;
}

export default function FoodCompareChart({ data }: FoodCompareChartProps) {
  const theme = useChartTheme();
  const isMonetary = data.chart.metric !== 'quantity';

  return (
    <section className={chartStyles.wrapper}>
      <h3 className={chartStyles.title}>مقایسه غذاها</h3>
      <ResponsiveContainer width="100%" height={Math.max(280, data.chart.items.length * 36)}>
        <BarChart
          data={data.chart.items}
          layout="vertical"
          margin={{ top: 8, right: 32, left: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: theme.axis }}
            tickFormatter={(v: number) =>
              isMonetary ? `${Math.round(v / 1000).toLocaleString('fa-IR')}K` : v.toLocaleString('fa-IR')
            }
          />
          <YAxis
            type="category"
            dataKey="foodName"
            tick={{ fontSize: 12, fill: theme.axis }}
            width={120}
          />
          <Tooltip
            formatter={(value: number) => [
              isMonetary ? formatPrice(value) : value.toLocaleString('fa-IR'),
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
