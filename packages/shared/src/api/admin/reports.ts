import { apiClient } from '../client';
import type { ApiResponse } from '@t/api';

export type ChartType = 'total_trend' | 'food_compare' | 'food_trend' | 'category_share';
export type ChartInterval = 'day' | 'week' | 'month';
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
  averageUnitPrice: number;
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
  limit?: number;
}

type BackendSales = {
  summary: {
    grandTotalSales: number;
    grandTotalOrders: number;
  };
  series: Array<{
    label: string;
    totalSales: number;
    totalOrders: number;
  }>;
};

type BackendTopFoods = {
  items: Array<{
    foodId: string;
    foodName: string;
    totalQuantitySold: number;
    totalRevenue: number;
    averageUnitPrice: number;
  }>;
};

type BackendFoodTrend = {
  food: { foodId: string; foodName: string };
  series: Array<{
    label: string;
    quantitySold: number;
    revenue: number;
  }>;
};

type BackendCategoryShare = {
  items: Array<{
    categoryId: string;
    categoryName: string;
    totalQuantitySold: number;
    totalRevenue: number;
    sharePercentage: number;
  }>;
};

function rangeParams(dateFrom?: string, dateTo?: string) {
  return {
    ...(dateFrom ? { fromDate: dateFrom } : {}),
    ...(dateTo ? { toDate: dateTo } : {}),
  };
}

function metricValue(
  metric: ChartMetric | undefined,
  quantity: number,
  revenue: number,
): number {
  if (metric === 'quantity') return quantity;
  return revenue;
}

export async function getSalesChart(params: SalesChartParams): Promise<SalesChartResponse> {
  const metric = params.metric ?? 'total_sales';
  const interval = params.interval ?? 'day';

  switch (params.chartType) {
    case 'total_trend': {
      const res = await apiClient.get<ApiResponse<BackendSales>>('/admin/analytics/sales', {
        params: {
          ...rangeParams(params.dateFrom, params.dateTo),
          groupBy: interval,
        },
      });
      const body = res.data.data;
      return {
        chartType: 'total_trend',
        summary: {
          totalOrders: body.summary.grandTotalOrders,
          totalSales: body.summary.grandTotalSales,
        },
        chart: {
          type: 'line',
          metric,
          interval,
          points: body.series.map((point) => ({
            label: point.label,
            value:
              metric === 'quantity' ? point.totalOrders : point.totalSales,
          })),
        },
      };
    }

    case 'food_compare': {
      const res = await apiClient.get<ApiResponse<BackendTopFoods>>(
        '/admin/analytics/foods/top',
        {
          params: {
            ...rangeParams(params.dateFrom, params.dateTo),
            limit: params.limit ?? 10,
          },
        },
      );
      const items = res.data.data.items.map((item) => ({
        foodId: item.foodId,
        foodName: item.foodName,
        value: metricValue(metric, item.totalQuantitySold, item.totalRevenue),
        quantitySold: item.totalQuantitySold,
        averageUnitPrice: item.averageUnitPrice,
      }));
      return {
        chartType: 'food_compare',
        chart: { type: 'bar', metric, items },
      };
    }

    case 'food_trend': {
      if (!params.foodId) {
        throw new Error('foodId is required for food_trend');
      }
      const res = await apiClient.get<ApiResponse<BackendFoodTrend>>(
        '/admin/analytics/foods/trends',
        {
          params: {
            ...rangeParams(params.dateFrom, params.dateTo),
            groupBy: interval,
            foodId: params.foodId,
          },
        },
      );
      const body = res.data.data;
      return {
        chartType: 'food_trend',
        food: { id: body.food.foodId, name: body.food.foodName },
        chart: {
          type: 'line',
          metric,
          interval,
          points: body.series.map((point) => ({
            label: point.label,
            value: metricValue(metric, point.quantitySold, point.revenue),
          })),
        },
      };
    }

    case 'category_share': {
      const res = await apiClient.get<ApiResponse<BackendCategoryShare>>(
        '/admin/analytics/categories/share',
        {
          params: rangeParams(params.dateFrom, params.dateTo),
        },
      );
      const items = res.data.data.items.map((item) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        value: metricValue(metric, item.totalQuantitySold, item.totalRevenue),
        percentage: item.sharePercentage,
      }));
      return {
        chartType: 'category_share',
        chart: { type: 'donut', metric, items },
      };
    }

    default:
      throw new Error('Unknown chart type');
  }
}
