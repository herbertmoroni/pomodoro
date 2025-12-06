import { Injectable } from '@angular/core';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { PomodoroSession, PomodoroSessionWithMetadata } from '../models';

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
  async getSessions(): Promise<PomodoroSessionWithMetadata[]> {
    const user = this.firebaseService.getCurrentUser();
    if (!user) {
      return [];
    }

    const db = this.firebaseService.getFirestore();
    const sessionsRef = collection(db, 'sessions');
    const q = query(sessionsRef, where('userId', '==', user.uid));

    const querySnapshot = await getDocs(q);
    const sessions: PomodoroSessionWithMetadata[] = [];

    querySnapshot.forEach((doc) => {
      sessions.push({
        id: doc.id,
        ...doc.data(),
      } as PomodoroSessionWithMetadata);
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
