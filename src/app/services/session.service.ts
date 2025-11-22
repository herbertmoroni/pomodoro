import { Injectable } from '@angular/core';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

export interface PomodoroSession {
  id: string;
  userId: string;
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

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor(private firebaseService: FirebaseService) {}

  // Save session to Firestore
  async saveSession(session: Omit<PomodoroSession, 'userId'>): Promise<void> {
    const user = this.firebaseService.getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to save sessions');
    }

    const db = this.firebaseService.getFirestore();
    const sessionsRef = collection(db, 'sessions');

    await addDoc(sessionsRef, {
      ...session,
      userId: user.uid,
      createdAt: Timestamp.now(),
    });
  }

  // Get user sessions from Firestore
  async getSessions(): Promise<PomodoroSession[]> {
    const user = this.firebaseService.getCurrentUser();
    if (!user) {
      return [];
    }

    const db = this.firebaseService.getFirestore();
    const sessionsRef = collection(db, 'sessions');
    const q = query(sessionsRef, where('userId', '==', user.uid));

    const querySnapshot = await getDocs(q);
    const sessions: PomodoroSession[] = [];

    querySnapshot.forEach((doc) => {
      sessions.push({
        id: doc.id,
        ...doc.data(),
      } as PomodoroSession);
    });

    return sessions;
  }

  // Increment break counter in Firestore
  async incrementBreakCounter(): Promise<void> {
    const user = this.firebaseService.getCurrentUser();
    if (!user) {
      return;
    }

  }
}
