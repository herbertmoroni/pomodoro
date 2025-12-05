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
    // Initialize Firebase
    this.app = initializeApp(environment.firebase);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);

    // Set auth persistence to LOCAL (survives page reloads)
    setPersistence(this.auth, browserLocalPersistence).catch((error) => {
      console.error('Error setting auth persistence:', error);
    });

    // Listen to auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });

    // Check for redirect result (this runs on EVERY page load)
    getRedirectResult(this.auth).catch((error) => {
      console.error('Redirect error:', error.code, error.message);
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
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    // Detect mobile by user agent (not window size)
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    try {
      if (isMobileDevice) {
        // Mobile device: use redirect
        await signInWithRedirect(this.auth, provider);
        return null;
      } else {
        // Desktop: use popup
        const result = await signInWithPopup(this.auth, provider);
        return result.user;
      }
    } catch (error: any) {
      console.error('Sign-in error:', error.code, error.message);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    await signOut(this.auth);
  }
}
