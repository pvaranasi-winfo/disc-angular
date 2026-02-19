import { Component, OnInit, inject, signal } from '@angular/core';
import { DashboardService, DashboardData } from '../dashboard.service';
import { HeaderComponent } from '../header/header.component';
import { DetectedComponentsComponent } from '../detected-components/detected-components.component';
import { JiraTicketsComponent } from '../jira-tickets/jira-tickets.component';
import { GithubIssuesComponent } from '../github-issues/github-issues.component';
import { DocumentationComponent } from '../documentation/documentation.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    HeaderComponent,
    DetectedComponentsComponent, 
    JiraTicketsComponent,
    GithubIssuesComponent,
    DocumentationComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  protected dashboardData = signal<DashboardData | null>(null);
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  ngOnInit() {
    this.loadDashboardData();
    // Fallback: if data not loaded in 1s, show error
    setTimeout(() => {
      if (this.loading() && !this.dashboardData()) {
        this.error.set('Dashboard data failed to load (timeout).');
        this.loading.set(false);
      }
    }, 1000);
  }

  private loadDashboardData() {
    this.loading.set(true);
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load dashboard data');
        this.loading.set(false);
        console.error('Dashboard data loading error:', err);
      }
    });
  }
}