import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  effect,
  AfterViewInit,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AnalysisStateService } from '../../../core/services/analysis-state.service';
import { StatCardComponent, StatItem } from '../../../shared/components/stat-card/stat-card.component';

declare const Chart: any;

@Component({
  selector: 'app-statistics-tab',
  imports: [CommonModule, StatCardComponent],
  template: `
    <div class="statistics-view">
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

      <!-- SharePoint Section -->
      @if (hasSharePointData()) {
        <h2>SharePoint Diagnostic Assessment</h2>
        <div class="grid">
          <div class="card">
            <h3>Site Type Distribution</h3>
            <div class="chart-container">
              <canvas id="spTypeChart"></canvas>
            </div>
          </div>
          <div class="card">
            <h3>SharePoint File Samples (Top 6)</h3>
            <div class="file-list">
              @for (file of fileSamples(); track $index) {
                <div class="file-item">
                  <div class="file-name" [title]="file.name">{{ file.name }}</div>
                  <div class="file-meta">
                    <span>{{ file.site }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
        <div class="grid">
          <div class="card">
            <h3>File Category Distribution</h3>
            <div class="chart-container">
              <canvas id="spFileChart"></canvas>
            </div>
          </div>
          <app-stat-card [title]="'SharePoint Statistics'" [stats]="spStats()" />
        </div>
      }
    </div>
  `,
  styles: [
    `
      .statistics-view h2 {
        margin: 1.5rem 0 1rem;
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .statistics-view h2::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 1.25rem;
        background: var(--primary);
        border-radius: 2px;
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

      .alerts-container {
        margin: 1.5rem 0;
      }

      .legacy-card.warning {
        border-left: 4px solid #eab308;
        background: #fffbeb;
        padding: 1rem;
      }

      .legacy-card h3 {
        color: #854d0e;
        border-left: none;
        padding-left: 0;
        font-size: 0.95rem;
        margin-bottom: 0.5rem;
      }

      .legacy-card p {
        color: #713f12;
        margin-bottom: 1rem;
        font-size: 0.85rem;
      }

      .table-container {
        overflow-x: auto;
      }

      .invalid-objects-table {
        width: 100%;
        border-collapse: collapse;
        background: #ffffff;
        border-radius: 4px;
      }

      .invalid-objects-table thead {
        background: #f8fafc;
      }

      .invalid-objects-table th {
        text-align: left;
        padding: 0.75rem;
        font-weight: 700;
        font-size: 0.8rem;
        text-transform: uppercase;
        color: var(--text);
        border-bottom: 2px solid var(--border);
      }

      .invalid-objects-table td {
        padding: 0.75rem;
        font-size: 0.85rem;
        border-bottom: 1px solid var(--border-soft);
      }

      .invalid-objects-table tr:last-child td {
        border-bottom: none;
      }

      .count-badge {
        background: #fef3c7;
        border: 1px solid #fde047;
        color: #a16207;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-weight: 700;
        font-size: 0.8rem;
      }

      .file-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .file-item {
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-soft);
      }

      .file-name {
        font-weight: 600;
        color: var(--text);
        font-size: 0.85rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .file-meta {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 0.25rem;
      }
    `,
  ],
})
export class StatisticsTabComponent implements AfterViewInit, OnDestroy {
  private readonly stateService = inject(AnalysisStateService);
  private readonly platformId = inject(PLATFORM_ID);
  private spTypeChartInstance: any = null;
  private spFileChartInstance: any = null;
  private invalidObjectsChartInstance: any = null;

  readonly data = this.stateService.data;
  readonly hasSharePointData = this.stateService.hasSharePointData;
  readonly invalidObjectsCount = this.stateService.invalidObjectsCount;

  readonly invalidObjects = computed(() => {
    return this.data()?.stats?.invalid_objects || [];
  });

  readonly fileSamples = computed(() => {
    return this.data()?.sharepoint?.file_samples.slice(0, 6) || [];
  });

  readonly spStats = computed<StatItem[]>(() => {
    const sp = this.data()?.sharepoint;
    if (!sp) return [];

    const gbUsed = this.stateService.storageInGB();
    return [
      { label: 'Total Sites', value: sp.total_sites },
      { label: 'Total Files', value: sp.total_files },
      { label: 'Storage (GB)', value: `${gbUsed} GB` },
    ];
  });

  constructor() {
    effect(() => {
      const currentData = this.data();
      if (currentData?.sharepoint) {
        this.renderSharePointCharts(currentData.sharepoint);
      }
      if (currentData?.stats?.invalid_objects && this.invalidObjectsCount() > 0) {
        setTimeout(() => this.renderInvalidObjectsChart(currentData.stats.invalid_objects), 100);
      }
    });
  }

  ngAfterViewInit(): void {
    const currentData = this.data();
    if (currentData?.sharepoint) {
      this.renderSharePointCharts(currentData.sharepoint);
    }
    if (currentData?.stats?.invalid_objects && this.invalidObjectsCount() > 0) {
      setTimeout(() => this.renderInvalidObjectsChart(currentData.stats.invalid_objects), 100);
    }
  }

  ngOnDestroy(): void {
    if (this.spTypeChartInstance) {
      this.spTypeChartInstance.destroy();
    }
    if (this.spFileChartInstance) {
      this.spFileChartInstance.destroy();
    }
    if (this.invalidObjectsChartInstance) {
      this.invalidObjectsChartInstance.destroy();
    }
  }

  private renderSharePointCharts(spData: any): void {
    this.renderSpTypeChart(spData);
    this.renderSpFileChart(spData);
  }

  private renderSpTypeChart(spData: any): void {
    const canvas = document.getElementById('spTypeChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.spTypeChartInstance) {
      this.spTypeChartInstance.destroy();
    }

    this.spTypeChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(spData.site_type_distribution),
        datasets: [
          {
            data: Object.values(spData.site_type_distribution),
            backgroundColor: ['#2563eb', '#94a3b8'],
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
            labels: { boxWidth: 10, font: { size: 11 } },
          },
        },
      },
    });
  }

  private renderSpFileChart(spData: any): void {
    const canvas = document.getElementById('spFileChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.spFileChartInstance) {
      this.spFileChartInstance.destroy();
    }

    this.spFileChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(spData.file_category_distribution),
        datasets: [
          {
            data: Object.values(spData.file_category_distribution),
            backgroundColor: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
            borderWidth: 1,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 10, font: { size: 10 } },
          },
        },
      },
    });
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
