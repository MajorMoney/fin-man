import { User } from './users';

export interface Account {
  id: number;
  name: string;
  holdings: number;
  holders: string[];
}
