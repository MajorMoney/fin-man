import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import { Account } from 'src/libs/core/models/accounts';
import { User, UserHelpers } from 'src/libs/core/models/users';
import { AccountsService } from 'src/services/account-service';
import { UserService } from 'src/services/user-service';

@Component({
  selector: 'app-account-list-view',
  templateUrl: './account-list-view.component.html',
  styleUrls: ['./account-list-view.component.css'],
})
export class AccountListViewComponent implements OnInit, OnDestroy {
  constructor(
    private userService: UserService,
    private accountService: AccountsService
  ) {}
  private destroy$ = new Subject<void>();

  accounts: Account[] = [];
  users: User[] = [];

  ngOnInit(): void {
    combineLatest([
      this.accountService.accounts$,
      this.userService.users$,
    ]).subscribe(([accounts, users]) => {
      const realUsers = users.filter((u) => !UserHelpers.isAllUsers(u));
      this.accounts = accounts;
      this.users = realUsers;
    });
  }

  // modal state
  isAccountModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedAccount: Account | null = null;

  // open modal for create
  openCreateAccount() {
    this.modalMode = 'create';
    this.selectedAccount = null;
    this.isAccountModalOpen = true;
  }

  // open modal for edit
  openEditAccount(account: Account) {
    this.modalMode = 'edit';
    this.selectedAccount = { ...account, holders: [...account.holders] }; // protect mutation
    this.isAccountModalOpen = true;
  }

  closeAccountModal() {
    this.isAccountModalOpen = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
