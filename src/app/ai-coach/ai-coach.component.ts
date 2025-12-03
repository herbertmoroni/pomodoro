import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TextFieldModule } from '@angular/cdk/text-field';
import { AiChatService, ChatMessage as AiChatMessage } from '../services/ai-chat.service';
import { LoggerService } from '../services/logger.service';
import { FirebaseService } from '../services/firebase.service';
import { User } from 'firebase/auth';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-coach',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TextFieldModule,
  ],
  templateUrl: './ai-coach.component.html',
  styleUrl: './ai-coach.component.css',
})
export class AiCoachComponent implements OnInit {
  messages: ChatMessage[] = [];
  userInput = '';
  isLoading = false;
  currentUser: User | null = null;

  constructor(
    private aiChatService: AiChatService,
    private logger: LoggerService,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit() {
    this.firebaseService.user$.subscribe((user) => {
      this.currentUser = user;
      
      // Clear messages and show appropriate welcome
      this.messages = [];
      
      if (!user) {
        this.messages.push({
          role: 'assistant',
          content:
            "👋 Welcome! To use the AI Coach, please sign in first. Click the 'Sign in' button in the top toolbar.",
          timestamp: new Date(),
        });
      } else if (!this.aiChatService.isAvailable()) {
        this.messages.push({
          role: 'assistant',
          content:
            "⚠️ AI features are not configured. To enable the AI Coach, please add your GitHub Personal Access Token to environment.local.ts. See the README for setup instructions.",
          timestamp: new Date(),
        });
      } else {
        this.messages.push({
          role: 'assistant',
          content:
            "Hi! I'm your FocusGo AI Coach. I can help you understand your productivity patterns, set goals, and improve your focus. Ask me anything like 'How can I be more productive?' or 'What are good Pomodoro techniques?'",
          timestamp: new Date(),
        });
      }
    });
  }

  async sendMessage(): Promise<void> {
    if (!this.userInput.trim() || this.isLoading) {
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: this.userInput,
      timestamp: new Date(),
    };
    this.messages.push(userMessage);

    // Clear input
    const question = this.userInput;
    this.userInput = '';
    this.isLoading = true;

    try {
      // Convert message history to AI service format
      const conversationHistory: AiChatMessage[] = this.messages
        .slice(1, -1) // Skip welcome message and current user message
        .map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        }));

      // Call AI service
      const response = await this.aiChatService.sendMessage(question, conversationHistory);

      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };
      this.messages.push(aiResponse);

      if (response.error) {
        this.logger.warn('AI service returned error:', response.error);
      }
    } catch (error) {
      this.logger.error('Error sending message to AI:', error);
      this.messages.push({
        role: 'assistant',
        content: 'Sorry, I encountered an unexpected error. Please try again.',
        timestamp: new Date(),
      });
    } finally {
      this.isLoading = false;
    }
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
