import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-monthly-analysis',
  templateUrl: './monthly-analysis.component.html',
  styleUrls: ['./monthly-analysis.component.css'],
})
export class MonthlyAnalysisComponent implements OnInit {
  selectedPeriod: string = 'Monthly';
  periods = ['Monthly', 'Quarterly', 'Yearly'];

  chartData = [
    { date: 'Apr 1', amount: 350 },
    { date: 'Apr 5', amount: 400 },
    { date: 'Apr 10', amount: 320 },
    { date: 'Apr 15', amount: 420 },
    { date: 'Apr 20', amount: 380 },
    { date: 'Apr 25', amount: 440 },
    { date: 'Apr 30', amount: 460 },
  ];

  maxAmount = 500;
  polylinePoints: string = '';

  ngOnInit(): void {
    this.calculatePolylinePoints();
  }

  onPeriodChange(period: string): void {
    this.selectedPeriod = period;
  }

  getPointPosition(amount: number): number {
    return 100 - (amount / this.maxAmount) * 100;
  }

  calculatePolylinePoints(): void {
    this.polylinePoints = this.chartData
      .map((d, i) => `${i * 100},${this.getPointPosition(d.amount)}`)
      .join(' ');
  }
}
