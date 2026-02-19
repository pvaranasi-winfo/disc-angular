 
import { Component, Input, inject } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { DashboardData } from '../dashboard.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  private dashboardService = inject(DashboardService);
  @Input() data: DashboardData | null = null;

  showConfigureMcpPanel = false;
  mcpKeys = ['git', 'jira', 'os', 'oracledb', 'sharepoint'];
  mcpConfigs: { [key: string]: string } = {
    git: '',
    jira: '',
    os: '',
    oracledb: '',
    sharepoint: ''
  };
  mcpErrors: { [key: string]: string } = {};

  // Track selected environment
  selectedEnvironment: string = '';

  ngOnChanges() {
    if (this.data?.environment) {
      this.selectedEnvironment = this.data.environment;
    }
  }

  setEnvironment(env: string) {
    if (this.selectedEnvironment === env) return;
    this.selectedEnvironment = env;
    // Simulate API call to fetch dashboard for new environment
    this.dashboardService.getDashboardDataForEnv(env).subscribe((newData) => {
      if (this.data) {
        Object.assign(this.data, newData, { environment: env });
      }
    });
  }

  // Modal toast state
  toastMessage: string | null = null;
  toastType: 'success' | 'error' | null = null;

  closeConfigureMcpPanel() {
    this.showConfigureMcpPanel = false;
    this.mcpErrors = {};
  }

  validateJsonInput(key: string) {
    try {
      if (this.mcpConfigs[key].trim()) {
        JSON.parse(this.mcpConfigs[key]);
        this.mcpErrors[key] = '';
      }
    } catch (e) {
      this.mcpErrors[key] = 'Invalid JSON';
    }
  }

   // Download sample JSON for MCP config
  downloadSampleJson(key: string) {
    // Example sample JSONs for each MCP type
    const samples: { [key: string]: any } = {
      git: {
        repoUrl: 'https://github.com/example/repo',
        branch: 'main',
        token: 'your-git-token-here'
      },
      jira: {
        url: 'https://your-jira-instance.atlassian.net',
        username: 'user@example.com',
        apiToken: 'your-jira-api-token'
      },
      os: {
        endpoint: 'https://openspecimen.example.com/api',
        apiKey: 'your-os-api-key'
      },
      oracledb: {
        host: 'db.example.com',
        port: 1521,
        username: 'oracle_user',
        password: 'oracle_password',
        serviceName: 'ORCL'
      },
      sharepoint: {
        siteUrl: 'https://yourcompany.sharepoint.com/sites/yoursite',
        clientId: 'your-client-id',
        clientSecret: 'your-client-secret'
      }
    };
    const sample = samples[key] || {};
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${key}-sample.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  saveMcpConfigs() {
    // Validate all JSONs
    let hasError = false;
    Object.keys(this.mcpConfigs).forEach(key => {
      try {
        if (this.mcpConfigs[key].trim()) {
          JSON.parse(this.mcpConfigs[key]);
          this.mcpErrors[key] = '';
        } else {
          this.mcpErrors[key] = 'Required';
          hasError = true;
        }
      } catch (e) {
        this.mcpErrors[key] = 'Invalid JSON';
        hasError = true;
      }
    });
    if (hasError) return;
    // Save MCP config using dummy service
    const projectId = this.data?.id || 'dummy-project';
    this.dashboardService.saveMcpConfig(projectId, this.mcpConfigs).subscribe({
      next: () => {
        this.showConfigureMcpPanel = false;
        this.showToast('MCP configuration saved', 'success');
        // Optionally re-run agent after save
        this.dashboardService.rerunAgent(projectId).subscribe({
          next: () => this.showToast('Agent re-run complete', 'success'),
          error: () => this.showToast('Failed to re-run agent', 'error')
        });
      },
      error: () => {
        this.showToast('Failed to save MCP config', 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
  }

  closeToast() {
    this.toastMessage = null;
    this.toastType = null;
  }
}