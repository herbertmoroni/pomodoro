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

  private redirectResultSubject = new BehaviorSubject<{ success: boolean; error?: any } | null>(null);
  public redirectResult$: Observable<{ success: boolean; error?: any } | null> = this.redirectResultSubject.asObservable();

  constructor() {
    // Initialize Firebase
    this.app = initializeApp(environment.firebase);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);

    // Check for redirect result on app load (for mobile sign-in)
    getRedirectResult(this.auth)
      .then((result) => {
        if (result) {
          // Successfully signed in after redirect
          console.log('Redirect sign-in successful:', result.user?.email);
          this.redirectResultSubject.next({ success: true });
        } else {
          console.log('No pending redirect sign-in');
        }
      })
      .catch((error) => {
        console.error('Redirect sign-in error:', error.code, error.message);
        this.redirectResultSubject.next({ success: false, error });
      });

    // Listen to auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
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
    
    // Add provider settings to improve reliability
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    // Detect if device is mobile
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 768;

    if (isMobile) {
      // Use redirect for mobile devices (popups often blocked)
      await signInWithRedirect(this.auth, provider);
      // For redirect, user will be available after page reload via onAuthStateChanged
      return null;
    } else {
      // Use popup for desktop devices
      const result = await signInWithPopup(this.auth, provider);
      return result.user;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    await signOut(this.auth);
  }
}
