import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { FirebaseService } from './services/firebase.service';
import { LoggerService } from './services/logger.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatMenuModule,
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private snackBar: MatSnackBar,
    private logger: LoggerService
  ) {}

  ngOnInit() {
    this.firebaseService.user$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  async signIn() {
    try {
      await this.firebaseService.signInWithGoogle();
      this.snackBar.open('Signed in successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    } catch (error) {
      this.logger.error('Sign in failed:', error);
      this.snackBar.open('Sign in failed. Please try again.', 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    }
  }

  async signOut() {
    await this.firebaseService.signOut();
    this.snackBar.open('Signed out', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
