import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  imports: [CommonModule],
  template: `
    @if (isVisible()) {
      <div class="modal-overlay" (click)="onCancel()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ title() }}</h3>
          </div>
          <div class="modal-body">
            <p>{{ message() }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" (click)="onCancel()">
              Cancel
            </button>
            <button class="btn btn-confirm" (click)="onConfirm()">
              Proceed
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .modal-content {
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.15);
        max-width: 500px;
        width: 90%;
        animation: slideIn 0.3s ease;
      }

      @keyframes slideIn {
        from {
          transform: translateY(-20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid var(--border);
      }

      .modal-header h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text);
      }

      .modal-body {
        padding: 1.5rem;
      }

      .modal-body p {
        margin: 0;
        color: var(--text-muted);
        line-height: 1.6;
      }

      .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--border);
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
      }

      .btn {
        padding: 0.625rem 1.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
      }

      .btn-cancel {
        background: #f8fafc;
        color: var(--text);
        border: 1px solid var(--border);
      }

      .btn-cancel:hover {
        background: #e2e8f0;
      }

      .btn-confirm {
        background: var(--primary);
        color: #ffffff;
      }

      .btn-confirm:hover {
        background: var(--primary-dark);
      }
    `,
  ],
})
export class ConfirmationModalComponent {
  readonly title = input<string>('Confirm Action');
  readonly message = input<string>('Are you sure you want to proceed?');
  readonly isVisible = input<boolean>(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
