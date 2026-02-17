import { Component, Input } from '@angular/core';
import { JiraTicket } from '../dashboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-jira-tickets',
  imports: [CommonModule],
  templateUrl: './jira-tickets.component.html',
  styleUrl: './jira-tickets.component.css'
})
export class JiraTicketsComponent {
  @Input() tickets: JiraTicket[] = [];

  getPriorityColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'low':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'critical':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  }

  truncateDescription(description: string, maxLength: number = 150): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }
}