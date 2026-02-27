import {
  Component,
  inject,
  signal,
  computed,
  viewChild,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TabNavigationComponent, Tab } from './tab-navigation.component';
import { DiscoveryTabComponent } from './tabs/discovery-tab.component';
import { StatisticsTabComponent } from './tabs/statistics-tab.component';
import { ImpactAnalysisTabComponent } from './tabs/impact-analysis-tab.component';
import { AgentService } from '../../core/services/agent.service';
import { AnalysisStateService } from '../../core/services/analysis-state.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    TabNavigationComponent,
    DiscoveryTabComponent,
    StatisticsTabComponent,
    ImpactAnalysisTabComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-container">
      <header>
        <div class="logo">WinfoTest <span>Discovery Agent</span></div>
        <div class="header-actions">
          <button 
            class="logs-btn" 
            (click)="openAzureLogs()" 
            title="View Azure Logs"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>View Logs</span>
          </button>
          <button 
            class="refresh-btn" 
            (click)="handleRefresh()" 
            [disabled]="isRefreshing()"
            title="Refresh Analysis Data"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
              [class.spinning]="isRefreshing()"
            >
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
            @if (isRefreshing()) {
              <span>Refreshing...</span>
            } @else {
              <span>Refresh</span>
            }
          </button>
          <div class="status-badge">Live Analysis</div>
        </div>
      </header>

      <app-tab-navigation
        [tabs]="tabs()"
        [activeTabId]="activeTabId()"
        (tabChange)="onTabChange($event)"
      />

      <main id="content-area">
        @if (activeTabId() === 'discovery') {
          <app-discovery-tab 
            (analysisStarted)="handleAnalysis()" 
            (dataGatheringStarted)="handleDataGathering()" 
          />
        }
        @if (activeTabId() === 'statistics') {
          <app-statistics-tab />
        }
        @if (activeTabId() === 'impactAnalysis') {
          <app-impact-analysis-tab />
        }
      </main>
    </div>
  `,
  styles: [
    `
      .app-container {
        max-width: 1800px;
        margin: 0 auto;
        padding: 0.5rem 0.5rem;
        height: 100vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--border);
        flex-shrink: 0;
      }

      app-tab-navigation {
        flex-shrink: 0;
      }

      main {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding-bottom: 1rem;
      }

      .logo {
        font-size: 1.25rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text);
      }

      .logo span {
        color: var(--primary);
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .logs-btn,
      .refresh-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: #ffffff;
        border: 1px solid var(--border);
        color: var(--text);
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .logs-btn:hover,
      .refresh-btn:hover:not(:disabled) {
        background: #f8fafc;
        border-color: var(--primary);
        color: var(--primary);
      }

      .refresh-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .refresh-btn svg {
        transition: transform 0.3s ease;
      }

      .refresh-btn svg.spinning {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .status-badge {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        color: var(--primary);
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 700;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private readonly agentService = inject(AgentService);
  private readonly stateService = inject(AnalysisStateService);

  readonly discoveryTab = viewChild(DiscoveryTabComponent);

  readonly activeTabId = signal<string>('discovery');
  readonly hasSharePointData = this.stateService.hasSharePointData;
  readonly isRefreshing = signal<boolean>(false);

  readonly tabs = computed<Tab[]>(() => {
    const hasData = this.stateService.data() !== null;

    return [
      { id: 'discovery', num: '01', name: 'Discovery', enabled: true },
      { id: 'statistics', num: '02', name: 'Statistics', enabled: hasData },
      { id: 'impactAnalysis', num: '03', name: 'Impact Analysis', enabled: hasData },
    ];
  });

  ngOnInit(): void {
    // Fetch analysis data at startup
    this.handleRefresh();

    // Subscribe to agent completion
    this.agentService.completion$.subscribe((data) => {
      this.stateService.setAnalysisData(data);

      // Auto-switch to Analysis tab after a brief delay
      setTimeout(() => {
        const discovery = this.discoveryTab();
        if (discovery) {
          discovery.showResults();
          discovery.hideOverlay();
        }

        setTimeout(() => {
          this.activeTabId.set('impactAnalysis');
        }, 800);
      }, 500);
    });
  }

  onTabChange(tabId: string): void {
    this.activeTabId.set(tabId);
  }

  handleDataGathering(): void {
    // Execute data gathering to MCP
    this.agentService.gatherDataToMCP().subscribe({
      next: (response) => {
        // //console.log('Data gathering completed:', response);
        const discovery = this.discoveryTab();
        if (discovery) {
          discovery.finishDataGathering();
        }
      },
      error: (error) => {
        console.error('Data gathering failed:', error);
        const discovery = this.discoveryTab();
        if (discovery) {
          discovery.hideOverlay();
        }
      },
    });
  }

  handleAnalysis(): void {
    // Execute the full agent analysis
    this.agentService.runAnalysis().subscribe({
      next: (data) => {
        this.agentService.emitCompletion(data);
      },
      error: (error) => {
        console.error('Analysis failed:', error);
        const discovery = this.discoveryTab();
        if (discovery) {
          discovery.hideOverlay();
        }
      },
    });
  }

  handleRefresh(): void {
    // Fetch analysis data without logs or discover endpoint
    this.isRefreshing.set(true);
    
    this.agentService.fetchAnalysisData().subscribe({
      next: (data) => {
        //console.log('Analysis data refreshed:', data);
        this.stateService.setAnalysisData(data[0] || null);
        this.isRefreshing.set(false);
        
        // Update discovery tab if it exists and analysis is completed
        const discovery = this.discoveryTab();
        if (discovery && data && data.length > 0) {
          discovery.showResults();
        }
      },
      error: (error) => {
        console.error('Refresh failed:', error);
        this.isRefreshing.set(false);
      },
    });
  }

  openAzureLogs(): void {
    const azureLogsUrl = 'https://portal.azure.com/#@winfosolutions.com/resource/subscriptions/cebd2af9-714c-478c-bb01-5177fa0b5961/resourceGroups/winfo-crd-demo/providers/Microsoft.Web/sites/winfotest-da-agent/logStream-quickstart';
    window.open(azureLogsUrl, '_blank');
  }
}
