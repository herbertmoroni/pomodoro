import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription, timer } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { FirebaseService } from '../services/firebase.service';
import { SessionService } from '../services/session.service';
import { CategoryService } from '../services/category.service';
import { LoggerService } from '../services/logger.service';
import { ManageCategoriesComponent } from '../manage-categories/manage-categories.component';
import {
  CategoryDialogComponent,
  CategoryDialogData,
} from '../category-dialog/category-dialog.component';
import { User } from 'firebase/auth';

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface PomodoroSession {
  id: string;
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

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    MatSlideToggleModule,
    FormsModule,
    MatTooltipModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDividerModule,
  ],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css',
})
export class TimerComponent implements OnInit, OnDestroy {
  private readonly FOCUS_DURATION_MINUTES = 25;
  private readonly BREAK_DURATION_MINUTES = 5;
  private readonly TIMER_UPDATE_INTERVAL_MS = 100;
  private readonly PWA_WINDOW_WIDTH = 700;
  private readonly PWA_WINDOW_HEIGHT = 500;

  focusTime = this.FOCUS_DURATION_MINUTES * 60;
  breakTime = this.BREAK_DURATION_MINUTES * 60;
  currentTime: number;
  progress = 0;
  displayTime = '25:00';
  isRunning = false;
  isFocusTime = true;
  timerSubscription: Subscription | null = null;
  alarmSound!: HTMLAudioElement;
  startTime: number = 0;
  originalTitle: string;
  autoStart: boolean = false;

  readonly FOCUS_BACKDROP_COLOR = '#5393e7';
  readonly BREAK_BACKDROP_COLOR = '#C66';
  readonly FOCUS_SPINNER_COLOR = '#005cbb';
  readonly BREAK_SPINNER_COLOR = '#fcff7a';

  categories: Category[] = [];
  noCategoryOption: Category = { id: 'none', name: '', color: '#6b7280', icon: 'label' };
  selectedCategory: Category;
  sessionStartTime: Date | null = null;
  consecutiveSessionCount: number = 0;
  lastSessionWasBreak: boolean = false;
  currentUser: User | null = null;
  private originalDisplayTime: string = '';

  constructor(
    private titleService: Title,
    private firebaseService: FirebaseService,
    private sessionService: SessionService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private logger: LoggerService
  ) {
    this.originalTitle = this.titleService.getTitle();
    this.currentTime = this.focusTime;
    this.selectedCategory = this.noCategoryOption;
  }

