import { Component, Input } from '@angular/core';
import { DashboardData } from '../dashboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() data: DashboardData | null = null;
}