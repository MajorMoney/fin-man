import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  Subject,
} from 'rxjs';
import { User, UserHelpers } from 'src/libs/core/models/users';
import { UsersApi } from 'src/api/users.api';

@Injectable({
  providedIn: 'root',
})
export class UserService implements OnDestroy {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private usersApi: UsersApi) {
    this.initializeUsers();
  }

  private readonly currentUserSubject = new BehaviorSubject<User>(
    UserHelpers.ALL_USERS
  );
  private readonly usersSubject = new BehaviorSubject<User[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly destroy$ = new Subject<void>();

  public readonly currentUser$: Observable<User> = combineLatest([
    this.currentUserSubject.asObservable(),
    this.usersSubject.asObservable(),
  ]).pipe(
    map(([currentUser, users]) => {
      if (UserHelpers.isAllUsers(currentUser)) {
        return UserHelpers.ALL_USERS;
      }
      return currentUser;
    }),
    distinctUntilChanged((a, b) => a?.id === b?.id)
  );

  public readonly users$: Observable<User[]> = this.usersSubject
    .asObservable()
    .pipe(map((users) => [...users, { ...UserHelpers.ALL_USERS }]));

  public readonly loading$: Observable<boolean> =
    this.loadingSubject.asObservable();
  public readonly error$: Observable<string | null> =
    this.errorSubject.asObservable();

  // Computed observables
  public readonly isAllUsersSelected$: Observable<boolean> =
    this.currentUser$.pipe(map((user) => UserHelpers.isAllUsers(user)));

  private get currentUser(): User {
    return this.currentUserSubject.value;
  }

  private get users(): User[] {
    return this.usersSubject.value;
  }
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  get error(): string | null {
    return this.errorSubject.value;
  }

  /**
   * Initialize users from data source
   */
  private async initializeUsers(): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      const userData = await this.usersApi.findAll();

      // Validate user data
      if (!Array.isArray(userData) || userData.length === 0) {
        throw new Error('Invalid user data format: expected a not empty array');
      }

      // Validate each user has required fields
      const validUsers = userData.filter((user) => this.isValidUser(user));

      if (validUsers.length === 0) {
        throw new Error('No valid users found in data');
      }

      this.usersSubject.next(validUsers as User[]);

      // Set initial user if not already set
      if (
        !this.currentUserSubject.value ||
        this.currentUserSubject.value === UserHelpers.ALL_USERS
      ) {
        this.currentUserSubject.next(UserHelpers.ALL_USERS);
      }
      this.loadingSubject.next(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load users';
      console.error('[UserService] Initialization error:', errorMessage);
      this.errorSubject.next(errorMessage);
      this.loadingSubject.next(false);

      // Fallback to empty array
      this.usersSubject.next([]);
    }
  }

  /**
   * Validate user object structure
   */
  private isValidUser(user: any): boolean {
    return (
      user !== null &&
      typeof user === 'object' &&
      'id' in user &&
      'name' in user &&
      (typeof user.id === 'number' || user.id === null) &&
      typeof user.name === 'string' &&
      user.name.trim().length > 0
    );
  }

  /**
   * Set the current user
   */
  setUser(user: User): void {
    if (!user) {
      console.warn('[UserService] Attempted to set null/undefined user');
      return;
    }

    if (!this.isValidUser(user)) {
      console.error('[UserService] Invalid user object:', user);
      this.errorSubject.next('Invalid user object');
      return;
    }

    // Check if user exists in the list (unless it's the ALL_USERS special case)
    if (!UserHelpers.isAllUsers(user) && !this.userExists(user.id)) {
      console.warn('[UserService] User not found in users list:', user);
    }

    console.log('[UserService] User changed:', user);
    this.currentUserSubject.next(user);
    this.errorSubject.next(null);
  }

  /**
   * Set user by ID
   */
  setUserById(userId: number | null): void {
    if (userId === null) {
      this.setUser(UserHelpers.ALL_USERS);
      return;
    }

    const user = this.users.find((u) => u.id === userId);

    if (!user) {
      const errorMessage = `User with ID ${userId} not found`;
      console.error(`[UserService] ${errorMessage}`);
      this.errorSubject.next(errorMessage);
      return;
    }

    this.setUser(user);
  }

  /**
   * Check if user exists in the users list
   */
  userExists(userId: number | null): boolean {
    if (userId === null) return true; // ALL_USERS always exists
    return this.users.some((u) => u.id === userId);
  }

  /**
   * Get user by ID
   */
  getUserById(userId: number | null): User | undefined {
    if (userId === null) return UserHelpers.ALL_USERS;
    return this.users.find((u) => u.id === userId);
  }

  /**
   * Reset to ALL_USERS
   */
  resetToAllUsers(): void {
    this.setUser(UserHelpers.ALL_USERS);
  }

  /**
   * Refresh users from data source
   */
  refreshUsers(): void {
    this.initializeUsers();
  }

  /**
   * Check if current user is the ALL_USERS special case
   */
  isAllUsersSelected(): boolean {
    return UserHelpers.isAllUsers(this.currentUser);
  }

  /**
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.currentUserSubject.complete();
    this.usersSubject.complete();
    this.loadingSubject.complete();
    this.errorSubject.complete();
  }

  // CRUD operations stay as instance methods
  async createUser(user: User): Promise<void> {
    await this.usersApi.create(user);
    this.refreshUsers();
  }

  async updateUser(user: User): Promise<void> {
    await this.usersApi.update(user);
    this.refreshUsers();
  }
  async deleteUser(id: number): Promise<void> {
    await this.usersApi.remove(id);
    this.refreshUsers();
  }
}
