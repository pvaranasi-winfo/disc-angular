import { Component, signal } from '@angular/core';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ChatbotModalComponent } from './shared/components/chatbot-modal/chatbot-modal.component';

@Component({
  selector: 'app-root',
  imports: [DashboardComponent, ChatbotModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly isChatOpen = signal<boolean>(false);

  toggleChat(): void {
    this.isChatOpen.update(value => !value);
  }

  closeChat(): void {
    this.isChatOpen.set(false);
  }
}
