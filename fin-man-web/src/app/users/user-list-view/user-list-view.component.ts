import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import { User, UserHelpers } from 'src/libs/core/models/users';
import { UserService } from 'src/services/user-service';

@Component({
  selector: 'app-user-list-view',
  templateUrl: './user-list-view.component.html',
  styleUrls: ['./user-list-view.component.css'],
})
export class UserListViewComponent implements OnInit, OnDestroy {
  constructor(private userService: UserService) {}
  users: User[] = [];
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.userService.users$.subscribe((users) => {
      // optional: sort alphabetically
      const realUsers=users.filter(u=>!UserHelpers.isAllUsers(u))
      this.users = realUsers;
    });
  }

  isUserModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedUser: User | null = null;

  openCreateUser() {
    this.modalMode = 'create';
    this.selectedUser = null;
    this.isUserModalOpen = true;
  }

  openEditUser(user: User) {
    this.modalMode = 'edit';
    this.selectedUser = user;
    this.isUserModalOpen = true;
  }

  closeUserModal() {
    this.isUserModalOpen = false;
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
