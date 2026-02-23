
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrl: './header/header.component.css'
})
export class ProjectsComponent {
  projects: any[] = [];
  filteredProjects: any[] = [];
  paginatedProjects: any[] = [];
  showCreateModal = false;
  showDeleteModal = false;
  newProjectName = '';
  isCreating = false;
  projectToDelete: any = null;
  
  // Pagination properties
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  pageSizeOptions = [5, 10, 20, 50];
  
  // Filter properties
  searchTerm = '';
  
  // Make Math available in template
  Math = Math;

  constructor(private http: HttpClient, private router: Router) {
    this.loadProjects();
  }

  private loadProjects() {
    // Directly assign dummy data
    this.projects = [
      { id: 'proj-1', projectName: 'Demo Project Alpha', createdDate: new Date('2026-02-01T10:00:00Z') },
      { id: 'proj-2', projectName: 'Demo Project Beta', createdDate: new Date('2026-02-10T14:30:00Z') },
      { id: 'proj-3', projectName: 'Demo Project Gamma', createdDate: new Date('2026-02-15T09:15:00Z') },
      { id: 'proj-4', projectName: 'WinfoTest Internal', createdDate: new Date('2026-01-20T08:45:00Z') },
        { id: 'proj-5', projectName: 'Customer Portal', createdDate: new Date('2025-12-11T16:10:00Z') },
        { id: 'proj-6', projectName: 'Analytics Suite', createdDate: new Date('2026-02-18T11:22:00Z') },
        { id: 'proj-7', projectName: 'Legacy Migration', createdDate: new Date('2025-11-05T09:00:00Z') },
        { id: 'proj-8', projectName: 'CloudOps Automation', createdDate: new Date('2026-02-10T13:00:00Z') },
        { id: 'proj-9', projectName: 'Mobile App Redesign', createdDate: new Date('2026-01-30T10:30:00Z') },
        { id: 'proj-10', projectName: 'AI Research', createdDate: new Date('2026-02-17T15:00:00Z') }
      ];
    this.applyFilter();
    }

  openCreateProjectModal() {
    this.newProjectName = '';
    this.showCreateModal = true;
  }
  closeCreateProjectModal() {
    this.showCreateModal = false;
  }
  createProject() {
    if (!this.newProjectName.trim()) return;
    this.isCreating = true;
    const payload = {
      projectName: this.newProjectName.trim(),
      createdDate: new Date().toISOString()
    };
    // Dummy service
    setTimeout(() => {
      this.projects.push({ ...payload, id: 'proj-' + Math.floor(Math.random() * 10000) });
      this.showCreateModal = false;
      this.isCreating = false;
      this.applyFilter();
    }, 500);
  }

  viewDashboard(project: any) {
    this.router.navigate(['/dashboard'], { state: { projectId: project.id } });
  }

  confirmDeleteProject(project: any) {
    this.projectToDelete = project;
    this.showDeleteModal = true;
  }
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.projectToDelete = null;
  }
  deleteProject() {
    if (!this.projectToDelete) return;
    // Dummy service
    setTimeout(() => {
      this.projects = this.projects.filter(p => p.id !== this.projectToDelete.id);
      this.closeDeleteModal();
      this.applyFilter();
    }, 500);
  }

  // Filter and Pagination Methods
  applyFilter() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredProjects = this.projects.filter(project =>
      project.projectName.toLowerCase().includes(term)
    );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredProjects.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedProjects = this.filteredProjects.slice(startIndex, endIndex);
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
