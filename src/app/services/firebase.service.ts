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
import { getFirestore } from 'firebase/firestore';
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
    console.log('[Firebase] Service initializing...');
    console.log('[Firebase] Current URL:', window.location.href);
    console.log('[Firebase] User Agent:', navigator.userAgent);
    
    // Initialize Firebase
    this.app = initializeApp(environment.firebase);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);

    console.log('[Firebase] Firebase initialized');

    // Set auth persistence to LOCAL (survives page reloads)
    setPersistence(this.auth, browserLocalPersistence)
      .then(() => {
        console.log('[Firebase] Persistence set to LOCAL');
      })
      .catch((error) => {
        console.error('[Firebase] Error setting auth persistence:', error);
      });

    // Listen to auth state changes - this handles both popup and redirect
    onAuthStateChanged(this.auth, (user) => {
      console.log('[Firebase] Auth state changed:', user ? user.email : 'No user');
      this.userSubject.next(user);
    });

    // Handle redirect result (runs once on page load after redirect)
    console.log('[Firebase] Checking for redirect result...');
    getRedirectResult(this.auth)
      .then((result) => {
        console.log('[Firebase] getRedirectResult completed');
        if (result) {
          // User signed in via redirect
          console.log('[Firebase] ✅ Redirect sign-in successful!', result.user.email);
        } else {
          console.log('[Firebase] No redirect result (normal page load)');
        }
      })
      .catch((error) => {
        console.log('[Firebase] getRedirectResult error:', error.code, error.message);
        // Only log if it's not the "missing initial state" error
        if (error.code !== 'auth/missing-initial-state') {
          console.error('[Firebase] ❌ Redirect error:', error.code, error.message);
        } else {
          console.warn('[Firebase] ⚠️ Missing initial state error - this happens on second redirect attempt');
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

  // Sign in with Google
  async signInWithGoogle(): Promise<User | null> {
    console.log('[Firebase] signInWithGoogle called');
    
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    // Detect mobile by user agent (not window size)
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    console.log('[Firebase] Is mobile device:', isMobileDevice);

    try {
      if (isMobileDevice) {
        // Mobile device: use redirect
        console.log('[Firebase] Using signInWithRedirect for mobile...');
        console.log('[Firebase] Session storage keys before redirect:', Object.keys(sessionStorage));
        await signInWithRedirect(this.auth, provider);
        console.log('[Firebase] signInWithRedirect completed (this may not log due to redirect)');
        return null;
      } else {
        // Desktop: use popup
        console.log('[Firebase] Using signInWithPopup for desktop...');
        const result = await signInWithPopup(this.auth, provider);
        console.log('[Firebase] Popup sign-in successful:', result.user.email);
        return result.user;
      }
    } catch (error: any) {
      console.error('[Firebase] ❌ Sign-in error:', error.code, error.message);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    await signOut(this.auth);
  }
}
