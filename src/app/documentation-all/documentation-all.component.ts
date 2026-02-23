import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Documentation, DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-documentation-all',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documentation-all.component.html',
  styleUrl: './documentation-all.component.css'
})
export class DocumentationAllComponent implements OnInit {
  docs: Documentation[] = [];
  filteredDocs: Documentation[] = [];
  paginatedDocs: Documentation[] = [];
  searchTerm = '';
  selectedFolder = 'all';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  pageSizeOptions = [10, 20, 50];
  Math = Math;
  loading = true;

  constructor(
    private router: Router,
    private location: Location,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;
    
    if (state && state['docs']) {
      this.docs = state['docs'];
      this.loading = false;
      this.applyFilter();
    } else {
      // Fallback: load from service
      this.dashboardService.getDashboardData().subscribe({
        next: (data) => {
          this.docs = data?.insights?.docs || [];
          this.loading = false;
          this.applyFilter();
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  goBack() {
    this.location.back();
  }

  getFolderIcon(folderName: string): string {
    if(!folderName) return '📁';
    switch (folderName.toLowerCase()) {
      case 'upgrade':
      case 'upgrades':
        return 'pi pi-refresh';
      case 'troubleshooting':
        return 'pi pi-wrench';
      case 'installation':
      case 'install':
        return 'pi pi-cog';
      case 'configuration':
      case 'config':
        return 'pi pi-cog';
      case 'api':
        return 'pi pi-plug';
      case 'security':
        return 'pi pi-lock';
      case 'performance':
        return '📊';
      default:
        return '📁';
    }
  }

  getFolderColor(folderName: string): string {
    if(!folderName) return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
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

  applyFilter() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredDocs = this.docs.filter(doc => {
      const matchesSearch = !term || 
        doc.title.toLowerCase().includes(term) ||
        (doc.Description && doc.Description.toLowerCase().includes(term)) ||
        (doc.Foldername && doc.Foldername.toLowerCase().includes(term));
      const matchesFolder = this.selectedFolder === 'all' || 
        doc.Foldername?.toLowerCase() === this.selectedFolder.toLowerCase();
      return matchesSearch && matchesFolder;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredDocs.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedDocs = this.filteredDocs.slice(startIndex, endIndex);
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getUniqueFolders(): string[] {
    const folders = new Set(this.docs.map(doc => doc.Foldername).filter(folder => folder));
    return Array.from(folders).sort();
  }
}
