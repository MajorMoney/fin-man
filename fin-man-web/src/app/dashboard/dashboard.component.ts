import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, map, take } from 'rxjs';
import { TransactionUtils } from 'src/libs/core/utils/transactions.utils';
import { TransactionsService } from 'src/services/transactions-service';
import { UserService } from 'src/services/user-service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  constructor(
    private transactionsService: TransactionsService,
    private userService: UserService
  ) {}

  // Make selectedYear reactive
  private selectedYearSubject = new BehaviorSubject<number>(
    new Date().getFullYear()
  );
  selectedYear$ = this.selectedYearSubject.asObservable();

  availableYears: number[] = [];
  ngOnInit(): void {
    combineLatest([
      this.transactionsService.transactions$,
      this.userService.currentUser$,
    ])
      .pipe(
        map(([transactions, user]) => {
          const filtered = TransactionUtils.filterByUser(transactions, user.name);
          return TransactionUtils.getAvailableYears(filtered);
        })
      )
      .subscribe((availableYears) => (this.availableYears = availableYears));
  }

  // Getter for template binding
  get selectedYear(): number {
    return this.selectedYearSubject.value;
  }
  onYearChange(year: number): void {
    this.selectedYearSubject.next(year); // Emit new value - triggers combineLatest
  }
}
