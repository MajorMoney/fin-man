import { Component, Input, OnInit } from '@angular/core';
import summaryCardsData from 'src/assets/summaryCardsData.json';
import { DashboardSummaryService } from 'src/services/dashboard-summary.service';
import { SummaryCard } from 'src/libs/core/ui-models/dashboard-summary-cards';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-summary-grid',
  templateUrl: './summary-grid.component.html',
  styleUrls: ['./summary-grid.component.css'],
})
export class SummaryGridComponent implements OnInit {
  @Input() selectedYear$!: Observable<number>;
  cards: SummaryCard[] = summaryCardsData;

  constructor(private summaryService: DashboardSummaryService) {}

  ngOnInit(): void {
    this.summaryService.getSummary$(this.selectedYear$).subscribe((summary) => {
      this.cards = this.cards.map((card) => ({
        ...card,
        value: this.mapCardValue(card.metric, summary),
      }));
    });
  }

  private mapCardValue(metric: string, summary: any): string {
    switch (metric) {
      case 'totalIncome':
        return summary.totalIncome;
      case 'totalExpenses':
        return summary.totalExpenses;
      case 'netSavings':
        return summary.netSavings;
      case 'savingsRate':
        return summary.savingsRate;
      case 'averageMonthlyExpense':
        return summary.averageMonthlyExpense;
      case 'topCategory':
        return summary.topCategory;
      default:
        return '-';
    }
  }
}
