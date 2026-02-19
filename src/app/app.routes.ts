import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/project', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'project', loadComponent: () => import('./projects.component').then(m => m.ProjectsComponent) },
  { path: '**', redirectTo: '/project' }
];
