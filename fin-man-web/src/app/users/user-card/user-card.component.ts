import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from 'src/libs/core/models/users';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css'],
})
export class UserCardComponent {
  @Input() user!: User;
  @Output() edit = new EventEmitter<User>();
}
