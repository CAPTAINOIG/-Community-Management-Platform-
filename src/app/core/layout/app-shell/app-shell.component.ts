import { Component, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommunityDataService } from '../../services/community-data.service';
import { ToastStackComponent } from '../../../shared/toast-stack/toast-stack.component';

interface NavigationItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  imports: [NgIcon, RouterLink, RouterLinkActive, RouterOutlet, ToastStackComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  readonly collapsed = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly notificationsOpen = signal(false);

  readonly primaryNavigation: NavigationItem[] = [
    { label: 'Overview', path: '/', icon: 'lucideLayoutDashboard' },
    { label: 'Members', path: '/members', icon: 'lucideUsers' },
    { label: 'Events', path: '/events', icon: 'lucideCalendarDays' },
    { label: 'Volunteers', path: '/volunteers', icon: 'lucideHandHelping' },
    { label: 'Programmes', path: '/programmes', icon: 'lucideBookOpenCheck' },
    { label: 'Projects', path: '/projects', icon: 'lucideFolderKanban' },
  ];

  readonly supportNavigation: NavigationItem[] = [
    { label: 'Reports', path: '/reports', icon: 'lucideActivity' },
    { label: 'Settings', path: '/settings', icon: 'lucideSettings' },
  ];

  constructor(readonly community: CommunityDataService) {}

  toggleSidebar(): void {
    this.collapsed.update((collapsed) => !collapsed);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleNotifications(): void {
    this.notificationsOpen.update((open) => !open);
  }
}
