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
  selector: 'app-analysis-tab',
  imports: [CommonModule, StatCardComponent],
  template: `
    <div class="analysis-view">
      <h2>Depth Analysis & Schema Breakdown</h2>
      <div class="grid">
        <div class="card">
          <h3>Data Type Distribution</h3>
          <div class="chart-container">
            <canvas id="typeChart"></canvas>
          </div>
        </div>
        <app-stat-card [title]="'Schema Statistics'" [stats]="schemaStats()" />
      </div>

      @if (deprecatedCount() > 0) {
        <div class="alerts-container">
          <div class="legacy-card card warning">
            <h3>⚠️ Deprecated/Legacy Types Detected</h3>
            <p>
              The following legacy data types were found. Oracle 21c/23c best practices recommend
              migrating these to modern alternatives.
            </p>
            <div class="legacy-types-grid">
              @for (entry of deprecatedTypes(); track entry.type) {
                <div class="legacy-item">
                  <strong>{{ entry.type }}</strong
                  >: Used in {{ entry.count }} columns
                </div>
              }
            </div>
          </div>
        </div>
      }

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
    </div>
  `,
  styles: [
    `
      .analysis-view h2 {
        margin: 1.5rem 0 1rem;
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .analysis-view h2::before {
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

      .legacy-types-grid {
        display: grid;
        gap: 0.5rem;
      }

      .legacy-item {
        background: #ffffff;
        padding: 0.5rem 0.75rem;
        border-radius: 4px;
        font-size: 0.8rem;
        border: 1px solid #fef08a;
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
    `,
  ],
})
export class AnalysisTabComponent implements AfterViewInit, OnDestroy {
  private readonly stateService = inject(AnalysisStateService);
  private typeChartInstance: any = null;

  readonly data = this.stateService.data;
  readonly deprecatedCount = this.stateService.deprecatedCount;

  readonly schemaStats = computed<StatItem[]>(() => {
    const stats = this.data()?.stats;
    if (!stats) return [];

    return [
      { label: 'Total Columns', value: stats.total_columns },
      { label: 'Avg Cols/Table', value: stats.avg_cols_per_table },
      { label: 'Unique Types', value: stats.unique_data_types.length },
      { label: 'Legacy Types Found', value: Object.keys(stats.deprecated_types).length },
    ];
  });

  readonly deprecatedTypes = computed(() => {
    const stats = this.data()?.stats;
    if (!stats?.deprecated_types) return [];

    return Object.entries(stats.deprecated_types).map(([type, count]) => ({
      type,
      count,
    }));
  });

  readonly recommendations = computed(() => {
    return this.data()?.recommendations || [];
  });

  constructor() {
    effect(() => {
      const currentData = this.data();
      if (currentData?.stats) {
        this.renderTypeChart(currentData.stats);
      }
    });
  }

  ngAfterViewInit(): void {
    const currentData = this.data();
    if (currentData?.stats) {
      this.renderTypeChart(currentData.stats);
    }
  }

  ngOnDestroy(): void {
    if (this.typeChartInstance) {
      this.typeChartInstance.destroy();
    }
  }

  private renderTypeChart(stats: any): void {
    const canvas = document.getElementById('typeChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.typeChartInstance) {
      this.typeChartInstance.destroy();
    }

    const typeLabels = Object.keys(stats.data_type_distribution);
    const typeData = Object.values(stats.data_type_distribution);

    this.typeChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: typeLabels,
        datasets: [
          {
            label: 'Column Count',
            data: typeData,
            backgroundColor: '#3b82f6',
            borderRadius: 4,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            ticks: { color: '#64748b', font: { size: 10 } },
            grid: { color: '#e2e8f0' },
          },
          y: {
            ticks: { color: '#1e293b', font: { size: 10, weight: 'bold' } },
            grid: { display: false },
          },
        },
        plugins: { legend: { display: false } },
      },
    });
  }
}
