import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { LoggerService } from './logger.service';
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  doc,
  setDoc,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { ChatMessage } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private currentChatId: string | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private logger: LoggerService
  ) {}

  getCurrentChatId(): string | null {
    return this.currentChatId;
  }

  setCurrentChatId(chatId: string): void {
    this.currentChatId = chatId;
  }

  generateChatId(): string {
    this.currentChatId = `chat_${Date.now()}`;
    return this.currentChatId;
  }

  async saveMessage(chatId: string, message: ChatMessage): Promise<void> {
    const user = this.firebaseService.getCurrentUser();
    if (!user) {
      this.logger.warn('Cannot save message: user not signed in');
      return;
    }

    try {
      const db = this.firebaseService.getFirestore();
      const messagesRef = collection(db, `users/${user.uid}/chats/${chatId}/messages`);

      await addDoc(messagesRef, {
        role: message.role,
        content: message.content,
        timestamp: Timestamp.fromDate(message.timestamp),
      });

      // Update chat metadata
      const chatDocRef = doc(db, `users/${user.uid}/chats`, chatId);
      await setDoc(
        chatDocRef,
        {
          lastMessageTime: Timestamp.fromDate(message.timestamp),
          lastMessagePreview: message.content.substring(0, 100),
        },
        { merge: true }
      );
    } catch (error: unknown) {
      if ((error as { code?: string })?.code === 'permission-denied') {
        this.logger.warn('Chat message not saved: Firestore permissions not configured');
      } else {
        this.logger.error('Failed to save message:', error);
      }
    }
  }

  async loadChatHistory(chatId: string): Promise<ChatMessage[]> {
    const user = this.firebaseService.getCurrentUser();
    if (!user) {
      return [];
    }

    try {
      const db = this.firebaseService.getFirestore();
      const messagesRef = collection(db, `users/${user.uid}/chats/${chatId}/messages`);
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const querySnapshot = await getDocs(q);
      const messages: ChatMessage[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          role: data['role'],
          content: data['content'],
          timestamp: data['timestamp'].toDate(),
        });
      });

      return messages;
    } catch (error: unknown) {
      if ((error as { code?: string })?.code === 'permission-denied') {
        this.logger.warn('Chat history not loaded: Firestore permissions not configured');
      } else {
        this.logger.error('Failed to load chat history:', error);
      }
      return [];
    }
  }

  async getRecentChats(limitCount: number = 5): Promise<string[]> {
    const user = this.firebaseService.getCurrentUser();
    if (!user) {
      return [];
    }

    try {
      const db = this.firebaseService.getFirestore();
      const chatsRef = collection(db, `users/${user.uid}/chats`);
      const q = query(chatsRef, orderBy('lastMessageTime', 'desc'), limit(limitCount));

      const querySnapshot = await getDocs(q);
      const chatIds: string[] = [];

      querySnapshot.forEach((doc) => {
        chatIds.push(doc.id);
      });

      return chatIds;
    } catch (error: unknown) {
      if ((error as { code?: string })?.code === 'permission-denied') {
        this.logger.warn('Recent chats not loaded: Firestore permissions not configured');
      } else {
        this.logger.error('Failed to get recent chats:', error);
      }
      return [];
    }
  }

  clearCurrentChat(): void {
    this.currentChatId = null;
  }
}
