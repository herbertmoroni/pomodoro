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
import { AiChatService } from '../services/ai-chat.service';
import { LoggerService } from '../services/logger.service';
import { FirebaseService } from '../services/firebase.service';
import { SessionService } from '../services/session.service';
import { ChatService } from '../services/chat.service';
import { User } from 'firebase/auth';
import { ChatMessage, AiChatMessage } from '../models';

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
    private firebaseService: FirebaseService,
    private sessionService: SessionService,
    private chatService: ChatService
  ) {}

  async ngOnInit() {
    this.firebaseService.user$.subscribe(async (user) => {
      this.currentUser = user;

      if (!user) {
        // Not signed in - show welcome message
        this.messages = [
          {
            role: 'assistant',
            content:
              "👋 Welcome! To use the AI Coach, please sign in first. Click the 'Sign in' button in the top toolbar.",
            timestamp: new Date(),
          },
        ];
      } else if (!this.aiChatService.isAvailable()) {
        // AI not configured
        this.messages = [
          {
            role: 'assistant',
            content:
              '⚠️ AI features are not configured. To enable the AI Coach, please add your GitHub Personal Access Token to environment.local.ts. See the README for setup instructions.',
            timestamp: new Date(),
          },
        ];
      } else {
        // User signed in and AI available - load chat history
        await this.loadChatHistory();
      }
    });
  }

  private async loadChatHistory() {
    // Try to load existing chat
    let chatIdToLoad = this.chatService.getCurrentChatId();

    if (!chatIdToLoad) {
      // No current chat, try to load most recent
      const recentChats = await this.chatService.getRecentChats(1);
      if (recentChats.length > 0) {
        chatIdToLoad = recentChats[0];
        this.chatService.setCurrentChatId(chatIdToLoad);
      }
    }

    if (chatIdToLoad) {
      // Load messages from Firestore
      const previousMessages = await this.chatService.loadChatHistory(chatIdToLoad);
      if (previousMessages.length > 0) {
        this.messages = previousMessages;
        return;
      }
    }

    // No existing chat found, start new chat with welcome message
    this.chatService.generateChatId();
    this.messages = [
      {
        role: 'assistant',
        content:
          "Hi! I'm your FocusGo AI Coach. I can help you understand your productivity patterns, set goals, and improve your focus. Ask me anything like 'How can I be more productive?' or 'What are good Pomodoro techniques?'",
        timestamp: new Date(),
      },
    ];

    // Save welcome message
    const chatId = this.chatService.getCurrentChatId();
    if (chatId) {
      await this.chatService.saveMessage(chatId, this.messages[0]);
    }
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

      // Fetch user session data for context
      const sessionData = await this.getSessionContext();

      // Call AI service with session context
      const response = await this.aiChatService.sendMessage(
        question,
        conversationHistory,
        sessionData
      );

      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };
      this.messages.push(aiResponse);

      // Save both messages to Firestore
      const chatId = this.chatService.getCurrentChatId();
      if (chatId) {
        await this.chatService.saveMessage(chatId, userMessage);
        await this.chatService.saveMessage(chatId, aiResponse);
      }

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

  private async getSessionContext(): Promise<string | undefined> {
    if (!this.currentUser) {
      return undefined;
    }

    try {
      const sessions = await this.sessionService.getSessions();
      if (sessions.length === 0) {
        return undefined;
      }

      // Sort by start time descending (most recent first)
      sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

      // Get last 30 days of data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSessions = sessions.filter((s) => new Date(s.startTime) >= thirtyDaysAgo);

      // Calculate statistics
      const totalSessions = recentSessions.length;
      const completedSessions = recentSessions.filter((s) => s.completed).length;
      const totalFocusTime = recentSessions.reduce((sum, s) => sum + s.actualDuration, 0);
      const avgDuration = totalSessions > 0 ? totalFocusTime / totalSessions : 0;

      // Group by category
      const categoryStats: { [key: string]: { count: number; time: number } } = {};
      recentSessions.forEach((s) => {
        if (!categoryStats[s.categoryName]) {
          categoryStats[s.categoryName] = { count: 0, time: 0 };
        }
        categoryStats[s.categoryName].count++;
        categoryStats[s.categoryName].time += s.actualDuration;
      });

      // Group by day of week
      const dayStats: { [key: number]: number } = {};
      recentSessions.forEach((s) => {
        dayStats[s.dayOfWeek] = (dayStats[s.dayOfWeek] || 0) + 1;
      });

      // Group by hour of day
      const hourStats: { [key: number]: number } = {};
      recentSessions.forEach((s) => {
        hourStats[s.hourOfDay] = (hourStats[s.hourOfDay] || 0) + 1;
      });

      // Format as concise JSON
      const context = {
        summary: {
          totalSessions,
          completedSessions,
          completionRate:
            totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
          totalFocusMinutes: Math.round(totalFocusTime / 60),
          avgSessionMinutes: Math.round(avgDuration / 60),
        },
        categories: Object.entries(categoryStats).map(([name, stats]) => ({
          name,
          sessions: stats.count,
          minutes: Math.round(stats.time / 60),
        })),
        patterns: {
          mostProductiveDays: Object.entries(dayStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([day]) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(day)]),
          mostProductiveHours: Object.entries(hourStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([hour]) => `${hour}:00`),
        },
        recentSessions: recentSessions.slice(0, 10).map((s) => ({
          date: new Date(s.startTime).toLocaleDateString(),
          category: s.categoryName,
          minutes: Math.round(s.actualDuration / 60),
          completed: s.completed,
        })),
      };

      return JSON.stringify(context, null, 2);
    } catch (error) {
      this.logger.error('Error fetching session context:', error);
      return undefined;
    }
  }

  startNewChat(): void {
    // Clear current messages and start fresh
    this.chatService.clearCurrentChat();
    this.chatService.generateChatId();

    // Show welcome message for new chat
    this.messages = [
      {
        role: 'assistant',
        content:
          "Hi! I'm your FocusGo AI Coach. I can help you understand your productivity patterns, set goals, and improve your focus. Ask me anything like 'How can I be more productive?' or 'What are good Pomodoro techniques?'",
        timestamp: new Date(),
      },
    ];

    // Save welcome message
    const chatId = this.chatService.getCurrentChatId();
    if (chatId) {
      this.chatService.saveMessage(chatId, this.messages[0]);
    }
  }

  confirmClearHistory(): void {
    const confirmed = confirm(
      'Are you sure you want to clear all chat history? This cannot be undone.'
    );

    if (confirmed) {
      this.clearAllHistory();
    }
  }

  private async clearAllHistory(): Promise<void> {
    try {
      // This would require a new method in ChatService to delete all chats
      // For now, just start a new chat (full implementation would delete from Firestore)
      this.logger.log('Clearing all chat history');

      // Clear current chat and start fresh
      this.chatService.clearCurrentChat();
      this.startNewChat();

      // TODO: Implement actual deletion of all chats from Firestore
      // await this.chatService.deleteAllChats();
    } catch (error) {
      this.logger.error('Error clearing chat history:', error);
    }
  }
}
