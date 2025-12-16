import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink, RouterOutlet, RouterLinkActive, Router } from '@angular/router';
import { FirebaseService } from './services/firebase.service';
import { LoggerService } from './services/logger.service';
import { TimerStateService } from './services/timer-state.service';
import { NotificationService } from './services/notification.service';
import { ChatService } from './services/chat.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;
  isTimerRunning = false;
  isAuthProcessing = false;

  constructor(
    private firebaseService: FirebaseService,
    private notification: NotificationService,
    private logger: LoggerService,
    private timerStateService: TimerStateService,
    private chatService: ChatService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.firebaseService.user$.subscribe((user) => {
      this.currentUser = user;
    });

    this.timerStateService.isRunning$.subscribe((isRunning) => {
      this.isTimerRunning = isRunning;
    });

    // Show loading state while signing in
    this.firebaseService.authProcessing$.subscribe((processing) => {
      this.isAuthProcessing = processing;
    });
  }

  async signIn() {
    try {
      const user = await this.firebaseService.signInWithGoogle();
      // Only show message for popup (desktop), redirect (mobile) will show after return
      if (user) {
        this.notification.success('Signed in successfully');
      }
    } catch (error) {
      this.logger.error('Sign in failed:', error);
      this.notification.error('Sign in failed. Please try again.');
    }
  }

  async signOut() {
    await this.firebaseService.signOut();
    this.notification.info('Signed out');
  }

  startNewChat() {
    // Navigate to coach route and trigger new chat
    this.chatService.clearCurrentChat();
    this.router.navigate(['/coach']);
    this.notification.info('Started new chat');
  }

  async clearChatHistory() {
    const confirmed = await this.showConfirmDialog(
      'Clear All Chat History',
      'This will delete all your AI Coach conversations. This action cannot be undone. Continue?'
    );

    if (confirmed) {
      this.chatService.clearCurrentChat();
      this.router.navigate(['/coach']);
      this.notification.info('Chat history cleared');
      // TODO: Implement actual deletion of all chats from Firestore
    }
  }

  private showConfirmDialog(title: string, message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const result = confirm(`${title}\n\n${message}`);
      resolve(result);
    });
  }
}
