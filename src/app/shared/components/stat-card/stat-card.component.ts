import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatItem {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule],
  template: `
    <div class="card">
      <h3>{{ title() }}</h3>
      <div class="stat-list">
        @for (item of stats(); track item.label) {
          <div class="stat-item">
            <label>{{ item.label }}</label>
            <span>{{ item.value }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .stat-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-soft);
      }

      .stat-item label {
        font-weight: 500;
        color: var(--text-muted);
        font-size: 0.85rem;
      }

      .stat-item span {
        font-weight: 700;
        color: var(--primary);
        font-size: 0.95rem;
      }
    `,
  ],
})
export class StatCardComponent {
  readonly title = input.required<string>();
  readonly stats = input.required<StatItem[]>();
}
