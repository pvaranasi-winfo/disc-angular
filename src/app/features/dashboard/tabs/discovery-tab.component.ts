import {
  Component,
  output,
  signal,
  viewChild,
  inject,
  effect,
  OnDestroy,
  PLATFORM_ID,
  computed,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AgentOverlayComponent } from '../../../shared/components/agent-overlay/agent-overlay.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import {
  StatCardComponent,
  StatItem,
} from '../../../shared/components/stat-card/stat-card.component';
import { AnalysisStateService } from '../../../core/services/analysis-state.service';
import { AgentService } from '../../../core/services/agent.service';

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
            class="btn premium"
            [disabled]="isGatheringData() || isAnalyzing() || isCheckingCompatibility()"
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
            [disabled]="isAnalyzing() || isGatheringData() || isCheckingCompatibility()"
            (click)="runAnalysis()"
          >
            @if (isAnalyzing()) {
              Agent Working...
            } @else {
              Run Diagnostic Analysis
            }
          </button>
          <button
            id="check-compatibility-btn"
            class="btn premium"
            [disabled]="isCheckingCompatibility() || isAnalyzing() || isGatheringData()"
            (click)="checkCompatibility()"
          >
            @if (isCheckingCompatibility()) {
              Checking...
            } @else {
              Check Compatibility
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

      <app-confirmation-modal
        [title]="'Check Compatibility'"
        [message]="'Are you sure you want to check compatibility? This will verify system compatibility requirements.'"
        [isVisible]="showCompatibilityModal()"
        (confirmed)="confirmCheckCompatibility()"
        (cancelled)="cancelCheckCompatibility()"
      />

      @if (resultsVisible()) {
        <div class="grid">
          <app-stat-card [title]="'Source Environment'" [stats]="sourceEnvironmentStats()" />
          <app-stat-card [title]="'Database Overview'" [stats]="databaseStats()" />
        </div>

        <!-- Database Details Section -->
        <h2>Database Details</h2>
        <div class="grid">
          <div class="card">
            <h3>System Information</h3>
            <div class="detail-list">
              @if (dbInfo(); as info) {
                <div class="detail-item">
                  <span class="label">Database Name:</span>
                  <span class="value">{{ info.db_name }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Version:</span>
                  <span class="value">{{ info.db_version }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Server:</span>
                  <span class="value">{{ info.server_name }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">OS:</span>
                  <span class="value">{{ info.os }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Instance Type:</span>
                  <span class="value">{{ info.instance_type }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Flashback:</span>
                  <span class="value" [class.warning]="info.flashback_status === 'NO'">{{ info.flashback_status }}</span>
                </div>
              }
            </div>
          </div>
          <div class="card">
            <h3>Key Parameters</h3>
            <div class="detail-list">
              @if (dbParameters(); as params) {
                <div class="detail-item">
                  <span class="label">SGA Target:</span>
                  <span class="value">{{ formatBytes(params.sga_target.value) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Audit Trail:</span>
                  <span class="value">{{ params.audit_trail.value }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        @if (hiddenParameters().length > 0) {
          <div class="grid">
            <div class="card">
              <h3>Hidden Parameters</h3>
              <div class="detail-list">
                @for (param of hiddenParameters(); track $index) {
                  <div class="detail-item">
                    <span class="label">{{ param.name }}:</span>
                    <span class="value">{{ param.value }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- Invalid Objects Section -->
        @if (invalidObjectsCount() > 0) {
          <h2>⚠️ Invalid Database Objects ({{ invalidObjectsCount() }} total)</h2>
          <div class="card">
            <h3>Distribution by Owner and Type</h3>
            <div class="chart-container-large">
              <canvas id="invalidObjectsChart"></canvas>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .hero {
        text-align: left;
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

      .chart-container-large {
        height: 300px;
        position: relative;
        margin: 0.5rem 0;
      }

      .detail-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-soft);
      }

      .detail-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .detail-item .label {
        font-weight: 600;
        color: var(--text-muted);
        font-size: 0.85rem;
      }

      .detail-item .value {
        font-weight: 700;
        color: var(--text);
        font-size: 0.85rem;
      }

      .detail-item .value.warning {
        color: #dc2626;
      }

      .discovery-view h2 {
        margin: 1.5rem 0 1rem;
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .discovery-view h2::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 1.25rem;
        background: var(--primary);
        border-radius: 2px;
      }
    `,
  ],
})
export class DiscoveryTabComponent implements OnDestroy {
  private readonly stateService = inject(AnalysisStateService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly agentService = inject(AgentService);
  private invalidObjectsChartInstance: any = null;

  readonly analysisStarted = output<void>();
  readonly dataGatheringStarted = output<void>();

  readonly agentOverlay = viewChild(AgentOverlayComponent);

  readonly isAnalyzing = signal<boolean>(false);
  readonly resultsVisible = signal<boolean>(false);
  readonly analysisCompleted = signal<boolean>(false);
  readonly isGatheringData = signal<boolean>(false);
  readonly dataGatheringCompleted = signal<boolean>(false);
  readonly isCheckingCompatibility = signal<boolean>(false);
  readonly showGatherDataModal = signal<boolean>(false);
  readonly showRunAnalysisModal = signal<boolean>(false);
  readonly showCompatibilityModal = signal<boolean>(false);

  readonly data = this.stateService.data;
  readonly invalidObjectsCount = this.stateService.invalidObjectsCount;

  readonly sourceEnvironmentStats = computed<StatItem[]>(() => {
    const data = this.stateService.data();
    if (!data?.comparison) {
      return [
        { label: 'Database Engine', value: 'Oracle 18c XE' },
        { label: 'Operating System', value: 'Ubuntu 18.04' },
        { label: 'Java Runtime', value: 'OpenJDK 8' },
      ];
    }

    return data.comparison.map(item => ({
      label: item.component,
      value: item.current,
    }));
  });

  readonly dbInfo = computed(() => {
    return this.data()?.stats?.database_information || null;
  });

  readonly dbParameters = computed(() => {
    return this.data()?.stats?.parameters || null;
  });

  readonly hiddenParameters = computed(() => {
    return this.data()?.stats?.parameters?.hidden_parameters || [];
  });

  readonly invalidObjects = computed(() => {
    return this.data()?.stats?.invalid_objects || [];
  });

  readonly databaseStats = computed<StatItem[]>(() => {
    const info = this.dbInfo();
    if (!info) return [];

    return [
      { label: 'Database', value: info.db_name },
      { label: 'Server', value: info.server_name },
      { label: 'Instance Type', value: info.instance_type },
      { label: 'Data Size (GB)', value: info.data_size_gb.toFixed(2) },
    ];
  });

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
      if (data?.stats?.invalid_objects && this.resultsVisible()) {
        setTimeout(() => this.renderInvalidObjectsChart(data.stats.invalid_objects), 100);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.invalidObjectsChartInstance) {
      this.invalidObjectsChartInstance.destroy();
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

  checkCompatibility(): void {
    if (this.isCheckingCompatibility()) {
      return;
    }

    this.showCompatibilityModal.set(true);
  }

  confirmCheckCompatibility(): void {
    this.showCompatibilityModal.set(false);
    this.isCheckingCompatibility.set(true);
    const overlay = this.agentOverlay();
    if (overlay) {
      overlay.show();
    }

    this.agentService.checkCompatibility().subscribe({
      next: (response) => {
        this.isCheckingCompatibility.set(false);
        if (overlay) {
          overlay.hide();
        }
        console.log('Compatibility check successful:', response);
      },
      error: (error) => {
        this.isCheckingCompatibility.set(false);
        if (overlay) {
          overlay.hide();
        }
        console.error('Compatibility check failed:', error);
      },
    });
  }

  cancelCheckCompatibility(): void {
    this.showCompatibilityModal.set(false);
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
    if (data?.stats?.invalid_objects) {
      setTimeout(() => this.renderInvalidObjectsChart(data.stats.invalid_objects), 100);
    }
  }

  hideOverlay(): void {
    const overlay = this.agentOverlay();
    if (overlay) {
      overlay.hide();
    }
    this.isAnalyzing.set(false);
  }

  formatBytes(bytes: string): string {
    const numBytes = parseInt(bytes, 10);
    const gb = numBytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  }

  private renderInvalidObjectsChart(invalidObjects: any[]): void {
    // Only run in browser environment (not during SSR)
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const canvas = document.getElementById('invalidObjectsChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.invalidObjectsChartInstance) {
      this.invalidObjectsChartInstance.destroy();
    }

    // Create labels combining owner and object_type
    const labels = invalidObjects.map(obj => `${obj.owner} - ${obj.object_type}`);
    const counts = invalidObjects.map(obj => obj.invalid_count);
    const colors = invalidObjects.map((_, index) => {
      const hue = (index * 137.5) % 360; // Golden angle for nice distribution
      return `hsl(${hue}, 70%, 60%)`;
    });

    this.invalidObjectsChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Invalid Objects Count',
            data: counts,
            backgroundColor: colors,
            borderColor: colors.map(c => c.replace('60%', '40%')),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            ticks: { 
              color: '#64748b', 
              font: { size: 11 },
              stepSize: 1,
            },
            grid: { color: '#e2e8f0' },
            title: {
              display: true,
              text: 'Count',
              color: '#1e293b',
              font: { size: 12, weight: 'bold' },
            },
          },
          y: {
            ticks: { 
              color: '#1e293b', 
              font: { size: 10, weight: '600' },
            },
            grid: { display: false },
          },
        },
        plugins: { 
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                return `Invalid Objects: ${context.parsed.x}`;
              },
            },
          },
        },
      },
    });
  }
}
