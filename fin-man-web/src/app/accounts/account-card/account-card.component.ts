import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Account } from 'src/libs/core/models/accounts';

@Component({
  selector: 'app-account-card',
  templateUrl: './account-card.component.html',
  styleUrls: ['./account-card.component.css']
})
export class AccountCardComponent {
  @Input() account!: Account;
  @Output() edit = new EventEmitter<Account>();
}
