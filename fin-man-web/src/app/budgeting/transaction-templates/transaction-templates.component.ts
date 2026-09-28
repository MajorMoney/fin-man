import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Account } from 'src/libs/core/models/accounts';
import { CategoryBudget, TransactionTemplate } from 'src/libs/core/models/budget';
import { TransactionTemplateCardComponent } from './transaction-template-card/transaction-template-card.component';
import { TransactionTemplateModalComponent } from './transaction-template-modal/transaction-template-modal.component';

@Component({
  selector: 'app-transaction-templates',
  templateUrl: './transaction-templates.component.html',
  styleUrls: ['./transaction-templates.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TransactionTemplateCardComponent, TransactionTemplateModalComponent],
})
export class TransactionTemplatesComponent {
  @Input() templates: TransactionTemplate[] = [];
  @Input() categories: CategoryBudget[] = [];
  @Input() accounts: Account[] = [];
  @Output() saveTemplate = new EventEmitter<Omit<TransactionTemplate, 'id'>>();
  @Output() useTemplate = new EventEmitter<TransactionTemplate>();

  modalOpen = false;

  onSave(template: Omit<TransactionTemplate, 'id'>): void {
    this.saveTemplate.emit(template);
    this.modalOpen = false;
  }
}
