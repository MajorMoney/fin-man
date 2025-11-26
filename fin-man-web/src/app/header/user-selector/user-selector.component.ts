import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { User, UserHelpers } from 'src/libs/core/models/users';
import { UserService } from 'src/services/user-service';
@Component({
  selector: 'app-user-selector',
  templateUrl: './user-selector.component.html',
  styleUrls: ['./user-selector.component.css'],
})
export class UserSelectorComponent {
  constructor(public userService: UserService) {}
  dropdownOpen: boolean = false;

  selectUser(user: User) {
    this.userService.setUser(user);
    this.dropdownOpen = false;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
}
