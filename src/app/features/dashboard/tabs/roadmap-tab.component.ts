import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisStateService } from '../../../core/services/analysis-state.service';

@Component({
  selector: 'app-roadmap-tab',
  imports: [CommonModule],
  template: `
    <div class="roadmap-view">
      <h2>Detailed Implementation Roadmap</h2>
      <div class="card">
        <table class="comparison-table roadmap-table">
          <thead>
            <tr>
              <th>Application / Layer</th>
              <th>Current Version</th>
              <th>Target Version</th>
              <th>Guidelines & Observations</th>
            </tr>
          </thead>
          <tbody>
            @for (step of roadmap(); track $index) {
              <tr>
                <td><strong>{{ step.application }}</strong></td>
                <td><span class="bad">{{ step.current }}</span></td>
                <td><span class="good">{{ step.target }}</span></td>
                <td>
                  <div class="observation"><em>{{ step.observation }}</em></div>
                  <div class="guideline"><strong>Guideline:</strong> {{ step.guideline }}</div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      .roadmap-view h2 {
        margin: 1.5rem 0 1rem;
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .roadmap-view h2::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 1.25rem;
        background: var(--primary);
        border-radius: 2px;
      }

      .comparison-table {
        width: 100%;
        border-collapse: collapse;
      }

      .comparison-table th {
        text-align: left;
        padding: 0.75rem 0.5rem;
        background: #f8fafc;
        color: var(--text);
        font-weight: 700;
        font-size: 0.75rem;
        text-transform: uppercase;
        border-bottom: 2px solid var(--border);
      }

      .comparison-table td {
        padding: 0.75rem 0.5rem;
        border-bottom: 1px solid var(--border-soft);
        font-size: 0.85rem;
      }

      .bad {
        color: #dc2626;
        font-weight: 700;
      }

      .good {
        color: #2563eb;
        font-weight: 700;
      }

      .observation {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-bottom: 0.5rem;
        font-style: italic;
      }

      .guideline {
        font-size: 0.8rem;
        padding: 0.4rem 0.6rem;
        background: #f8fafc;
        border-left: 2px solid var(--primary);
      }
    `,
  ],
})
export class RoadmapTabComponent {
  private readonly stateService = inject(AnalysisStateService);

  readonly data = this.stateService.data;

  readonly roadmap = computed(() => {
    return this.data()?.roadmap || [];
  });
}
