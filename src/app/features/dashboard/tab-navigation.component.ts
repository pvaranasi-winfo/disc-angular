import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Tab {
  id: string;
  num: string;
  name: string;
  enabled: boolean;
}

@Component({
  selector: 'app-tab-navigation',
  imports: [CommonModule],
  template: `
    <nav class="chevron-nav">
      @for (tab of tabs(); track tab.id) {
        <div
          class="step"
          [class.active]="tab.id === activeTabId()"
          [class.disabled]="!tab.enabled"
          [attr.data-step]="tab.id"
          (click)="onTabClick(tab)"
        >
          <span class="step-num">{{ tab.num }}</span>
          <span class="step-name">{{ tab.name }}</span>
        </div>
      }
    </nav>
  `,
  styles: [
    `
      .chevron-nav {
        display: flex;
        margin-bottom: 2rem;
        background: #ffffff;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
      }

      .step {
        flex: 1;
        padding: 0.75rem 1rem;
        display: flex;
        flex-direction: row;
        gap: 0.75rem;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        z-index: 1;
        background: #ffffff;
        color: var(--secondary);
      }

      .step.disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .step:not(:last-child)::after {
        content: '';
        position: absolute;
        right: -10px;
        top: 0;
        width: 20px;
        height: 100%;
        background: inherit;
        clip-path: polygon(0 0, 100% 50%, 0 100%);
        z-index: 2;
        border-left: 1px solid var(--border);
      }

      .step.active {
        background: var(--primary);
        color: #ffffff;
      }

      .step.active .step-num {
        color: #ffffff;
        opacity: 0.9;
      }

      .step-num {
        font-size: 0.75rem;
        font-weight: 800;
        color: var(--primary);
      }

      .step.active .step-num {
        color: #ffffff;
      }

      .step-name {
        font-size: 0.9rem;
        font-weight: 600;
      }
    `,
  ],
})
export class TabNavigationComponent {
  readonly tabs = input.required<Tab[]>();
  readonly activeTabId = input.required<string>();
  readonly tabChange = output<string>();

  onTabClick(tab: Tab): void {
    if (tab.enabled) {
      this.tabChange.emit(tab.id);
    }
  }
}
