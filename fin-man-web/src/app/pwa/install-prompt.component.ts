import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

const DISMISS_KEY = 'fin-man-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Component({
  selector: 'app-install-prompt',
  templateUrl: './install-prompt.component.html',
  styleUrls: ['./install-prompt.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class InstallPromptComponent {
  private readonly deferred = signal<BeforeInstallPromptEvent | null>(null);
  private readonly dismissed = signal(readDismissed());
  private readonly standalone = signal(isStandalone());

  readonly canInstall = computed(() => this.deferred() !== null);
  readonly visible = computed(() => {
    if (this.standalone() || this.dismissed()) return false;
    return this.canInstall() || isIosSafari();
  });

  constructor() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferred.set(event as BeforeInstallPromptEvent);
    });
    window.addEventListener('appinstalled', () => {
      this.deferred.set(null);
      this.standalone.set(true);
    });
  }

  async install(): Promise<void> {
    const event = this.deferred();
    if (!event) return;
    await event.prompt();
    const choice = await event.userChoice;
    this.deferred.set(null);
    if (choice.outcome === 'accepted') {
      this.standalone.set(true);
    }
  }

  dismiss(): void {
    this.dismissed.set(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* private mode */
    }
  }
}

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent;
  const iPadOs = window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
  const ios = /iPad|iPhone|iPod/.test(ua) || iPadOs;
  return ios && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
}
