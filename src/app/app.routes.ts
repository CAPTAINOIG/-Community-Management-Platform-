import { Routes } from '@angular/router';
import { AppShellComponent } from './core/layout/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((module) => module.DashboardComponent),
        title: 'Dashboard · CommunityHub',
      },
      {
        path: 'members',
        loadComponent: () => import('./features/members/members.component').then((module) => module.MembersComponent),
        title: 'Members · CommunityHub',
      },
      {
        path: 'events/:eventId',
        loadComponent: () => import('./features/events/events.component').then((module) => module.EventsComponent),
        title: 'Event details · CommunityHub',
      },
      {
        path: 'events',
        loadComponent: () => import('./features/events/events.component').then((module) => module.EventsComponent),
        title: 'Events · CommunityHub',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
