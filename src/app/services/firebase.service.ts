import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private app;
  private auth;
  private db;
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  private authProcessingSubject = new BehaviorSubject<boolean>(false);
  public authProcessing$: Observable<boolean> = this.authProcessingSubject.asObservable();

  constructor() {
    // Initialize Firebase
    this.app = initializeApp(environment.firebase);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);

    // Enable Firestore offline persistence
    // This caches data locally and syncs when back online
    enableIndexedDbPersistence(this.db)
      .catch((error) => {
        if (error.code === 'failed-precondition') {
          console.warn('[Firebase] Multiple tabs open, persistence only enabled in one tab');
        } else if (error.code === 'unimplemented') {
          console.warn('[Firebase] Browser does not support offline persistence');
        }
      });

    // Set auth persistence to LOCAL (survives page reloads and redirects)
    setPersistence(this.auth, browserLocalPersistence)
      .catch((error) => {
        console.error('[Firebase] Error setting auth persistence:', error);
      });

    // Listen to auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });

    // Handle redirect result (runs once on page load after redirect)
    getRedirectResult(this.auth)
      .then((result) => {
        if (result) {
          // User successfully signed in via redirect
          console.log('[Firebase] Redirect sign-in successful:', result.user.email);
        }
      })
      .catch((error) => {
        // Ignore "missing initial state" error (happens on normal page loads)
        if (error.code !== 'auth/missing-initial-state') {
          console.error('[Firebase] Redirect error:', error);
        }
      });
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  // Get Firestore instance
  getFirestore() {
    return this.db;
  }

  // Sign in with Google (popup on desktop, redirect fallback on mobile)
  async signInWithGoogle(): Promise<User | null> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    // Detect mobile by user agent
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    try {
      // Try popup first (works on most modern mobile browsers)
      try {
        const result = await signInWithPopup(this.auth, provider);
        return result.user;
      } catch (popupError: any) {
        // If popup fails on mobile, fall back to redirect
        if (isMobileDevice && (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user')) {
          // Ensure persistence is set before redirect
          await setPersistence(this.auth, browserLocalPersistence);
          await signInWithRedirect(this.auth, provider);
          return null; // Will complete after redirect
        }
        throw popupError;
      }
    } catch (error: any) {
      console.error('[Firebase] Sign-in error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    await signOut(this.auth);
  }
}
