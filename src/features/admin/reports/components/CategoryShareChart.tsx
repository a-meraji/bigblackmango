import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { CategoryShareResponse } from '@api/admin/reports';
import { useChartTheme, TOOLTIP_CONTENT_STYLE } from '../chart-colors';
import { formatPrice } from '@utils/format-price';
import { useMediaQuery } from '@hooks/useMediaQuery';
import chartStyles from './chart-shared.module.css';
import styles from './CategoryShareChart.module.css';

interface CategoryShareChartProps {
  data: CategoryShareResponse;
}

export default function CategoryShareChart({ data }: CategoryShareChartProps) {
  const theme = useChartTheme();
  const items = data.chart.items;
  const isMonetary = data.chart.metric !== 'quantity';
  const isMobile = !useMediaQuery('(min-width: 640px)');

  if (items.length === 0) {
    return (
      <section className={chartStyles.wrapper}>
        <h3 className={chartStyles.title}>سهم دسته‌بندی‌ها</h3>
        <p className={styles.empty}>داده‌ای برای این بازه یافت نشد.</p>
      </section>
    );
  }

  return (
    <section className={chartStyles.wrapper}>
      <h3 className={chartStyles.title}>سهم دسته‌بندی‌ها</h3>
      <div className={styles.chartAndLegend}>
        <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
          <PieChart>
            <Pie
              data={items}
              dataKey="value"
              nameKey="categoryName"
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? 50 : 70}
              outerRadius={isMobile ? 85 : 110}
              paddingAngle={3}
            >
              {items.map((_, i) => (
                <Cell key={i} fill={theme.donut[i % theme.donut.length] ?? theme.primary} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, _name: string, item) => {
                const payload = item?.payload as { categoryName: string; percentage: number };
                const display = isMonetary ? formatPrice(value) : value.toLocaleString('fa-IR');
                return [`${display} (${payload.percentage.toLocaleString('fa-IR')}٪)`, payload.categoryName];
              }}
              contentStyle={{
                ...TOOLTIP_CONTENT_STYLE,
                background: theme.tooltipBg,
                color: theme.tooltipText,
                border: 'none',
                borderRadius: 'var(--radius-md)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <ul className={styles.legend}>
          {items.map((item, i) => (
            <li key={item.categoryId} className={styles.legendItem}>
              <span
                className={styles.dot}
                style={{ background: theme.donut[i % theme.donut.length] ?? theme.primary }}
              />
              <span className={styles.catName}>{item.categoryName}</span>
              <span className={styles.pct}>{item.percentage.toLocaleString('fa-IR')}٪</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
