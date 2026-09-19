import { Component, ChangeDetectionStrategy } from '@angular/core';
import { UserSelectorComponent } from './user-selector/user-selector.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [UserSelectorComponent]
})
export class HeaderComponent {
  
}
