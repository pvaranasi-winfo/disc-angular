import {
  Component,
  output,
  signal,
  viewChild,
  inject,
  effect,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AgentOverlayComponent } from '../../../shared/components/agent-overlay/agent-overlay.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import {
  StatCardComponent,
  StatItem,
} from '../../../shared/components/stat-card/stat-card.component';
import { AnalysisStateService } from '../../../core/services/analysis-state.service';

declare const Chart: any;

@Component({
  selector: 'app-discovery-tab',
  imports: [CommonModule, AgentOverlayComponent, StatCardComponent, ConfirmationModalComponent],
  template: `
    <div class="discovery-view">
      <div class="hero">
        <h1>System Discovery</h1>
        <p>Analyzing legacy Oracle 18c Express Edition environment...</p>
        <div class="actions">
          <button
            id="gather-data-btn"
            class="btn secondary"
            [disabled]="isGatheringData() || isAnalyzing()"
            (click)="gatherData()"
          >
            @if (isGatheringData()) {
              Gathering Data...
            } @else {
              Gather Info to MCP
            }
          </button>
          <button
            id="run-analysis-btn"
            class="btn premium"
            [disabled]="isAnalyzing() || isGatheringData()"
            (click)="runAnalysis()"
          >
            @if (isAnalyzing()) {
              Agent Working...
            } @else {
              Run Diagnostic Analysis
            }
          </button>
        </div>
      </div>

      <app-agent-overlay />

      <app-confirmation-modal
        [title]="'Gather Information to MCP'"
        [message]="'Are you sure you want to gather information to MCP? This will collect OS, GitHub, Oracle, and SharePoint data.'"
        [isVisible]="showGatherDataModal()"
        (confirmed)="confirmGatherData()"
        (cancelled)="cancelGatherData()"
      />

      <app-confirmation-modal
        [title]="'Run Diagnostic Analysis'"
        [message]="'Are you sure you want to run the diagnostic analysis? This will discover and analyze your Oracle environment.'"
        [isVisible]="showRunAnalysisModal()"
        (confirmed)="confirmRunAnalysis()"
        (cancelled)="cancelRunAnalysis()"
      />

      @if (resultsVisible()) {
        <div class="grid">
          <app-stat-card [title]="'Source Environment'" [stats]="sourceEnvironmentStats()" />
          <div class="card">
            <h3>Schema Overview</h3>
            <div class="chart-container">
              <canvas id="schemaChart"></canvas>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .hero {
        text-align: left;
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: #ffffff;
        border-radius: 8px;
        border: 1px solid var(--border);
      }

      .hero h1 {
        font-size: 1.75rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
        color: var(--text);
      }

      .hero p {
        font-size: 1rem;
        color: var(--text-muted);
        margin-bottom: 0;
      }

      .actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-start;
        margin-top: 1.5rem;
      }

      .btn.premium {
        background: var(--primary);
        color: #ffffff;
        border: none;
        padding: 0.75rem 2rem;
        font-size: 0.9rem;
        font-weight: 700;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn.premium:hover:not(:disabled) {
        background: var(--primary-dark);
      }

      .btn.premium:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn.secondary {
        background: #f8fafc;
        color: var(--text);
        border: 1px solid var(--border);
        padding: 0.75rem 2rem;
        font-size: 0.9rem;
        font-weight: 700;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn.secondary:hover:not(:disabled) {
        background: #e2e8f0;
        border-color: var(--primary);
      }

      .btn.secondary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }

      .chart-container {
        height: 180px;
        position: relative;
        margin: 0.5rem 0;
      }
    `,
  ],
})
export class DiscoveryTabComponent implements OnDestroy {
  private readonly stateService = inject(AnalysisStateService);
  private readonly platformId = inject(PLATFORM_ID);
  private schemaChartInstance: any = null;

  readonly analysisStarted = output<void>();
  readonly dataGatheringStarted = output<void>();

  readonly agentOverlay = viewChild(AgentOverlayComponent);

  readonly isAnalyzing = signal<boolean>(false);
  readonly resultsVisible = signal<boolean>(false);
  readonly analysisCompleted = signal<boolean>(false);
  readonly isGatheringData = signal<boolean>(false);
  readonly dataGatheringCompleted = signal<boolean>(false);
  readonly showGatherDataModal = signal<boolean>(false);
  readonly showRunAnalysisModal = signal<boolean>(false);

  readonly sourceEnvironmentStats = signal<StatItem[]>([
    { label: 'Database Version', value: 'Oracle 18c XE' },
    { label: 'OS Version', value: 'Ubuntu 18.04' },
    { label: 'Java Runtime', value: 'OpenJDK 8' },
  ]);

  constructor() {
    // Check if analysis already completed
    const existingData = this.stateService.data();
    if (existingData) {
      this.analysisCompleted.set(true);
      this.resultsVisible.set(true);
    }

    // Render chart when data becomes available
    effect(() => {
      const data = this.stateService.data();
      if (data?.stats && this.resultsVisible()) {
        setTimeout(() => this.renderSchemaChart(data.stats), 100);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.schemaChartInstance) {
      this.schemaChartInstance.destroy();
    }
  }

  gatherData(): void {
    if (this.isGatheringData()) {
      return;
    }

    this.showGatherDataModal.set(true);
  }

  confirmGatherData(): void {
    this.showGatherDataModal.set(false);
    this.isGatheringData.set(true);
    const overlay = this.agentOverlay();
    if (overlay) {
      overlay.show();
    }
    this.dataGatheringStarted.emit();
  }

  cancelGatherData(): void {
    this.showGatherDataModal.set(false);
  }

  finishDataGathering(): void {
    this.isGatheringData.set(false);
    this.dataGatheringCompleted.set(true);
    const overlay = this.agentOverlay();
    if (overlay) {
      overlay.hide();
    }
  }

  runAnalysis(): void {
    if (this.isAnalyzing()) {
      return;
    }

    this.showRunAnalysisModal.set(true);
  }

  confirmRunAnalysis(): void {
    this.showRunAnalysisModal.set(false);
    this.isAnalyzing.set(true);
    const overlay = this.agentOverlay();
    if (overlay) {
      overlay.show();
    }
    this.analysisStarted.emit();
  }

  cancelRunAnalysis(): void {
    this.showRunAnalysisModal.set(false);
  }

  showResults(): void {
    this.resultsVisible.set(true);
    this.isAnalyzing.set(false);
    this.analysisCompleted.set(true);
    const overlay = this.agentOverlay();
    if (overlay) {
      overlay.hide();
    }

    // Render chart with current data
    const data = this.stateService.data();
    if (data?.stats) {
      setTimeout(() => this.renderSchemaChart(data.stats), 100);
    }
  }

  hideOverlay(): void {
    const overlay = this.agentOverlay();
    if (overlay) {
      overlay.hide();
    }
    this.isAnalyzing.set(false);
  }

  private renderSchemaChart(stats: any): void {
    // Only run in browser environment (not during SSR)
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const canvas = document.getElementById('schemaChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.schemaChartInstance) {
      this.schemaChartInstance.destroy();
    }

    this.schemaChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Tables', 'Indexes', 'Constraints'],
        datasets: [
          {
            data: [stats.table_count, stats.index_count, stats.constraint_count],
            backgroundColor: ['#2563eb', '#60a5fa', '#94a3b8'],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#1e293b',
              boxWidth: 10,
              font: { size: 11, weight: 'bold' },
            },
          },
        },
      },
    });
  }
}
