import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-dashboard-card',
    templateUrl: './dashboard-card.component.html',
    styleUrls: ['./dashboard-card.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class DashboardCardComponent {
  @Input() title!: string;
  @Input() value!: string;
  @Input() subtitle!: string;
}
