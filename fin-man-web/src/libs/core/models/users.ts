export interface User {
  id: number | null; // null for “All”;
  name: string;
}

export class UserHelpers {
  static readonly ALL_USERS: User = {
    id: null,
    name: 'All',
  };

  static isAllUsers(user: User | null | undefined): boolean {
    return !user || user.id === null;
  }
}