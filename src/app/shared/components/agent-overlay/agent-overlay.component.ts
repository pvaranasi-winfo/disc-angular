import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentService } from '../../../core/services/agent.service';
import { AgentLog, AgentProgress } from '../../../models/agent-log.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-agent-overlay',
  imports: [CommonModule],
  template: `
    @if (isVisible()) {
      <div class="agent-overlay-container">
        <div class="card agent-card">
          <div class="agent-header">
            <div class="agent-icon">🤖</div>
            <div class="agent-title">
              <h3>Discovery Agent Active</h3>
              <p id="agent-status">{{ currentStatus() }}</p>
            </div>
          </div>
          <div class="log-container">
            @for (log of logs(); track $index) {
              <div class="log-entry {{ log.type }}">{{ log.msg }}</div>
            }
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" [style.width.%]="progress()"></div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .agent-overlay-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(8px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        animation: fadeIn 0.3s ease;
      }

      .agent-card {
        max-width: 700px;
        width: 100%;
        background: var(--agent-glass);
        backdrop-filter: blur(10px);
        border: 1px solid var(--primary);
        margin: 0;
      }

      .agent-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .agent-icon {
        font-size: 2.5rem;
        animation: pulse 2s infinite;
      }

      .agent-title h3 {
        margin-bottom: 0.25rem;
        border: none;
        padding: 0 !important;
      }

      .agent-title p {
        font-size: 0.85rem;
        color: var(--primary);
        font-weight: 600;
        margin: 0;
      }

      .log-container {
        background: #0f172a;
        color: #38bdf8;
        padding: 1rem;
        border-radius: 6px;
        font-family: 'Courier New', Courier, monospace;
        font-size: 0.8rem;
        min-height: 150px;
        max-height: 250px;
        overflow-y: auto;
        margin-bottom: 1rem;
        border: 1px solid #334155;
        text-align: left;
      }

      .log-entry {
        margin-bottom: 0.5rem;
        opacity: 0;
        animation: fadeInLog 0.3s forwards;
        white-space: pre-wrap;
      }

      .log-entry.system {
        color: #94a3b8;
      }

      .log-entry.success {
        color: #4ade80;
      }

      .log-entry.warning {
        color: #fbbf24;
      }

      .progress-bar-container {
        height: 6px;
        background: #e2e8f0;
        border-radius: 3px;
        overflow: hidden;
      }

      .progress-bar {
        height: 100%;
        background: var(--primary);
        transition: width 0.3s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.8;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes fadeInLog {
        from {
          opacity: 0;
          transform: translateY(5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class AgentOverlayComponent implements OnInit, OnDestroy {
  private readonly agentService = inject(AgentService);
  private readonly destroy$ = new Subject<void>();

  readonly isVisible = signal<boolean>(false);
  readonly logs = signal<Array<{ msg: string; type: string }>>([]);
  readonly progress = signal<number>(0);
  readonly currentStatus = signal<string>('Initializing deep scan...');

  ngOnInit(): void {
    this.agentService.logs$.pipe(takeUntil(this.destroy$)).subscribe((log: AgentLog) => {
      if (log.msg) {
        this.logs.update((current) => [...current, { msg: log.msg, type: log.type }]);
      } else {
        // Reset logs
        this.logs.set([]);
      }
    });

    this.agentService.progress$
      .pipe(takeUntil(this.destroy$))
      .subscribe((progressData: AgentProgress) => {
        this.progress.set(progressData.percentage);
        this.currentStatus.set(progressData.status);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  show(): void {
    this.isVisible.set(true);
    this.logs.set([]);
    this.progress.set(0);
  }

  hide(): void {
    this.isVisible.set(false);
  }
}
