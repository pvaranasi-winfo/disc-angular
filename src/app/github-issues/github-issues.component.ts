import { Component, Input } from '@angular/core';
import { GithubIssue } from '../dashboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-github-issues',
  imports: [CommonModule],
  templateUrl: './github-issues.component.html',
  styleUrl: './github-issues.component.css'
})
export class GithubIssuesComponent {
  @Input() issues: GithubIssue[] = [];

  getTagColor(tag: string): string {
    switch (tag.toLowerCase()) {
      case 'bug':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'enhancement':
      case 'feature':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'infra':
      case 'infrastructure':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'documentation':
      case 'docs':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'security':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  }

  getTagIcon(tag: string): string {
    switch (tag.toLowerCase()) {
      case 'bug':
        return '🐛';
      case 'enhancement':
      case 'feature':
        return '✨';
      case 'infra':
      case 'infrastructure':
        return '🏗️';
      case 'documentation':
      case 'docs':
        return '📚';
      case 'security':
        return '🔒';
      default:
        return '🏷️';
    }
  }

  truncateDescription(description: string, maxLength: number = 150): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }
}