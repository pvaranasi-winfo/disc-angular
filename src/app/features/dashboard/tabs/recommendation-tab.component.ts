import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisStateService } from '../../../core/services/analysis-state.service';

@Component({
  selector: 'app-recommendation-tab',
  imports: [CommonModule],
  template: `
    <div class="recommendation-view">
      <h2>Upgrade Recommendation Matrix</h2>
      <div class="card">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Component</th>
              <th>Current Environment</th>
              <th>Recommended Target</th>
              <th>Primary Rationale (Why?)</th>
            </tr>
          </thead>
          <tbody>
            @for (item of comparison(); track $index) {
              <tr>
                <td><strong>{{ item.component }}</strong></td>
                <td><span class="bad">{{ item.current }}</span></td>
                <td><span class="good">{{ item.recommended }}</span></td>
                <td>{{ item.why }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="grid strategy-grid">
        <div class="card">
          <h3>Strategy: How?</h3>
          <p>{{ strategy()?.how }}</p>
        </div>
        <div class="card">
          <h3>Timeline: When?</h3>
          <p>{{ strategy()?.when }}</p>
        </div>
      </div>

      <h2>Key Benefits</h2>
      <div class="grid">
        <div class="card benefit">
          <div class="icon">✨</div>
          <h3>Performance</h3>
          <p>Native JSON type offers up to 2x faster query processing compared to LOB-based storage.</p>
        </div>
        <div class="card benefit">
          <div class="icon">🛡️</div>
          <h3>Security</h3>
          <p>Blockchain tables ensure data immutability for critical audit logs.</p>
        </div>
        <div class="card benefit">
          <div class="icon">🚀</div>
          <h3>Availability</h3>
          <p>
            Leverage "Near Zero Downtime" upgrade paths identified in 21c documentation.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .recommendation-view h2 {
        margin: 1.5rem 0 1rem;
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .recommendation-view h2::before {
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

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }

      .strategy-grid {
        margin-top: 1.5rem;
      }

      .benefit {
        text-align: center;
      }

      .benefit .icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }

      .benefit h3 {
        border: none;
        padding: 0;
        text-align: center;
      }

      .benefit p {
        font-size: 0.85rem;
        color: var(--text-muted);
      }
    `,
  ],
})
export class RecommendationTabComponent {
  private readonly stateService = inject(AnalysisStateService);

  readonly data = this.stateService.data;

  readonly comparison = computed(() => {
    return this.data()?.comparison || [];
  });

  readonly strategy = computed(() => {
    return this.data()?.strategy;
  });
}
