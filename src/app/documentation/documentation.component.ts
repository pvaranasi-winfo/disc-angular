import { Component, Input } from '@angular/core';
import { Documentation } from '../dashboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documentation',
  imports: [CommonModule],
  templateUrl: './documentation.component.html',
  styleUrl: './documentation.component.css'
})
export class DocumentationComponent {
  @Input() docs: Documentation[] = [];

  getFolderIcon(folderName: string): string {
    switch (folderName.toLowerCase()) {
      case 'upgrade':
      case 'upgrades':
        return '🔄';
      case 'troubleshooting':
        return '🔧';
      case 'installation':
      case 'install':
        return '⚙️';
      case 'configuration':
      case 'config':
        return '⚙️';
      case 'api':
        return '🔌';
      case 'security':
        return '🔒';
      case 'performance':
        return '📊';
      default:
        return '📁';
    }
  }

  getFolderColor(folderName: string): string {
    switch (folderName.toLowerCase()) {
      case 'upgrade':
      case 'upgrades':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'troubleshooting':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'installation':
      case 'install':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'configuration':
      case 'config':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'api':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'security':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'performance':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  }

  truncateDescription(description: string, maxLength: number = 100): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}