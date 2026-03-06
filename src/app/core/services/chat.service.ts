import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatRequest, ChatResponse } from '../../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://winfotest-da-agent-chdcb5h0dngff0eu.centralindia-01.azurewebsites.net/errortriage/chat';

  sendMessage(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.apiUrl, request);
  }

  generateThreadId(): string {
    return `thread_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
