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
import { AnalysisTabComponent } from './tabs/analysis-tab.component';
import { SharePointTabComponent } from './tabs/sharepoint-tab.component';
import { RecommendationTabComponent } from './tabs/recommendation-tab.component';
import { RoadmapTabComponent } from './tabs/roadmap-tab.component';
import { AgentService } from '../../core/services/agent.service';
import { AnalysisStateService } from '../../core/services/analysis-state.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    TabNavigationComponent,
    DiscoveryTabComponent,
    AnalysisTabComponent,
    SharePointTabComponent,
    RecommendationTabComponent,
    RoadmapTabComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-container">
      <header>
        <div class="logo">WinfoTest <span>Discovery Agent</span></div>
        <div class="status-badge">Live Analysis</div>
      </header>

      <app-tab-navigation
        [tabs]="tabs()"
        [activeTabId]="activeTabId()"
        (tabChange)="onTabChange($event)"
      />

      <main id="content-area">
        @if (activeTabId() === 'discovery') {
          <app-discovery-tab (analysisStarted)="handleAnalysis()" />
        }
        @if (activeTabId() === 'analysis') {
          <app-analysis-tab />
        }
        @if (activeTabId() === 'sharepoint' && hasSharePointData()) {
          <app-sharepoint-tab />
        }
        @if (activeTabId() === 'recommendation') {
          <app-recommendation-tab />
        }
        @if (activeTabId() === 'roadmap') {
          <app-roadmap-tab />
        }
      </main>
    </div>
  `,
  styles: [
    `
      .app-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 1rem 1.5rem;
        min-height: 100vh;
      }

      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--border);
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

  readonly tabs = computed<Tab[]>(() => {
    const hasData = this.stateService.data() !== null;
    const hasSharePoint = this.hasSharePointData();

    return [
      { id: 'discovery', num: '01', name: 'Discovery', enabled: true },
      { id: 'analysis', num: '02', name: 'Analysis', enabled: hasData },
      { id: 'sharepoint', num: '03', name: 'SharePoint', enabled: hasData && hasSharePoint },
      { id: 'recommendation', num: '04', name: 'Recommendation', enabled: hasData },
      { id: 'roadmap', num: '05', name: 'Roadmap', enabled: hasData },
    ];
  });

  ngOnInit(): void {
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
          this.activeTabId.set('analysis');
        }, 800);
      }, 500);
    });
  }

  onTabChange(tabId: string): void {
    this.activeTabId.set(tabId);
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
}
