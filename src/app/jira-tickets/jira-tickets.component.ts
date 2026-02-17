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

  getPriorityColor(priority: string | undefined | null): string {
    if (!priority) return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
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

  getPriorityBorderColor(priority: string | undefined | null): string {
    if (!priority) return 'border-slate-500';
    switch (priority.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'border-rose-500';
      case 'medium':
        return 'border-amber-500';
      case 'low':
        return 'border-emerald-500';
      default:
        return 'border-slate-500';
    }
  }

  getPriorityIcon(priority: string | undefined | null): string {
    if (!priority) return 'pi pi-circle';
    switch (priority.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'pi pi-exclamation-triangle'; // red warning
      case 'medium':
        return 'pi pi-info-circle'; // yellow info
      case 'low':
        return 'pi pi-check-circle'; // green check
      default:
        return 'pi pi-circle'; // default circle
    }
  }

  truncateDescription(description: string, maxLength: number = 150): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }
}