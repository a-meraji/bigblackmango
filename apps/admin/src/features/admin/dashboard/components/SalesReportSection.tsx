import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getSalesChart,
  type ChartType,
  type SalesChartParams,
  type ChartInterval,
  type ChartMetric,
} from '@api/admin/reports';
import ChartTypeSelector from '@features/admin/reports/components/ChartTypeSelector';
import DateRangePicker from '@features/admin/reports/components/DateRangePicker';
import ReportSummaryCards from '@features/admin/reports/components/ReportSummaryCards';
import TotalTrendChart from '@features/admin/reports/components/TotalTrendChart';
import FoodCompareChart from '@features/admin/reports/components/FoodCompareChart';
import FoodTrendChart from '@features/admin/reports/components/FoodTrendChart';
import CategoryShareChart from '@features/admin/reports/components/CategoryShareChart';
import FoodSelector from '@features/admin/reports/components/FoodSelector';
import MetricSelector from '@features/admin/reports/components/MetricSelector';
import IntervalSelector from '@features/admin/reports/components/IntervalSelector';
import CompareLimitSelector from '@features/admin/reports/components/CompareLimitSelector';
import styles from './SalesReportSection.module.css';

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  return { dateFrom: fmt(from), dateTo: fmt(to) };
}

const INITIAL_RANGE = defaultDateRange();

export default function SalesReportSection() {
  const [chartType, setChartType] = useState<ChartType>('total_trend');
  const [dateFrom, setDateFrom] = useState(INITIAL_RANGE.dateFrom);
  const [dateTo, setDateTo] = useState(INITIAL_RANGE.dateTo);
  const [interval, setInterval] = useState<ChartInterval>('day');
  const [metric, setMetric] = useState<ChartMetric>('total_sales');
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [compareLimit, setCompareLimit] = useState(10);

  useEffect(() => {
    if (chartType === 'category_share' && metric === 'sales_amount') {
      setMetric('total_sales');
    }
  }, [chartType, metric]);

  const params: SalesChartParams = {
    chartType,
    dateFrom,
    dateTo,
    metric,
    ...(chartType === 'total_trend' || chartType === 'food_trend' ? { interval } : {}),
    ...(chartType === 'food_trend' && selectedFoodId ? { foodId: selectedFoodId } : {}),
    ...(chartType === 'food_compare' ? { limit: compareLimit } : {}),
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'reports', params],
    queryFn: () => getSalesChart(params),
    enabled: chartType !== 'food_trend' || !!selectedFoodId,
    staleTime: 1000 * 60 * 5,
  });

  const needsFood = chartType === 'food_trend' && !selectedFoodId;

  return (
    <section id="sales-report" className={styles.section}>
      <div className={styles.controls}>
        <ChartTypeSelector value={chartType} onChange={setChartType} />
        <DateRangePicker
          dateFrom={dateFrom}
          dateTo={dateTo}
          onFromChange={setDateFrom}
          onToChange={setDateTo}
        />
        <div className={styles.selectors}>
          <MetricSelector value={metric} onChange={setMetric} chartType={chartType} />
          {(chartType === 'total_trend' || chartType === 'food_trend') && (
            <IntervalSelector value={interval} onChange={setInterval} />
          )}
          {chartType === 'food_compare' && (
            <CompareLimitSelector value={compareLimit} onChange={setCompareLimit} />
          )}
          {chartType === 'food_trend' && (
            <FoodSelector value={selectedFoodId} onChange={setSelectedFoodId} />
          )}
        </div>
      </div>

      {data?.chartType === 'total_trend' && <ReportSummaryCards summary={data.summary} />}

      <div className={styles.chartWrapper}>
        {isLoading && <p className={styles.loading}>در حال بارگذاری نمودار...</p>}

        {isError && (
          <div className={styles.error} role="alert">
            <p>خطا در بارگذاری داده‌ها.</p>
            <button type="button" className={styles.retryBtn} onClick={() => refetch()}>
              تلاش مجدد
            </button>
          </div>
        )}

        {!isLoading && !isError && data && (
          <>
            {data.chartType === 'total_trend' && <TotalTrendChart data={data} />}
            {data.chartType === 'food_compare' && <FoodCompareChart data={data} />}
            {data.chartType === 'food_trend' && <FoodTrendChart data={data} />}
            {data.chartType === 'category_share' && <CategoryShareChart data={data} />}
          </>
        )}

        {needsFood && !isLoading && (
          <p className={styles.prompt}>یک غذا انتخاب کنید تا روند فروش آن نمایش داده شود.</p>
        )}

        {isFetching && !isLoading && data && (
          <p className={styles.refreshing} aria-live="polite">
            در حال بروزرسانی...
          </p>
        )}
      </div>
    </section>
  );
}
