import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisStateService } from '../../../core/services/analysis-state.service';
import { CompatibilityData } from '../../../models/analysis-response.model';

@Component({
  selector: 'app-impact-analysis-tab',
  imports: [CommonModule],
  template: `
    <div class="impact-analysis-view">
      <!-- Compatibility Section -->
      @if (compatibility() && compatibility()!.length > 0) {
        <h2>Component Compatibility Analysis</h2>
        @for (compatSet of compatibility(); track compatSet.id) {
          <div class="compat-section">
            <h3>
              {{ compatSet.base_component }} 
              <span class="version-badge">v{{ compatSet.base_target_version }}</span>
            </h3>

            <div class="card">
              <h4>Compatibility Matrix</h4>
              <table class="compatibility-table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Current Version</th>
                    <th>Proposed (Developers)</th>
                    <th>Proposed (Agent)</th>
                    <th>LTS Stack</th>
                    <th>Modern Stack</th>
                    <th>Status</th>
                    <th>Action Required</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of compatSet.matrix; track $index) {
                    <tr [class.incompatible]="!item.is_compatible">
                      <td><strong>{{ item.component }}</strong></td>
                      <td>
                        @if (item.current_version) {
                          <span class="current-version">{{ item.current_version }}</span>
                        } @else {
                          <span class="na">-</span>
                        }
                      </td>
                      <td>
                        @if (item['proposed_target(from developers)']) {
                          <span class="target-version-dev">{{ item['proposed_target(from developers)'] }}</span>
                        } @else {
                          <span class="na">?</span>
                        }
                      </td>
                      <td><span class="target-version-agent">{{ item['proposed_target(from agent)'] }}</span></td>
                      <td><span class="lts-stack">{{ item.certified_stack_1_lts }}</span></td>
                      <td><span class="modern-stack">{{ item.certified_stack_2_modern }}</span></td>
                      <td>
                        <div class="status-cell">
                          <span 
                            class="status-badge" 
                            [class.compatible]="item.is_compatible"
                            [class.incompatible]="!item.is_compatible"
                          >
                            {{ item.is_compatible ? '✓' : '✗' }}
                          </span>
                          <div class="status-message">{{ item.status_message }}</div>
                        </div>
                      </td>
                      <td>
                        @if (item.action_required) {
                          <div class="action-required">{{ item.action_required }}</div>
                        } @else {
                          <span class="na">None</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (compatSet.impact_analysis && compatSet.impact_analysis.length > 0) {
              <div class="card impact-analysis-card">
                <h4>Impact Analysis</h4>
                @for (impact of compatSet.impact_analysis; track $index) {
                  <div class="impact-item" [attr.data-risk]="impact.risk_level.toLowerCase()">
                    <div class="impact-header">
                      <strong class="component-name">{{ impact.component }}</strong>
                      <span class="risk-badge" [class]="'risk-' + impact.risk_level.toLowerCase()">
                        {{ impact.risk_level }}
                      </span>
                    </div>
                    <div class="impact-description">{{ impact.description }}</div>
                  </div>
                }
              </div>
            }

            @if (compatSet.detailed_reasoning && compatSet.detailed_reasoning.length > 0) {
              <div class="card detailed-reasoning-card">
                <h4>Detailed Component Analysis</h4>
                @for (reasoning of compatSet.detailed_reasoning; track $index) {
                  <div class="reasoning-item">
                    <h5>{{ reasoning.component_name }}</h5>
                    <div class="transition-stack">
                      <strong>Transition Path:</strong> {{ reasoning.transition_stack }}
                    </div>
                    <div class="rationale-text">{{ reasoning.rationale }}</div>
                    @if (reasoning.deprecated_objects && reasoning.deprecated_objects.length > 0) {
                      <div class="deprecated-section">
                        <strong>Deprecated/Affected Objects:</strong>
                        <ul>
                          @for (obj of reasoning.deprecated_objects; track $index) {
                            <li>{{ obj }}</li>
                          }
                        </ul>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      } @else {
        <div class="no-data">
          <p>No compatibility data available</p>
        </div>
      }


      <!-- Roadmap Section -->
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
      .impact-analysis-view {
        padding: 1rem 0;
      }

      .impact-analysis-view h2 {
        margin: 1.5rem 0 1rem;
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .impact-analysis-view h2::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 1.25rem;
        background: var(--primary);
        border-radius: 2px;
      }

      .compat-section {
        margin-bottom: 2rem;
      }

      .compat-section:last-child {
        margin-bottom: 0;
      }

      .compat-section > h3 {
        margin: 1.5rem 0 1rem;
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text);
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .version-badge {
        background: var(--primary);
        color: #ffffff;
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-size: 0.85rem;
        font-weight: 700;
      }

      .card {
        background: #ffffff;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: var(--shadow);
        border: 1px solid var(--border);
        margin-bottom: 1.5rem;
      }

      .card h4 {
        margin: 0 0 1rem;
        font-size: 1rem;
        font-weight: 700;
        color: var(--text);
      }

      .card h5 {
        margin: 0 0 0.75rem;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--primary);
      }

      .impact-analysis-card {
        background: #fef3c7;
        border-color: #fbbf24;
      }

      .impact-item {
        background: #ffffff;
        padding: 1rem;
        border-radius: 6px;
        border-left: 4px solid #94a3b8;
        margin-bottom: 1rem;
      }

      .impact-item:last-child {
        margin-bottom: 0;
      }

      .impact-item[data-risk="critical"] {
        border-left-color: #dc2626;
      }

      .impact-item[data-risk="high"] {
        border-left-color: #ea580c;
      }

      .impact-item[data-risk="medium"] {
        border-left-color: #f59e0b;
      }

      .impact-item[data-risk="low"] {
        border-left-color: #10b981;
      }

      .impact-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .impact-header .component-name {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text);
      }

      .risk-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .risk-badge.risk-critical {
        background: #fee2e2;
        color: #dc2626;
        border: 1px solid #fca5a5;
      }

      .risk-badge.risk-high {
        background: #ffedd5;
        color: #ea580c;
        border: 1px solid #fdba74;
      }

      .risk-badge.risk-medium {
        background: #fef3c7;
        color: #f59e0b;
        border: 1px solid #fde047;
      }

      .risk-badge.risk-low {
        background: #d1fae5;
        color: #10b981;
        border: 1px solid #6ee7b7;
      }

      .impact-description {
        color: var(--text);
        font-size: 0.85rem;
        line-height: 1.6;
      }

      .comparison-table,
      .compatibility-table {
        width: 100%;
        border-collapse: collapse;
      }

      .comparison-table th,
      .compatibility-table th {
        text-align: left;
        padding: 0.75rem 0.5rem;
        background: #f8fafc;
        color: var(--text);
        font-weight: 700;
        font-size: 0.75rem;
        text-transform: uppercase;
        border-bottom: 2px solid var(--border);
      }

      .comparison-table td,
      .compatibility-table td {
        padding: 0.75rem 0.5rem;
        border-bottom: 1px solid var(--border-soft);
        font-size: 0.85rem;
        vertical-align: top;
      }

      .compatibility-table tr.incompatible {
        background: #fef2f2;
      }

      .bad {
        color: #dc2626;
        font-weight: 700;
      }

      .good {
        color: #2563eb;
        font-weight: 700;
      }

      .current-version {
        color: #dc2626;
        font-weight: 600;
      }

      .target-version-dev {
        color: #7c3aed;
        font-weight: 700;
      }

      .target-version-agent {
        color: #2563eb;
        font-weight: 700;
      }

      .lts-stack {
        color: #059669;
        font-weight: 600;
        font-size: 0.8rem;
      }

      .modern-stack {
        color: #7c3aed;
        font-weight: 600;
        font-size: 0.8rem;
      }

      .status-cell {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        font-weight: 700;
        font-size: 0.85rem;
      }

      .status-badge.compatible {
        background: #dcfce7;
        color: #16a34a;
        border: 1px solid #86efac;
      }

      .status-badge.incompatible {
        background: #fee2e2;
        color: #dc2626;
        border: 1px solid #fca5a5;
      }

      .status-message {
        font-size: 0.8rem;
        color: var(--text);
        font-weight: 600;
        margin-top: 0.25rem;
      }

      .action-required {
        background: #fef3c7;
        border: 1px solid #fde047;
        color: #a16207;
        padding: 0.4rem 0.6rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
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

      .na {
        color: var(--text-muted);
        font-style: italic;
      }

      .detailed-reasoning-card {
        background: #f8fafc;
      }

      .reasoning-item {
        background: #ffffff;
        padding: 1rem;
        border-radius: 6px;
        border: 1px solid var(--border);
        margin-bottom: 1rem;
      }

      .reasoning-item:last-child {
        margin-bottom: 0;
      }

      .transition-stack {
        background: #eff6ff;
        border-left: 3px solid var(--primary);
        padding: 0.5rem 0.75rem;
        margin-bottom: 0.75rem;
        font-size: 0.85rem;
      }

      .rationale-text {
        color: var(--text);
        line-height: 1.6;
        margin-bottom: 0.75rem;
        font-size: 0.85rem;
      }

      .deprecated-section {
        background: #fef2f2;
        border: 1px solid #fca5a5;
        padding: 0.75rem;
        border-radius: 4px;
        font-size: 0.85rem;
      }

      .deprecated-section strong {
        color: #dc2626;
        display: block;
        margin-bottom: 0.5rem;
      }

      .deprecated-section ul {
        margin: 0;
        padding-left: 1.5rem;
        list-style: disc;
      }

      .deprecated-section li {
        margin-bottom: 0.25rem;
        color: var(--text);
      }

      .no-data {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--text-muted);
      }

      .no-data p {
        font-size: 1rem;
        margin: 0;
      }
    `,
  ],
})
export class ImpactAnalysisTabComponent {
  private readonly stateService = inject(AnalysisStateService);

  readonly data = this.stateService.data;

  readonly roadmap = computed(() => {
    return this.data()?.roadmap || [];
  });

  readonly compatibility = computed<CompatibilityData[] | null>(() => {
    const data = this.stateService.data();
    return data?.compatibility || null;
  });
}
