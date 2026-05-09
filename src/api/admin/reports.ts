import { apiClient } from '../client';
import type { ApiResponse } from '@types/api';

export type ChartType = 'total_trend' | 'food_compare' | 'food_trend' | 'category_share';
export type ChartInterval = 'hour' | 'day' | 'week' | 'month';
export type ChartMetric = 'total_sales' | 'quantity' | 'sales_amount';

export interface ChartPoint {
  label: string;
  value: number;
}

export interface FoodCompareItem {
  foodId: string;
  foodName: string;
  value: number;
  quantitySold: number;
  averageRating: number;
}

export interface CategoryShareItem {
  categoryId: string;
  categoryName: string;
  value: number;
  percentage: number;
}

export interface TotalTrendResponse {
  chartType: 'total_trend';
  summary: { totalOrders: number; totalSales: number };
  chart: { type: 'line'; metric: ChartMetric; interval: ChartInterval; points: ChartPoint[] };
}

export interface FoodCompareResponse {
  chartType: 'food_compare';
  chart: { type: 'bar'; metric: ChartMetric; items: FoodCompareItem[] };
}

export interface FoodTrendResponse {
  chartType: 'food_trend';
  food: { id: string; name: string };
  chart: { type: 'line'; metric: ChartMetric; interval: ChartInterval; points: ChartPoint[] };
}

export interface CategoryShareResponse {
  chartType: 'category_share';
  chart: { type: 'donut'; metric: ChartMetric; items: CategoryShareItem[] };
}

export type SalesChartResponse =
  | TotalTrendResponse
  | FoodCompareResponse
  | FoodTrendResponse
  | CategoryShareResponse;

export interface SalesChartParams {
  chartType: ChartType;
  dateFrom?: string;
  dateTo?: string;
  interval?: ChartInterval;
  metric?: ChartMetric;
  foodId?: string;
  foodIds?: string;
  categoryId?: string;
  limit?: number;
}

export async function getSalesChart(params: SalesChartParams): Promise<SalesChartResponse> {
  const res = await apiClient.get<ApiResponse<SalesChartResponse>>(
    '/admin/reports/sales-chart',
    { params },
  );
  return res.data.data;
}
