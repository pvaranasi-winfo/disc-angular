import {
  Component,
  inject,
  computed,
  OnDestroy,
  AfterViewInit,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisStateService } from '../../../core/services/analysis-state.service';
import { StatCardComponent, StatItem } from '../../../shared/components/stat-card/stat-card.component';

declare const Chart: any;

@Component({
  selector: 'app-sharepoint-tab',
  imports: [CommonModule, StatCardComponent],
  template: `
    <div class="sharepoint-view">
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
    </div>
  `,
  styles: [
    `
      .sharepoint-view h2 {
        margin: 1.5rem 0 1rem;
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .sharepoint-view h2::before {
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
export class SharePointTabComponent implements AfterViewInit, OnDestroy {
  private readonly stateService = inject(AnalysisStateService);
  private typeChartInstance: any = null;
  private fileChartInstance: any = null;

  readonly data = this.stateService.data;

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
        this.renderCharts(currentData.sharepoint);
      }
    });
  }

  ngAfterViewInit(): void {
    const currentData = this.data();
    if (currentData?.sharepoint) {
      this.renderCharts(currentData.sharepoint);
    }
  }

  ngOnDestroy(): void {
    if (this.typeChartInstance) {
      this.typeChartInstance.destroy();
    }
    if (this.fileChartInstance) {
      this.fileChartInstance.destroy();
    }
  }

  private renderCharts(spData: any): void {
    this.renderTypeChart(spData);
    this.renderFileChart(spData);
  }

  private renderTypeChart(spData: any): void {
    const canvas = document.getElementById('spTypeChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.typeChartInstance) {
      this.typeChartInstance.destroy();
    }

    this.typeChartInstance = new Chart(ctx, {
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

  private renderFileChart(spData: any): void {
    const canvas = document.getElementById('spFileChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.fileChartInstance) {
      this.fileChartInstance.destroy();
    }

    this.fileChartInstance = new Chart(ctx, {
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
