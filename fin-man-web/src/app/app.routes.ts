import { Route } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { SavingsGoalsComponent } from './savings/savings-goals.component';
import { SpendingAnalysisComponent } from './spending-analysis/spending-analysis.component';
import { UserListViewComponent } from './users/user-list-view/user-list-view.component';
import { AccountListViewComponent } from './accounts/account-list-view/account-list-view.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'savings', component: SavingsGoalsComponent },
  { path: 'analysis', component: SpendingAnalysisComponent },
  { path: 'accounts', component: AccountListViewComponent },
  { path: 'users', component: UserListViewComponent },
];
