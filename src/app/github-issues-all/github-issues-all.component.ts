import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GithubIssue, DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-github-issues-all',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './github-issues-all.component.html',
  styleUrl: './github-issues-all.component.css'
})
export class GithubIssuesAllComponent implements OnInit {
  issues: GithubIssue[] = [];
  filteredIssues: GithubIssue[] = [];
  paginatedIssues: GithubIssue[] = [];
  searchTerm = '';
  selectedTag = 'all';
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
    
    if (state && state['issues']) {
      this.issues = state['issues'];
      this.loading = false;
      this.applyFilter();
    } else {
      // Fallback: load from service
      this.dashboardService.getDashboardData().subscribe({
        next: (data) => {
          this.issues = data?.insights?.github || [];
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

  getTagColor(tag: string): string {
    if(!tag) return 'bg-slate-500/20 text-slate-400';
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
    if(!tag) return 'pi pi-tag';
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

  applyFilter() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredIssues = this.issues.filter(issue => {
      const matchesSearch = !term || 
        issue.summary.toLowerCase().includes(term) ||
        (issue.description && issue.description.toLowerCase().includes(term)) ||
        issue.id.toString().includes(term);
      const matchesTag = this.selectedTag === 'all' || 
        issue.tag?.toLowerCase() === this.selectedTag.toLowerCase();
      return matchesSearch && matchesTag;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredIssues.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedIssues = this.filteredIssues.slice(startIndex, endIndex);
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

  getUniqueTags(): string[] {
    const tags = new Set(this.issues.map(issue => issue.tag).filter(tag => tag));
    return Array.from(tags).sort();
  }
}
