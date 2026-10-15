import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideArrowDownRight,
  lucideArrowUpRight,
  lucideBell,
  lucideBookOpenCheck,
  lucideCalendarDays,
  lucideCheck,
  lucideChevronDown,
  lucideCircleHelp,
  lucideClock3,
  lucideDownload,
  lucideFolderKanban,
  lucideHandHelping,
  lucideLayoutDashboard,
  lucideLogOut,
  lucideMapPin,
  lucideMenu,
  lucidePanelLeftClose,
  lucideSearch,
  lucideSettings,
  lucideUsers,
  lucideX,
} from '@ng-icons/lucide';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideIcons({
      lucideActivity,
      lucideArrowDownRight,
      lucideArrowUpRight,
      lucideBell,
      lucideBookOpenCheck,
      lucideCalendarDays,
      lucideCheck,
      lucideChevronDown,
      lucideCircleHelp,
      lucideClock3,
      lucideDownload,
      lucideFolderKanban,
      lucideHandHelping,
      lucideLayoutDashboard,
      lucideLogOut,
      lucideMapPin,
      lucideMenu,
      lucidePanelLeftClose,
      lucideSearch,
      lucideSettings,
      lucideUsers,
      lucideX,
    }),
  ],
};
