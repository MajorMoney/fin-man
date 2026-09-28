import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ACCOUNT_CARD_BACKGROUNDS,
  AccountCardBackground,
} from 'src/libs/core/ui-models/account-card-backgrounds';

@Component({
  selector: 'app-account-background-picker',
  templateUrl: './account-background-picker.component.html',
  styleUrls: ['./account-background-picker.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class AccountBackgroundPickerComponent {
  @Input() isOpen = false;
  @Input() selected = '';
  @Output() closePicker = new EventEmitter<void>();
  @Output() selectBackground = new EventEmitter<string>();

  backgrounds: AccountCardBackground[] = ACCOUNT_CARD_BACKGROUNDS;

  onOverlayClick(): void {
    this.closePicker.emit();
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  choose(src: string): void {
    this.selectBackground.emit(src);
  }
}
