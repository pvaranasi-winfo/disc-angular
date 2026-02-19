
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
  showCreateModal = false;
  showDeleteModal = false;
  newProjectName = '';
  isCreating = false;
  projectToDelete: any = null;

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
    }, 500);
  }
}
