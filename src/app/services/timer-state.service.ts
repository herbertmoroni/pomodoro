import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { doc, setDoc, getDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { LoggerService } from './logger.service';

export interface TimerState {
  currentTime: number;
  isFocusTime: boolean;
  selectedCategoryId: string;
  sessionStartTime: Date | null;
  consecutiveSessionCount: number;
  lastSessionWasBreak: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TimerStateService {
  private isRunningSubject = new BehaviorSubject<boolean>(false);
  public isRunning$: Observable<boolean> = this.isRunningSubject.asObservable();

  private stateSubject = new BehaviorSubject<TimerState | null>(null);
  public state$: Observable<TimerState | null> = this.stateSubject.asObservable();

  constructor(
    private firebaseService: FirebaseService,
    private logger: LoggerService
  ) {}

  setRunning(isRunning: boolean): void {
    this.isRunningSubject.next(isRunning);
  }

  setState(state: TimerState): void {
    this.stateSubject.next(state);
  }

  clearState(): void {
    this.stateSubject.next(null);
  }

  async saveToFirestore(state: TimerState): Promise<void> {
    const user = this.firebaseService.getCurrentUser();
    if (!user) {
      this.logger.warn('Cannot save timer state: user not authenticated');
      return;
    }

    try {
      const db = this.firebaseService.getFirestore();
      const stateRef = doc(db, `users/${user.uid}/timerState/current`);

      await setDoc(stateRef, {
        currentTime: state.currentTime,
        isFocusTime: state.isFocusTime,
        selectedCategoryId: state.selectedCategoryId,
        sessionStartTime: state.sessionStartTime ? Timestamp.fromDate(state.sessionStartTime) : null,
        consecutiveSessionCount: state.consecutiveSessionCount,
        lastSessionWasBreak: state.lastSessionWasBreak,
        lastUpdated: Timestamp.now(),
      });

      this.logger.log('Timer state saved to Firestore');
    } catch (error: any) {
      // Silently fail if permissions not set up yet
      if (error?.code === 'permission-denied') {
        this.logger.warn('Timer state not saved: Firestore permissions not configured');
      } else {
        this.logger.error('Failed to save timer state:', error);
      }
    }
  }

  async loadFromFirestore(): Promise<TimerState | null> {
    const user = this.firebaseService.getCurrentUser();
    if (!user) {
      return null;
    }

    try {
      const db = this.firebaseService.getFirestore();
      const stateRef = doc(db, `users/${user.uid}/timerState/current`);
      const docSnap = await getDoc(stateRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const state: TimerState = {
          currentTime: data['currentTime'],
          isFocusTime: data['isFocusTime'],
          selectedCategoryId: data['selectedCategoryId'],
          sessionStartTime: data['sessionStartTime'] ? data['sessionStartTime'].toDate() : null,
          consecutiveSessionCount: data['consecutiveSessionCount'],
          lastSessionWasBreak: data['lastSessionWasBreak'],
        };

        this.stateSubject.next(state);
        this.logger.log('Timer state loaded from Firestore');
        return state;
      }

      return null;
    } catch (error: any) {
      // Silently fail if permissions not set up yet
      if (error?.code === 'permission-denied') {
        this.logger.warn('Timer state not loaded: Firestore permissions not configured');
      } else {
        this.logger.error('Failed to load timer state:', error);
      }
      return null;
    }
  }

  async clearFirestore(): Promise<void> {
    const user = this.firebaseService.getCurrentUser();
    if (!user) {
      return;
    }

    try {
      const db = this.firebaseService.getFirestore();
      const stateRef = doc(db, `users/${user.uid}/timerState/current`);
      await deleteDoc(stateRef);
      
      this.clearState();
      this.logger.log('Timer state cleared from Firestore');
    } catch (error: any) {
      // Silently fail if permissions not set up yet or document doesn't exist
      if (error?.code === 'permission-denied') {
        this.logger.warn('Timer state not cleared: Firestore permissions not configured');
      } else if (error?.code !== 'not-found') {
        this.logger.error('Failed to clear timer state:', error);
      }
    }
  }
}
