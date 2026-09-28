import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import { Account } from 'src/libs/core/models/accounts';
import { User, UserHelpers } from 'src/libs/core/models/users';
import { AccountsService } from 'src/services/account-service';
import { UserService } from 'src/services/user-service';
import { AccountCardComponent } from '../account-card/account-card.component';
import { AccountModalComponent } from '../account-modal/account-modal.component';
import { AccountsTotalComponent } from '../accounts-total/accounts-total.component';
import { AccountTransfersHistoryComponent } from '../account-transfers-history/account-transfers-history.component';
import { TransferIconComponent } from '../../shared/icons/transfer-icon/transfer-icon.component';
import { AccountTransferModalComponent } from '../account-transfer-modal/account-transfer-modal.component';
import { ToastService } from 'src/services/toast.service';

@Component({
    selector: 'app-account-list-view',
    templateUrl: './account-list-view.component.html',
    styleUrls: ['./account-list-view.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        AccountCardComponent,
        AccountModalComponent,
        AccountsTotalComponent,
        AccountTransfersHistoryComponent,
        TransferIconComponent,
        AccountTransferModalComponent,
    ]
})
export class AccountListViewComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private userService: UserService,
    private accountService: AccountsService,
    private toast: ToastService
  ) {}
  private destroy$ = new Subject<void>();

  private readonly cardsPerPage = 6;

  @ViewChild('carousel') carousel?: ElementRef<HTMLElement>;
  @ViewChild('carouselTrack') carouselTrack?: ElementRef<HTMLElement>;

  private wheelLockUntil = 0;
  private readonly onWheel = (event: WheelEvent): void => {
    if (this.pages.length < 2) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

    const direction = Math.sign(event.deltaY);
    if (!direction) return;

    const next = this.activePage + direction;
    if (next < 0 || next >= this.pages.length) return;

    event.preventDefault();
    if (Date.now() < this.wheelLockUntil) return;

    this.wheelLockUntil = Date.now() + 500;
    setTimeout(() => this.goToPage(next));
  };

  accounts: Account[] = [];
  pages: Account[][] = [];
  activePage = 0;
  users: User[] = [];

  ngOnInit(): void {
    combineLatest([
      this.accountService.accounts$,
      this.userService.users$,
    ]).subscribe(([accounts, users]) => {
      const realUsers = users.filter((u) => !UserHelpers.isAllUsers(u));
      this.accounts = accounts;
      this.pages = this.chunkAccounts(accounts);
      if (this.activePage > this.pages.length - 1) {
        this.activePage = Math.max(this.pages.length - 1, 0);
      }
      this.users = realUsers;
    });
  }

  // modal state
  isAccountModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedAccount: Account | null = null;

  isAccountTransferModalOpen = false;

  openAccountTransfer() {
    if (this.accounts.length < 2) {
      this.toast.error('You need at least two accounts to transfer.');
      return;
    }
    this.isAccountTransferModalOpen = true;
  }

  closeAccountTransfer() {
    this.isAccountTransferModalOpen = false;
  }

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

  goToPage(index: number): void {
    const track = this.carouselTrack?.nativeElement;
    if (!track) return;
    this.activePage = index;
    track.scrollLeft = index * track.clientWidth;
  }

  onCarouselScroll(): void {
    const track = this.carouselTrack?.nativeElement;
    if (!track || track.clientWidth === 0) return;
    const page = Math.round(track.scrollLeft / track.clientWidth);
    this.activePage = Math.min(Math.max(page, 0), Math.max(this.pages.length - 1, 0));
  }

  private chunkAccounts(accounts: Account[]): Account[][] {
    const pages: Account[][] = [];
    for (let index = 0; index < accounts.length; index += this.cardsPerPage) {
      pages.push(accounts.slice(index, index + this.cardsPerPage));
    }
    return pages;
  }

  ngAfterViewInit(): void {
    this.carousel?.nativeElement.addEventListener('wheel', this.onWheel, {
      passive: false,
    });
  }

  ngOnDestroy(): void {
    this.carousel?.nativeElement.removeEventListener('wheel', this.onWheel);
    this.destroy$.next();
    this.destroy$.complete();
  }
}
