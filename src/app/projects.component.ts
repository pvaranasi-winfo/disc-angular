
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

  loadProjects() {
    this.http.get<any[]>('/api/projects').subscribe(data => this.projects = data);
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
    this.http.post('/api/projects', payload).subscribe({
      next: (res: any) => {
        this.projects.push(res);
        this.showCreateModal = false;
        this.isCreating = false;
      },
      error: () => {
        this.isCreating = false;
      }
    });
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
    this.http.delete(`/api/projects/${this.projectToDelete.id}`).subscribe({
      next: () => {
        this.projects = this.projects.filter(p => p.id !== this.projectToDelete.id);
        this.closeDeleteModal();
      },
      error: () => {
        this.closeDeleteModal();
      }
    });
  }
}
