import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TransactionTemplate } from 'src/libs/core/models/budget';
import { BudgetIconComponent } from '../../category-budget-list/budget-icon/budget-icon.component';

@Component({
  selector: 'app-transaction-template-card',
  templateUrl: './transaction-template-card.component.html',
  styleUrls: ['./transaction-template-card.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CurrencyPipe, BudgetIconComponent],
})
export class TransactionTemplateCardComponent {
  @Input({ required: true }) template!: TransactionTemplate;
  @Output() useTemplate = new EventEmitter<TransactionTemplate>();
}
