export interface CategoryChartData {
  labels: string[];
  datasets: CategoryChartDataset[];
}

export interface CategoryChartDataset {
  data: number[];
  backgroundColor: string[];
}
