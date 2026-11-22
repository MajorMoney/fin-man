import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { NavItem } from 'src/libs/core/ui-models/nav-items';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from 'src/services/theme.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, RouterLinkActive]
})
export class NavbarComponent {
  protected readonly theme = inject(ThemeService);
  readonly collapsed = input(false);

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Upcoming Timeline', route: '/analysis' },
    { label: 'Transactions', route: '/transactions' },
    { label: 'Recurring Transactions', route: '/recurrent-transanctions' },
    { label: 'Saving Goals', route: '/savings' },
    { label: 'Budgeting', route: '/budgeting' },
    { label: 'Users', route: '/users' },
    { label: 'Accounts', route: '/accounts' },
    { label: 'Reports', route: '/reports' },
  ];
}
