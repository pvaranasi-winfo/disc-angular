import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisStateService } from '../../../core/services/analysis-state.service';
import { CompatibilityData } from '../../../models/analysis-response.model';

@Component({
  selector: 'app-compatibility-tab',
  imports: [CommonModule],
  template: `
    <div class="compatibility-view">
      @if (compatibility() && compatibility()!.length > 0) {
        @for (compatSet of compatibility(); track compatSet.id) {
          <div class="compat-section">
            <h2>
              {{ compatSet.base_component }} 
              <span class="version-badge">v{{ compatSet.base_target_version }}</span>
            </h2>
            
            @if (compatSet.architectural_rationale && compatSet.architectural_rationale.length > 0) {
              <div class="card rationale-card">
                <h3>Architectural Rationale</h3>
                <ul class="rationale-list">
                  @for (rationale of compatSet.architectural_rationale; track $index) {
                    <li>{{ rationale }}</li>
                  }
                </ul>
              </div>
            }

            <div class="card">
              <h3>Compatibility Matrix</h3>
              <table class="compatibility-table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Current Version</th>
                    <th>Proposed Target</th>
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
                      <td><span class="target-version">{{ item.proposed_target }}</span></td>
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
                          @if (item.brief_rationale) {
                            <div class="brief-rationale">{{ item.brief_rationale }}</div>
                          }
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

            @if (compatSet.detailed_reasoning && compatSet.detailed_reasoning.length > 0) {
              <div class="card detailed-reasoning-card">
                <h3>Detailed Component Analysis</h3>
                @for (reasoning of compatSet.detailed_reasoning; track $index) {
                  <div class="reasoning-item">
                    <h4>{{ reasoning.component_name }}</h4>
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
    </div>
  `,
  styles: [
    `
      .compatibility-view {
        padding: 1rem 0;
      }

      .compat-section {
        margin-bottom: 3rem;
      }

      .compat-section:last-child {
        margin-bottom: 0;
      }

      .compat-section > h2 {
        margin: 0 0 1.5rem;
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text);
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .compat-section > h2::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 1.5rem;
        background: var(--primary);
        border-radius: 2px;
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

      .card h3 {
        margin: 0 0 1rem;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text);
      }

      .rationale-card {
        background: #eff6ff;
        border-color: #bfdbfe;
      }

      .rationale-list {
        margin: 0;
        padding-left: 1.5rem;
        list-style: disc;
      }

      .rationale-list li {
        margin-bottom: 0.75rem;
        color: var(--text);
        line-height: 1.6;
      }

      .compatibility-table {
        width: 100%;
        border-collapse: collapse;
      }

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

      .compatibility-table td {
        padding: 0.75rem 0.5rem;
        border-bottom: 1px solid var(--border-soft);
        font-size: 0.85rem;
        vertical-align: top;
      }

      .compatibility-table tr.incompatible {
        background: #fef2f2;
      }

      .current-version {
        color: #dc2626;
        font-weight: 600;
      }

      .target-version {
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

      .brief-rationale {
        font-size: 0.75rem;
        color: var(--text-muted);
        font-style: italic;
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

      .reasoning-item h4 {
        margin: 0 0 0.75rem;
        font-size: 1rem;
        font-weight: 700;
        color: var(--primary);
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
export class CompatibilityTabComponent {
  private readonly stateService = inject(AnalysisStateService);

  readonly compatibility = computed<CompatibilityData[] | null>(() => {
    const data = this.stateService.data();
    return data?.compatibility || null;
  });
}
