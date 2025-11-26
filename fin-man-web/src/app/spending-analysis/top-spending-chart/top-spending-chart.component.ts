import { Component, Input } from '@angular/core';

interface SpendingData {
  category: string;
  amount: number;
  percentage: number;
}

@Component({
  selector: 'app-top-spending-chart',
  templateUrl: './top-spending-chart.component.html',
  styleUrls: ['./top-spending-chart.component.css']
})
export class TopSpendingChartComponent {
  @Input() data: SpendingData[] = [];

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Groceries': '#4A90E2',
      'Utilities': '#7B68EE',
      'Rent': '#9B59B6',
      'Transport': '#F39C12',
      'Entertainment': '#E67E22',
      'Dining Out': '#E74C3C',
      'Shopping': '#F1C40F'
    };
    return colors[category] || '#95A5A6';
  }
}