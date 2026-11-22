import { Component, ChangeDetectionStrategy, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HeaderComponent } from './header/header.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ToastContainerComponent } from './shared/toast/toast-container.component';
import { ConfirmDialogComponent } from './shared/confirm/confirm-dialog.component';
import { ThemeService } from 'src/services/theme.service';

const MOBILE_NAV_QUERY = '(max-width: 768px)';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [HeaderComponent, NavbarComponent, RouterOutlet, ToastContainerComponent, ConfirmDialogComponent]
})
export class AppComponent {
  private readonly mobileQuery = window.matchMedia(MOBILE_NAV_QUERY);

  readonly navOpen = signal(false);
  readonly isMobile = signal(this.mobileQuery.matches);

  constructor() {
    inject(ThemeService);
    const destroyRef = inject(DestroyRef);
    const router = inject(Router);

    const onViewportChange = (event: MediaQueryListEvent) => {
      this.isMobile.set(event.matches);
      if (!event.matches) {
        this.navOpen.set(false);
      }
    };
    this.mobileQuery.addEventListener('change', onViewportChange);
    destroyRef.onDestroy(() => this.mobileQuery.removeEventListener('change', onViewportChange));

    router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => this.navOpen.set(false));
  }

  toggleNav(): void {
    this.navOpen.update((open) => !open);
  }

  closeNav(): void {
    this.navOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeNav();
  }
}
