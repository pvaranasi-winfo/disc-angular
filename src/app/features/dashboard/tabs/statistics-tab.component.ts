import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  effect,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisStateService } from '../../../core/services/analysis-state.service';
import { StatCardComponent, StatItem } from '../../../shared/components/stat-card/stat-card.component';

declare const Chart: any;

@Component({
  selector: 'app-statistics-tab',
  imports: [CommonModule, StatCardComponent],
  template: `
    <div class="statistics-view">
      <h2>21c Feature Alignment</h2>
      <div class="recommendations-container grid">
        @for (rec of recommendations(); track $index) {
          <div class="card">
            <span class="badge">21c Feature</span>
            <h3>{{ rec.feature }}</h3>
            <p>{{ rec.description }}</p>
            <div class="impact">
              <strong>Impacted:</strong> {{ rec.impacted_objects.join(', ') }}
            </div>
          </div>
        }
      </div>

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

      .badge {
        display: inline-block;
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        color: var(--primary);
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .impact {
        margin-top: 1rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--border-soft);
        font-size: 0.85rem;
        color: var(--text-muted);
      }

      .impact strong {
        color: var(--text);
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
  private spTypeChartInstance: any = null;
  private spFileChartInstance: any = null;

  readonly data = this.stateService.data;
  readonly hasSharePointData = this.stateService.hasSharePointData;

  readonly recommendations = computed(() => {
    return this.data()?.recommendations || [];
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
    });
  }

  ngAfterViewInit(): void {
    const currentData = this.data();
    if (currentData?.sharepoint) {
      this.renderSharePointCharts(currentData.sharepoint);
    }
  }

  ngOnDestroy(): void {
    if (this.spTypeChartInstance) {
      this.spTypeChartInstance.destroy();
    }
    if (this.spFileChartInstance) {
      this.spFileChartInstance.destroy();
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
}
