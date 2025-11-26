import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { CommonModule, JsonPipe } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { UserSelectorComponent } from './header/user-selector/user-selector.component';
import { HeaderComponent } from './header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SavingsGoalsComponent } from './savings/savings-goals.component';
import { SummaryGridComponent } from './dashboard/summary-grid/summary-grid.component';
import { DashboardCardComponent } from './dashboard/summary-grid/dashboard-card/dashboard-card.component';
import { ChartsGridComponent } from './dashboard/charts-grid/charts-grid.component';
import { TrendChartComponent } from './dashboard/charts-grid/trend-chart/trend-chart.component';
import { CategoryChartComponent } from './dashboard/charts-grid/category-chart/category-chart.component';
import { TopCategoriesComponent } from './dashboard/charts-grid/top-categories/top-categories.component';
import { CategoryFilterComponent } from './spending-analysis/category-filter/category-filter.component';
import { SpendingAnalysisComponent } from './spending-analysis/spending-analysis.component';
import { TopSpendingChartComponent } from './spending-analysis/top-spending-chart/top-spending-chart.component';
import { DetailedTransactionsPlaceholderComponent } from './spending-analysis/placeholder/placeholder.component';
import { MonthlyAnalysisComponent } from './spending-analysis/monthly-analysis/monthly-analysis.component';

import { HttpClientModule } from '@angular/common/http';
import { UserListViewComponent } from './users/user-list-view/user-list-view.component';
import { AccountListViewComponent } from './accounts/account-list-view/account-list-view.component';
import { UserModalComponent } from './users/user-modal/user-modal.component';
import { AccountModalComponent } from './accounts/account-modal/account-modal.component';
import { AccountCardComponent } from './accounts/account-card/account-card.component';
import { UserCardComponent } from './users/user-card/user-card.component';
import { TransactionsListComponent } from './transactions/transactions-list/transactions-list.component';
import { TransactionModalComponent } from './transactions/transactions-modal/transactions-modal.component';
import { TransactionsComponent } from './transactions/transactions.component';

@NgModule({
  declarations: [
    AppComponent,
    TransactionsListComponent,
    NavbarComponent,
    HeaderComponent,
    UserSelectorComponent,
    TransactionModalComponent,
    DashboardComponent,
    SavingsGoalsComponent,
    SummaryGridComponent,
    DashboardCardComponent,
    ChartsGridComponent,
    TrendChartComponent,
    CategoryChartComponent,
    TopCategoriesComponent,
    TransactionModalComponent,
    CategoryFilterComponent,
    SpendingAnalysisComponent,
    TopSpendingChartComponent,
    DetailedTransactionsPlaceholderComponent,
    MonthlyAnalysisComponent,
    UserListViewComponent,
    AccountListViewComponent,
    UserModalComponent,
    AccountModalComponent,
    AccountCardComponent,
    UserCardComponent,
    TransactionsComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    JsonPipe,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
