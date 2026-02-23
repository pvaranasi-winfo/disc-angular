import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/project', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'project', loadComponent: () => import('./projects.component').then(m => m.ProjectsComponent) },
  { path: 'jira-tickets-all', loadComponent: () => import('./jira-tickets-all/jira-tickets-all.component').then(m => m.JiraTicketsAllComponent) },
  { path: 'github-issues-all', loadComponent: () => import('./github-issues-all/github-issues-all.component').then(m => m.GithubIssuesAllComponent) },
  { path: 'documentation-all', loadComponent: () => import('./documentation-all/documentation-all.component').then(m => m.DocumentationAllComponent) },
  { path: '**', redirectTo: '/project' }
];
