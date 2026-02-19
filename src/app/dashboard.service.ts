  
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
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
  private http = inject(HttpClient);
  // Dummy data for dashboard
  private dummy: DashboardData = {
    id: 'dummy-id',
    environment: 'Dev',
    scanTimestamp: new Date().toISOString(),
    runId: 'dummy-run',
    summaryMetrics: {
      healthScore: 95,
      criticalCount: 1,
      upgradeCount: 2
    },
    components: [
      {
        name: 'Oracle Database',
        type: 'Database',
        currentVersion: '19.21.0.0.0',
        status: 'Active',
        subComponents: [
          { name: 'Oracle APEX', version: '23.2.0' }
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
          url: 'https://example.com/upgrade-guide',
          Description: 'Upgrade instructions for the application.',
          Foldername: 'Upgrade'
        }
      ]
    }
  };

  // 1. Fetch all projects
  getProjects(): Observable<any[]> {
    return of([
      { id: 'proj-1', projectName: 'Demo Project Alpha', createdDate: new Date('2026-02-01T10:00:00Z') },
      { id: 'proj-2', projectName: 'Demo Project Beta', createdDate: new Date('2026-02-10T14:30:00Z') },
      { id: 'proj-3', projectName: 'Demo Project Gamma', createdDate: new Date('2026-02-15T09:15:00Z') }
    ]);
  }

  // 2. Create a project
  createProject(payload: any): Observable<any> {
    return of({ ...payload, id: 'proj-' + Math.floor(Math.random() * 10000) });
  }

  // 3. Delete a project
  deleteProject(projectId: string): Observable<any> {
    return of({ success: true });
  }


  // Fetch dashboard data for a specific environment (dummy)
  getDashboardDataForEnv(env: string): Observable<DashboardData> {
    // Return dummy data with environment changed
    return of({ ...this.dummy, environment: env, scanTimestamp: new Date().toISOString() });
  }
  // 4. Fetch dashboard details for a project
  getDashboardData(projectId?: string): Observable<DashboardData> {
    // Always return dummy data for now
    return of(this.dummy);
  }

  // 5. Save/update MCP config for a project
  saveMcpConfig(projectId: string, mcpConfig: any): Observable<any> {
    // Simulate backend save
    return of({ success: true, updated: true });
  }

  // 6. Re-run agent/refresh dashboard after MCP config update
  rerunAgent(projectId: string): Observable<any> {
    // Simulate agent run
    return of({ success: true, runId: 'dummy-run-' + Math.floor(Math.random() * 10000) });
  }
}

// export class DashboardService {
//   getDashboardData(): Observable<DashboardData> {
//     // Dummy data from sample.json (inlined for demo/styling)
//     const dummy: DashboardData = {
//       id: "unique-guid-for-this-run",
//       environment: "Dev",
//       scanTimestamp: "2026-02-13T10:30:00Z",
//       runId: "agent-run-123",
//       summaryMetrics: {
//         healthScore: 94,
//         criticalCount: 0,
//         upgradeCount: 1
//       },
//       components: [
//         {
//           name: "Oracle Database",
//           type: "Database",
//           currentVersion: "19.21.0.0.0",
//           status: "Active",
//           subComponents: [
//             { name: "Oracle APEX", version: "23.2.0" }
//           ]
//         },
//         {
//           name: "WinfoTest Application",
//           type: "Application",
//           currentVersion: "2.4.5",
//           status: "Upgrade Available"
//         }
//       ],
//       insights: {
//         jiraTickets: [
//           {
//             id: "WINFO-442",
//             title: "Upgrade DB",
//             priority: "High",
//             description: "The current Tokyo region does not support OCI Gen-AI. We need to configure the Autonomous Database to call the London (LHR) endpoint for NL2SQL services."
//           }
//         ],
//         github: [
//           {
//             id: "10455",
//             summary: "Configure Cross-Region Gen-AI Bridge (Tokyo to London)",
//             description: "The current Tokyo region does not support OCI Gen-AI. We need to configure the Autonomous Database to call the London (LHR) endpoint for NL2SQL services.",
//             tag: "infra"
//           }
//         ],
//         docs: [
//           {
//             title: "Upgrade Guide",
//             url: "https://...",
//             Description: "UpgradeUpgradeUpgradeUpgrade",
//             Foldername: "Upgrade"
//           }
//         ]
//       }
//     };
//     return of(dummy);
//   }
// }


