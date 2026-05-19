import { useEffect, useState } from 'react';

export interface ChartTheme {
  primary: string;
  secondary: string;
  tertiary: string;
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipText: string;
  donut: string[];
  bars: string[];
}

const FALLBACK: ChartTheme = {
  primary: '#C97645',
  secondary: '#607A5B',
  tertiary: '#D4A832',
  grid: '#E8D9C0',
  axis: '#8A8078',
  tooltipBg: '#231D18',
  tooltipText: '#FBF7EF',
  donut: ['#C97645', '#E4A97F', '#E8C96A', '#F5E2A8'],
  bars: ['#C97645', '#E4A97F', '#E8C96A', '#F5E2A8'],
};

function readVar(style: CSSStyleDeclaration, name: string, fallback: string): string {
  const value = style.getPropertyValue(name).trim();
  return value || fallback;
}

export function readChartTheme(): ChartTheme {
  if (typeof document === 'undefined') return FALLBACK;
  const style = getComputedStyle(document.documentElement);
  return {
    primary: readVar(style, '--chart-line-primary', FALLBACK.primary),
    secondary: readVar(style, '--chart-line-secondary', FALLBACK.secondary),
    tertiary: readVar(style, '--chart-line-tertiary', FALLBACK.tertiary),
    grid: readVar(style, '--chart-grid', FALLBACK.grid),
    axis: readVar(style, '--chart-axis-text', FALLBACK.axis),
    tooltipBg: readVar(style, '--chart-tooltip-bg', FALLBACK.tooltipBg),
    tooltipText: readVar(style, '--chart-tooltip-text', FALLBACK.tooltipText),
    donut: [
      readVar(style, '--chart-donut-1', FALLBACK.donut[0]),
      readVar(style, '--chart-donut-2', FALLBACK.donut[1]),
      readVar(style, '--chart-donut-3', FALLBACK.donut[2]),
      readVar(style, '--chart-donut-4', FALLBACK.donut[3]),
    ],
    bars: [
      readVar(style, '--chart-bar-1', FALLBACK.bars[0]),
      readVar(style, '--chart-bar-2', FALLBACK.bars[1]),
      readVar(style, '--chart-bar-3', FALLBACK.bars[2]),
      readVar(style, '--chart-bar-4', FALLBACK.bars[3]),
    ],
  };
}

export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState(FALLBACK);

  useEffect(() => {
    setTheme(readChartTheme());
  }, []);

  return theme;
}

export const TOOLTIP_CONTENT_STYLE = {
  fontFamily: 'Vazirmatn, Vazir, Tahoma, sans-serif',
  direction: 'rtl',
} as const;
