import { Component, input, output, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { ChatMessage } from '../../../models/chat.model';

@Component({
  selector: 'app-chatbot-modal',
  imports: [CommonModule, FormsModule],
  template: `
    @if (isVisible()) {
      <div class="chat-overlay" (click)="onClose()">
        <div class="chat-container" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="chat-header">
            <div class="header-content">
              <div class="header-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3>AI Assistant</h3>
            </div>
            <button class="close-btn" (click)="onClose()" aria-label="Close chat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Messages Area -->
          <div class="chat-messages" #messagesContainer>
            @if (messages().length === 0) {
              <div class="welcome-message">
                <div class="welcome-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <h4>How can I help you?</h4>
                <p>Ask me anything about the system</p>
              </div>
            } @else {
              @for (message of messages(); track $index) {
                <div class="message-wrapper" [class.user]="message.role === 'user'" [class.assistant]="message.role === 'assistant'">
                  <div class="message">
                    <div class="message-avatar">
                      @if (message.role === 'user') {
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      } @else {
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 2l2 7h7l-5.5 4.5L18 21l-6-4.5L6 21l2.5-7.5L3 9h7z"></path>
                        </svg>
                      }
                    </div>
                    <div class="message-content">
                      <div class="message-text">{{ message.content }}</div>
                      <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                    </div>
                  </div>
                </div>
              }
            }
            @if (isLoading()) {
              <div class="message-wrapper assistant">
                <div class="message">
                  <div class="message-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2l2 7h7l-5.5 4.5L18 21l-6-4.5L6 21l2.5-7.5L3 9h7z"></path>
                    </svg>
                  </div>
                  <div class="message-content">
                    <div class="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Input Area -->
          <div class="chat-input-container">
            <form class="chat-input-form" (submit)="sendMessage($event)">
              <input
                type="text"
                class="chat-input"
                placeholder="Type your message..."
                [(ngModel)]="userInput"
                [disabled]="isLoading()"
                name="message"
                autocomplete="off"
              />
              <button
                type="submit"
                class="send-btn"
                [disabled]="!userInput.trim() || isLoading()"
                aria-label="Send message"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .chat-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .chat-container {
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.15);
        width: 90%;
        max-width: 600px;
        height: 80vh;
        max-height: 700px;
        display: flex;
        flex-direction: column;
        animation: slideIn 0.3s ease;
        overflow: hidden;
      }

      @keyframes slideIn {
        from {
          transform: translateY(-20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .chat-header {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .header-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .header-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .chat-header h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
      }

      .close-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 6px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.2s ease;
        color: white;
      }

      .close-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        background: #f8fafc;
      }

      .welcome-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        text-align: center;
        color: #64748b;
      }

      .welcome-icon {
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      .welcome-message h4 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #334155;
      }

      .welcome-message p {
        margin: 0;
        font-size: 0.875rem;
      }

      .message-wrapper {
        display: flex;
        margin-bottom: 0.5rem;
      }

      .message-wrapper.user {
        justify-content: flex-end;
      }

      .message-wrapper.assistant {
        justify-content: flex-start;
      }

      .message {
        display: flex;
        gap: 0.75rem;
        max-width: 80%;
      }

      .message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 0.25rem;
      }

      .message-wrapper.user .message-avatar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .message-wrapper.assistant .message-avatar {
        background: #e2e8f0;
        color: #475569;
      }

      .message-content {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .message-text {
        padding: 0.75rem 1rem;
        border-radius: 12px;
        line-height: 1.5;
        word-wrap: break-word;
        white-space: pre-wrap;
      }

      .message-wrapper.user .message-text {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-bottom-right-radius: 4px;
      }

      .message-wrapper.assistant .message-text {
        background: white;
        color: #1e293b;
        border: 1px solid #e2e8f0;
        border-bottom-left-radius: 4px;
      }

      .message-time {
        font-size: 0.75rem;
        color: #94a3b8;
        padding: 0 0.5rem;
      }

      .typing-indicator {
        display: flex;
        gap: 0.25rem;
        padding: 0.75rem 1rem;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        border-bottom-left-radius: 4px;
      }

      .typing-indicator span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #cbd5e1;
        animation: typing 1.4s infinite;
      }

      .typing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .typing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0%, 60%, 100% {
          transform: translateY(0);
        }
        30% {
          transform: translateY(-10px);
        }
      }

      .chat-input-container {
        padding: 1rem 1.5rem;
        border-top: 1px solid #e2e8f0;
        background: white;
      }

      .chat-input-form {
        display: flex;
        gap: 0.75rem;
      }

      .chat-input {
        flex: 1;
        padding: 0.75rem 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 0.875rem;
        outline: none;
        transition: border-color 0.2s ease;
      }

      .chat-input:focus {
        border-color: #667eea;
      }

      .chat-input:disabled {
        background: #f8fafc;
        cursor: not-allowed;
      }

      .send-btn {
        padding: 0.75rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.2s ease;
        min-width: 48px;
      }

      .send-btn:hover:not(:disabled) {
        opacity: 0.9;
      }

      .send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Scrollbar Styling */
      .chat-messages::-webkit-scrollbar {
        width: 6px;
      }

      .chat-messages::-webkit-scrollbar-track {
        background: #f1f5f9;
      }

      .chat-messages::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }

      .chat-messages::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    `,
  ],
})
export class ChatbotModalComponent {
  private readonly chatService = inject(ChatService);

  readonly isVisible = input<boolean>(false);
  readonly closed = output<void>();

  readonly messages = signal<ChatMessage[]>([]);
  readonly isLoading = signal<boolean>(false);
  
  userInput = '';
  private threadId = '';

  constructor() {
    // Initialize thread ID when component is created
    effect(() => {
      if (this.isVisible() && !this.threadId) {
        this.threadId = this.chatService.generateThreadId();
      }
    });
  }

  onClose(): void {
    this.closed.emit();
  }

  sendMessage(event: Event): void {
    event.preventDefault();
    
    const message = this.userInput.trim();
    if (!message || this.isLoading()) {
      return;
    }

    // Add user message to the chat
    this.messages.update((msgs) => [
      ...msgs,
      {
        role: 'user',
        content: message,
        timestamp: new Date(),
      },
    ]);

    this.userInput = '';
    this.isLoading.set(true);

    // Call the API
    this.chatService.sendMessage({ message, thread_id: this.threadId }).subscribe({
      next: (response) => {
        this.messages.update((msgs) => [
          ...msgs,
          {
            role: 'assistant',
            content: response.response,
            timestamp: new Date(),
          },
        ]);
        this.isLoading.set(false);
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Chat error:', error);
        this.messages.update((msgs) => [
          ...msgs,
          {
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date(),
          },
        ]);
        this.isLoading.set(false);
        this.scrollToBottom();
      },
    });

    this.scrollToBottom();
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  private scrollToBottom(): void {
    // Wait for DOM update
    setTimeout(() => {
      const messagesContainer = document.querySelector('.chat-messages');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }
}
