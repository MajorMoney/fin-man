import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [HeaderComponent, NavbarComponent, RouterOutlet]
})
export class AppComponent {
}
