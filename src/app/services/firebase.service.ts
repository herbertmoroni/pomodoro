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
    const log = (msg: string, data?: any) => {
      console.log(msg, data || '');
      const logs = JSON.parse(localStorage.getItem('firebase_debug_logs') || '[]');
      logs.push({ time: new Date().toISOString(), msg, data });
      localStorage.setItem('firebase_debug_logs', JSON.stringify(logs.slice(-20)));
    };

    log('[Firebase] Service initializing...');
    log('[Firebase] Current URL:', window.location.href);
    log('[Firebase] User Agent:', navigator.userAgent);
    
    // Initialize Firebase
    this.app = initializeApp(environment.firebase);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);

    log('[Firebase] Firebase initialized');

    // Set auth persistence to LOCAL (survives page reloads)
    setPersistence(this.auth, browserLocalPersistence)
      .then(() => {
        log('[Firebase] Persistence set to LOCAL');
      })
      .catch((error) => {
        log('[Firebase] Error setting auth persistence:', error.message);
      });

    // Listen to auth state changes - this handles both popup and redirect
    onAuthStateChanged(this.auth, (user) => {
      log('[Firebase] Auth state changed:', user ? user.email : 'No user');
      this.userSubject.next(user);
    });

    // Handle redirect result (runs once on page load after redirect)
    log('[Firebase] Checking for redirect result...');
    getRedirectResult(this.auth)
      .then((result) => {
        log('[Firebase] getRedirectResult completed');
        if (result) {
          // User signed in via redirect
          log('[Firebase] ✅ Redirect sign-in successful!', result.user.email);
          alert('Sign-in successful! Check console for: localStorage.getItem("firebase_debug_logs")');
        } else {
          log('[Firebase] No redirect result (normal page load)');
        }
      })
      .catch((error) => {
        log('[Firebase] getRedirectResult error:', `${error.code}: ${error.message}`);
        // Only log if it's not the "missing initial state" error
        if (error.code !== 'auth/missing-initial-state') {
          log('[Firebase] ❌ Redirect error:', `${error.code}: ${error.message}`);
          alert(`Redirect error: ${error.code} - Check console for: localStorage.getItem("firebase_debug_logs")`);
        } else {
          log('[Firebase] ⚠️ Missing initial state error');
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
    const log = (msg: string, data?: any) => {
      console.log(msg, data || '');
      const logs = JSON.parse(localStorage.getItem('firebase_debug_logs') || '[]');
      logs.push({ time: new Date().toISOString(), msg, data });
      localStorage.setItem('firebase_debug_logs', JSON.stringify(logs.slice(-20)));
    };

    log('[Firebase] signInWithGoogle called');
    
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    // Detect mobile by user agent (not window size)
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    log('[Firebase] Is mobile device:', isMobileDevice);

    try {
      if (isMobileDevice) {
        // Mobile device: use redirect
        log('[Firebase] Using signInWithRedirect for mobile...');
        log('[Firebase] Session storage keys:', Object.keys(sessionStorage).join(', '));
        await signInWithRedirect(this.auth, provider);
        log('[Firebase] signInWithRedirect completed (this may not log due to redirect)');
        return null;
      } else {
        // Desktop: use popup
        log('[Firebase] Using signInWithPopup for desktop...');
        const result = await signInWithPopup(this.auth, provider);
        log('[Firebase] Popup sign-in successful:', result.user.email);
        return result.user;
      }
    } catch (error: any) {
      log('[Firebase] ❌ Sign-in error:', `${error.code}: ${error.message}`);
      alert(`Sign-in error: ${error.code} - Check console for: localStorage.getItem("firebase_debug_logs")`);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    await signOut(this.auth);
  }
}
