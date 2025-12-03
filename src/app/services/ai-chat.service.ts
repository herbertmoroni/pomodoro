import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AiChatService {
  private readonly apiUrl = environment.github.modelsApiUrl;
  private readonly modelName = environment.github.modelName;
  private readonly apiToken = environment.github.pat;

  constructor(private logger: LoggerService) {}

  async sendMessage(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    sessionData?: string
  ): Promise<ChatResponse> {
    if (!this.apiToken) {
      this.logger.warn('GitHub PAT not configured. AI features are disabled.');
      return {
        message: 'AI features are not configured. Please add your GitHub PAT to environment.local.ts',
        error: 'NO_API_TOKEN',
      };
    }

    try {
      const systemPrompt = this.getSystemPrompt(sessionData);
      
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ];

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiToken}`,
        },
        body: JSON.stringify({
          messages: messages,
          model: this.modelName,
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('AI API error:', response.status, errorText);
        
        if (response.status === 401) {
          return {
            message: 'Invalid GitHub token. Please check your environment.local.ts configuration.',
            error: 'INVALID_TOKEN',
          };
        }
        
        return {
          message: `AI service error: ${response.status}. Please try again.`,
          error: 'API_ERROR',
        };
      }

      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content;

      if (!aiMessage) {
        this.logger.error('Invalid AI response format:', data);
        return {
          message: 'Received invalid response from AI service.',
          error: 'INVALID_RESPONSE',
        };
      }

      return { message: aiMessage };
    } catch (error) {
      this.logger.error('Failed to send message to AI:', error);
      return {
        message: 'Failed to connect to AI service. Please check your internet connection.',
        error: 'NETWORK_ERROR',
      };
    }
  }

  private getSystemPrompt(sessionData?: string): string {
    let prompt = `You are an AI Productivity Coach for FocusGo, a Pomodoro timer app.

Your role is to:
- Help users understand their focus patterns and productivity habits
- Provide personalized insights based on their Pomodoro session data
- Offer actionable suggestions to improve their focus and time management
- Be encouraging, supportive, and constructive
- Answer questions about productivity techniques and best practices

Guidelines:
- Keep responses concise and actionable (2-4 paragraphs max)
- Use the user's actual data when available to provide specific insights
- Be empathetic and understanding about productivity challenges
- Avoid being judgmental or overly critical
- If you don't have enough data, acknowledge that and provide general advice`;

    if (sessionData) {
      prompt += `\n\nUSER'S PRODUCTIVITY DATA (Last 30 days):\n${sessionData}\n\nUse this data to provide personalized insights when relevant. Reference specific numbers and patterns from their data.`;
    } else {
      prompt += `\n\nNote: No session data available yet. The user may be new or hasn't completed any Pomodoro sessions. Provide general productivity advice.`;
    }

    return prompt;
  }

  isAvailable(): boolean {
    return !!this.apiToken;
  }
}
