// Shared type definitions

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface CategoryWithMetadata extends Category {
  userId: string;
  order: number;
  createdAt: string;
}

export interface PomodoroSession {
  id: string;
  categoryId: string;
  categoryName: string;
  duration: number;
  actualDuration: number;
  startTime: string;
  endTime: string;
  completed: boolean;
  dayOfWeek: number;
  hourOfDay: number;
  consecutiveSession: number;
  followedBreak: boolean;
}

export interface PomodoroSessionWithMetadata extends PomodoroSession {
  userId: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Includes 'system' role for AI service communication
export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CategoryDialogData {
  category?: Category;
  mode: 'add' | 'edit';
}
