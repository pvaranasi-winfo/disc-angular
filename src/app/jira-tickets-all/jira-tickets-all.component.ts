import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JiraTicket, DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-jira-tickets-all',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jira-tickets-all.component.html',
  styleUrl: './jira-tickets-all.component.css'
})
export class JiraTicketsAllComponent implements OnInit {
  tickets: JiraTicket[] = [];
  filteredTickets: JiraTicket[] = [];
  paginatedTickets: JiraTicket[] = [];
  searchTerm = '';
  selectedPriority = 'all';
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
    
    if (state && state['tickets']) {
      this.tickets = state['tickets'];
      this.loading = false;
      this.applyFilter();
    } else {
      // Fallback: load from service
      this.dashboardService.getDashboardData().subscribe({
        next: (data) => {
          this.tickets = data?.insights?.jiraTickets || [];
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

  getPriorityIcon(priority: string | undefined | null): string {
    if (!priority) return 'pi pi-circle';
    switch (priority.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'pi pi-exclamation-triangle';
      case 'medium':
        return 'pi pi-info-circle';
      case 'low':
        return 'pi pi-check-circle';
      default:
        return 'pi pi-circle';
    }
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredTickets = this.tickets.filter(ticket => {
      const matchesSearch = !term || 
        ticket.title.toLowerCase().includes(term) ||
        ticket.description.toLowerCase().includes(term) ||
        ticket.id.toLowerCase().includes(term);
      const matchesPriority = this.selectedPriority === 'all' || 
        ticket.priority?.toLowerCase() === this.selectedPriority.toLowerCase();
      return matchesSearch && matchesPriority;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredTickets.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTickets = this.filteredTickets.slice(startIndex, endIndex);
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
}
