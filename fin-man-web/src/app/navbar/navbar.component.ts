import { Component } from '@angular/core';
import { NavItem } from 'src/libs/core/ui-models/nav-items';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Spending Analysis', route: '/analysis' },
    { label: 'Transactions', route: '/transactions' },
    { label: 'Saving Goals', route: '/savings' },
    { label: 'Users', route: '/users' },
    { label: 'Accounts', route: '/accounts' },
    { label: 'Reports', route: '/reports' },
    // add more entries here
  ];
}
