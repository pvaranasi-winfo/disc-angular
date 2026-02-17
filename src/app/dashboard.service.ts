import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface SubComponent {
  name: string;
  version: string;
}

export interface Component {
  name: string;
  type: string;
  currentVersion: string;
  status: string;
  subComponents?: SubComponent[];
}

export interface JiraTicket {
  id: string;
  title: string;
  priority: string;
  description: string;
}

export interface GithubIssue {
  id: string;
  summary: string;
  description: string;
  tag: string;
}

export interface Documentation {
  title: string;
  url: string;
  Description: string;
  Foldername: string;
}

export interface SummaryMetrics {
  healthScore: number;
  criticalCount: number;
  upgradeCount: number;
}

export interface Insights {
  jiraTickets: JiraTicket[];
  github: GithubIssue[];
  docs: Documentation[];
}

export interface DashboardData {
  id: string;
  environment: string;
  scanTimestamp: string;
  runId: string;
  summaryMetrics: SummaryMetrics;
  components: Component[];
  insights: Insights;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor() { }

  getDashboardData(): Observable<DashboardData> {
    const mockData: DashboardData = {
      id: 'unique-guid-for-this-run',
      environment: 'Dev',
      scanTimestamp: '2026-02-13T10:30:00Z',
      runId: 'agent-run-123',
      summaryMetrics: {
        healthScore: 94,
        criticalCount: 0,
        upgradeCount: 1
      },
      components: [
        {
          name: 'Oracle Database',
          type: 'Database',
          currentVersion: '19.21.0.0.0',
          status: 'Active',
          subComponents: [
            {
              name: 'Oracle APEX',
              version: '23.2.0'
            }
          ]
        },
        {
          name: 'WinfoTest Application',
          type: 'Application',
          currentVersion: '2.4.5',
          status: 'Upgrade Available'
        }
      ],
      insights: {
        jiraTickets: [
          {
            id: 'WINFO-442',
            title: 'Upgrade DB',
            priority: 'High',
            description: 'The current Tokyo region does not support OCI Gen-AI. We need to configure the Autonomous Database to call the London (LHR) endpoint for NL2SQL services.'
          }
        ],
        github: [
          {
            id: '10455',
            summary: 'Configure Cross-Region Gen-AI Bridge (Tokyo to London)',
            description: 'The current Tokyo region does not support OCI Gen-AI. We need to configure the Autonomous Database to call the London (LHR) endpoint for NL2SQL services.',
            tag: 'infra'
          }
        ],
        docs: [
          {
            title: 'Upgrade Guide',
            url: 'https://...',
            Description: 'UpgradeUpgradeUpgradeUpgrade',
            Foldername: 'Upgrade'
          }
        ]
      }
    };

    return of(mockData);
  }
}