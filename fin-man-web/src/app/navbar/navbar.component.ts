import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NavItem } from 'src/libs/core/ui-models/nav-items';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink]
})
export class NavbarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Upcoming Timeline', route: '/analysis' },
    { label: 'Transactions', route: '/transactions' },
    { label: 'Recurring Transactions', route: '/recurrent-transanctions' },
    { label: 'Saving Goals', route: '/savings' },
    { label: 'Users', route: '/users' },
    { label: 'Accounts', route: '/accounts' },
    { label: 'Reports', route: '/reports' },
  ];
}
