import { Component, Input } from '@angular/core';
import { GithubIssue } from '../dashboard.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-github-issues',
  imports: [CommonModule],
  templateUrl: './github-issues.component.html',
  styleUrl: './github-issues.component.css'
})
export class GithubIssuesComponent {
  @Input() issues: GithubIssue[] = [];

  constructor(private router: Router) {}

  getTagColor(tag: string): string {
    if(!tag) return 'bg-slate-500/20 text-slate-400'; // default for unknown tags
    switch (tag.toLowerCase()) {
      case 'infra':
        return 'bg-purple-500/20 text-purple-400';
      case 'bug':
        return 'bg-red-500/20 text-red-400';
      case 'feature':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  }

  getTagIcon(tag: string): string {
    if(!tag) return 'pi pi-tag'; // default icon for unknown tags
    switch (tag.toLowerCase()) {
      case 'bug':
        return 'pi pi-bug';
      case 'enhancement':
      case 'feature':
        return 'pi pi-star';
      case 'infra':
      case 'infrastructure':
        return 'pi pi-cog';
      case 'documentation':
      case 'docs':
        return 'pi pi-book';
      case 'security':
        return 'pi pi-lock';
      default:
        return 'pi pi-tag';
    }
  }

  truncateDescription(description: string, maxLength: number = 150): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }

  viewAllIssues() {
    this.router.navigate(['/github-issues-all'], { state: { issues: this.issues } });
  }
}