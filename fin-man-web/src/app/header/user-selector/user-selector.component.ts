import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { User, UserHelpers } from 'src/libs/core/models/users';
import { UserService } from 'src/services/user-service';
import { AsyncPipe } from '@angular/common';
@Component({
    selector: 'app-user-selector',
    templateUrl: './user-selector.component.html',
    styleUrls: ['./user-selector.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [AsyncPipe]
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
