import { Component, Input } from '@angular/core';
import { Component as ComponentType } from '../dashboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detected-components',
  imports: [CommonModule],
  templateUrl: './detected-components.component.html',
  styleUrl: './detected-components.component.css'
})
export class DetectedComponentsComponent {
  @Input() components: ComponentType[] = [];

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
      case 'upgrade available':
        return 'text-amber-400 bg-amber-500/10 border border-amber-500/20';
      case 'critical':
        return 'text-rose-400 bg-rose-500/10 border border-rose-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border border-slate-500/20';
    }
  }

  getTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'database':
        return '🗃️';
      case 'application':
        return '⚡';
      case 'service':
        return '🔧';
      case 'api':
        return '🔌';
      default:
        return '📦';
    }
  }
}