  ngOnInit() {
    this.firebaseService.user$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.loadUserCategories();
      } else {
        this.resetToDefaultCategories();
      }
    });

    if (
      this.isFeatureSupported('matchMedia') &&
      window.matchMedia('(display-mode: standalone)').matches
    ) {
      if (this.isFeatureSupported('resizeTo')) {
        try {
          window.resizeTo(this.PWA_WINDOW_WIDTH, this.PWA_WINDOW_HEIGHT);
        } catch (error) {
          this.logger.warn('Unable to resize window:', error);
        }
      }
    }

    this.updateDisplay();

    if (this.isFeatureSupported('Audio')) {
      try {
        this.alarmSound = new Audio('mixkit-interface-hint-notification-911.wav');
        this.alarmSound.load();
      } catch (error) {
        this.logger.error('Failed to load alarm sound:', error);
        this.alarmSound = new Audio();
      }
    } else {
      this.logger.warn('Audio API not supported');
      this.alarmSound = { play: () => Promise.resolve() } as HTMLAudioElement;
    }

    if (this.isLocalStorageAvailable()) {
      try {
        const savedAutoStart = localStorage.getItem('autoStart');
        this.autoStart = savedAutoStart === 'true';
        const savedCategoryId = localStorage.getItem('selectedCategory');
        if (savedCategoryId) {
          if (savedCategoryId === 'none') {
            this.selectedCategory = this.noCategoryOption;
          } else {
            const category = this.categories.find((c) => c.id === savedCategoryId);
            if (category) {
              this.selectedCategory = category;
            }
          }
        }
      } catch (error) {
        this.logger.warn('Failed to load preferences from localStorage:', error);
        this.autoStart = false;
      }
    } else {
      this.logger.warn('localStorage is not available');
      this.autoStart = false;
    }
  }

  private isFeatureSupported(feature: 'matchMedia' | 'resizeTo' | 'Audio'): boolean {
    switch (feature) {
      case 'matchMedia':
        return typeof window !== 'undefined' && 'matchMedia' in window;
      case 'resizeTo':
        return (
          typeof window !== 'undefined' &&
          'resizeTo' in window &&
          typeof window.resizeTo === 'function'
        );
      case 'Audio':
        return typeof window !== 'undefined' && 'Audio' in window;
      default:
        return false;
    }
  }

  private isLocalStorageAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  onAutoStartChange() {
    if (this.isLocalStorageAvailable()) {
      try {
        localStorage.setItem('autoStart', this.autoStart.toString());
      } catch (error) {
        this.logger.error('Failed to save autoStart preference to localStorage:', error);
      }
    } else {
      this.logger.warn('localStorage is not available, preference cannot be saved');
    }
  }

  get isTimerActive(): boolean {
    return (
      this.isRunning || this.currentTime !== (this.isFocusTime ? this.focusTime : this.breakTime)
    );
  }

  onTimeClick(inputElement: HTMLInputElement) {
    if (!this.isTimerActive) {
      this.originalDisplayTime = this.displayTime;
      setTimeout(() => inputElement.select(), 0);
    }
  }

  onTimeBlur() {
    if (this.isTimerActive) return;

    let minutes = 0;
    let seconds = 0;
    const input = this.displayTime.trim();

    if (!input) {
      this.displayTime = this.originalDisplayTime;
      return;
    }

    if (/^\d{1,3}$/.test(input)) {
      minutes = parseInt(input, 10);
      seconds = 0;
    } else if (/^(\d{1,3}):([0-5]\d)$/.test(input)) {
      const match = input.match(/^(\d{1,3}):([0-5]\d)$/);
      minutes = parseInt(match![1], 10);
      seconds = parseInt(match![2], 10);
    } else {
      this.displayTime = this.originalDisplayTime;
      return;
    }

    if (minutes < 1 || minutes > 120) {
      this.displayTime = this.originalDisplayTime;
      return;
    }

    const totalSeconds = minutes * 60 + seconds;

    if (this.isFocusTime) {
      this.focusTime = totalSeconds;
      this.currentTime = totalSeconds;
    } else {
      this.breakTime = totalSeconds;
      this.currentTime = totalSeconds;
    }

    this.displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (this.isFocusTime) {
      this.progress = 100 - (this.currentTime / this.getTotalTime()) * 100;
    } else {
      this.progress = (this.currentTime / this.getTotalTime()) * 100;
    }
  }

  onTimeEnter() {
    this.onTimeBlur();
  }

  ngOnDestroy() {
    this.stopTimer();
    this.titleService.setTitle(this.originalTitle);
  }

  get backdropColor(): string {
    return this.isFocusTime ? this.FOCUS_BACKDROP_COLOR : this.BREAK_BACKDROP_COLOR;
  }

  get spinnerColor(): string {
    return this.isFocusTime ? this.FOCUS_SPINNER_COLOR : this.BREAK_SPINNER_COLOR;
  }

  get spinnerStyle() {
    return { stroke: this.spinnerColor };
  }

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.isRunning = true;
    this.startTime = Date.now() - (this.getTotalTime() - this.currentTime) * 1000;

    if (this.isFocusTime && !this.sessionStartTime) {
      this.sessionStartTime = new Date();
      if (!this.lastSessionWasBreak) {
        this.consecutiveSessionCount++;
      } else {
        this.consecutiveSessionCount = 1;
        this.lastSessionWasBreak = false;
      }
    }

    this.timerSubscription = timer(0, this.TIMER_UPDATE_INTERVAL_MS).subscribe(() => {
      const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      this.currentTime = this.getTotalTime() - elapsedSeconds;
      this.updateDisplay();
      this.updatePageTitle();
      if (this.currentTime <= 0) {
        this.switchMode();
      }
    });
  }

  pauseTimer() {
    this.isRunning = false;
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.updatePageTitle();
  }

  stopTimer() {
    this.pauseTimer();
    this.timerSubscription = null;
  }

  playAlarm() {
    if (this.alarmSound) {
      this.alarmSound.play().catch((error) => {
        this.logger.warn('Failed to play alarm sound:', error);
      });
    }
  }

  reset() {
    if (this.isFocusTime) {
      this.sessionStartTime = null;
    }
    this.stopTimer();
    this.currentTime = this.getTotalTime();
    this.updateDisplay();
    this.updatePageTitle();
  }

  skip() {
    if (this.isFocusTime && this.sessionStartTime) {
      this.saveSession(false);
    }
    this.switchMode();
  }

  switchMode() {
    if (!this.isFocusTime && this.sessionStartTime) {
      this.saveSession(true);
    }
    this.stopTimer();
    this.playAlarm();
    this.isFocusTime = !this.isFocusTime;
    this.currentTime = this.getTotalTime();
    this.updateDisplay();
    if (this.autoStart) {
      this.startTimer();
    }
  }

  updateDisplay() {
    if (this.isFocusTime) {
      this.progress = 100 - (this.currentTime / this.getTotalTime()) * 100;
    } else {
      this.progress = (this.currentTime / this.getTotalTime()) * 100;
    }
    const minutes = Math.floor(this.currentTime / 60);
    const seconds = this.currentTime % 60;
    this.displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getTotalTime(): number {
    return this.isFocusTime ? this.focusTime : this.breakTime;
  }

  updatePageTitle() {
    if (this.isRunning || this.currentTime < this.getTotalTime()) {
      const mode = this.isFocusTime ? 'Focus' : 'Break';
      this.titleService.setTitle(`${this.displayTime} - ${mode} - Pomodoro Timer`);
    } else {
      this.titleService.setTitle(this.originalTitle);
    }
  }

  get modeLabel(): string {
    return this.isFocusTime ? 'FOCUS' : 'BREAK';
  }

  get skipIcon(): string {
    return this.isFocusTime ? 'arrow_forward' : 'arrow_back';
  }

  onCategoryClick() {
    if (!this.currentUser) {
      this.snackBar.open('Sign in to track sessions', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    }
  }

  selectCategory(category: Category) {
    if (this.selectedCategory.id === category.id) {
      this.selectedCategory = this.noCategoryOption;
    } else {
      this.selectedCategory = category;
    }

    if (this.isLocalStorageAvailable()) {
      try {
        localStorage.setItem('selectedCategory', this.selectedCategory.id);
      } catch (error) {
        this.logger.error('Failed to save category preference to localStorage:', error);
      }
    }
  }

  private async saveSession(completed: boolean) {
    if (!this.sessionStartTime) return;

    const endTime = new Date();
    const actualDuration = Math.floor((endTime.getTime() - this.sessionStartTime.getTime()) / 1000);

    const session: PomodoroSession = {
      id: `session_${this.sessionStartTime.getTime()}`,
      categoryId: this.selectedCategory.id,
      categoryName: this.selectedCategory.name,
      duration: this.focusTime,
      actualDuration: actualDuration,
      startTime: this.sessionStartTime.toISOString(),
      endTime: endTime.toISOString(),
      completed: completed,
      dayOfWeek: this.sessionStartTime.getDay(),
      hourOfDay: this.sessionStartTime.getHours(),
      consecutiveSession: this.consecutiveSessionCount,
      followedBreak: this.lastSessionWasBreak,
    };

    if (this.currentUser) {
      await this.saveSessionToFirestore(session);
    }

    this.sessionStartTime = null;
  }

  private async saveSessionToFirestore(session: PomodoroSession) {
    try {
      await this.sessionService.saveSession(session);
      this.snackBar.open('Session saved to cloud ☁️', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    } catch (error) {
      this.logger.error('Failed to save session to Firestore:', error);
      this.snackBar.open('Failed to save session to cloud', 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    }
  }

  openManageCategories() {
    this.dialog.open(ManageCategoriesComponent, {
      width: '600px',
      maxHeight: '80vh',
    });
  }

  async openAddCategory() {
    const dialogRef = this.dialog.open<CategoryDialogComponent, CategoryDialogData>(
      CategoryDialogComponent,
      {
        width: '500px',
        data: { mode: 'add' },
      }
    );

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          const order = await this.categoryService.getNextOrderNumber();
          await this.categoryService.addCategory(result.name, result.color, result.icon, order);
          this.snackBar.open('Category added', 'Close', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          });
        } catch (error) {
          this.logger.error('Failed to add category:', error);
          this.snackBar.open('Failed to add category', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          });
        }
      }
    });
  }

  private loadUserCategories() {
    this.categoryService.getUserCategories().subscribe(async (firestoreCategories) => {
      if (firestoreCategories.length > 0) {
        this.categories = firestoreCategories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
        }));

        if (this.selectedCategory.id !== 'none') {
          const stillExists = this.categories.find((cat) => cat.id === this.selectedCategory.id);
          if (!stillExists) {
            this.selectedCategory = this.noCategoryOption;
          }
        }
      } else {
        try {
          await this.categoryService.initializeDefaultCategories();
          this.snackBar.open('Default categories created', 'Close', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          });
        } catch (error) {
          this.logger.error('Failed to initialize default categories:', error);
          this.resetToDefaultCategories();
        }
      }
    });
  }

  private resetToDefaultCategories() {
    this.categories = [
      { id: 'work', name: 'Work', color: '#22c55e', icon: 'label' },
      { id: 'study', name: 'Study', color: '#3b82f6', icon: 'label' },
      { id: 'personal', name: 'Personal', color: '#a855f7', icon: 'label' },
      { id: 'urgent', name: 'Urgent', color: '#ef4444', icon: 'label' },
      { id: 'exercise', name: 'Exercise', color: '#eab308', icon: 'label' },
    ];
  }
}
