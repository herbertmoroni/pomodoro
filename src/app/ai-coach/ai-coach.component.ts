import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
  ],
  templateUrl: './ai-coach.component.html',
  styleUrl: './ai-coach.component.css',
})
export class AiCoachComponent {
  messages: ChatMessage[] = [];
  userInput = '';
  isLoading = false;

  constructor() {
    // Welcome message
    this.messages.push({
      role: 'assistant',
      content:
        "Hi! I'm your FocusGo AI Coach. I can help you understand your productivity patterns, set goals, and improve your focus. Ask me anything like 'How was my week?' or 'When am I most productive?'",
      timestamp: new Date(),
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
      // TODO: Call AI service here
      // For now, mock response
      await this.delay(1500);

      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: `You asked: "${question}"\n\nI'll analyze your productivity data and provide insights here. (AI service integration coming soon!)`,
        timestamp: new Date(),
      };
      this.messages.push(aiResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      this.messages.push({
        role: 'assistant',
        content:
          "Sorry, I encountered an error. Please try again or check your connection.",
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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
