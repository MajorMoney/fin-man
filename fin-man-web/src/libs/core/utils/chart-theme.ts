import { Chart } from 'chart.js/auto';

export function applyChartJsTheme(): void {
  const css = getComputedStyle(document.documentElement);
  const muted = read(css, '--text-muted', '#6b7280');
  const border = read(css, '--border', '#e5e7eb');
  const surface = read(css, '--surface', '#ffffff');
  const text = read(css, '--text-heading', '#1f2937');

  Chart.defaults.color = muted;
  Chart.defaults.borderColor = border;

  const legendLabels = Chart.defaults.plugins.legend?.labels;
  if (legendLabels) {
    legendLabels.color = muted;
  }

  const tooltip = Chart.defaults.plugins.tooltip;
  if (tooltip) {
    tooltip.backgroundColor = surface;
    tooltip.titleColor = text;
    tooltip.bodyColor = muted;
    tooltip.borderColor = border;
    tooltip.borderWidth = 1;
  }
}

function read(css: CSSStyleDeclaration, name: string, fallback: string): string {
  return css.getPropertyValue(name).trim() || fallback;
}
