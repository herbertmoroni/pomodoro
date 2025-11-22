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
import { MatChipsModule } from '@angular/material/chips';

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
  duration: number; // Planned duration in seconds
  actualDuration: number; // Actual time spent in seconds
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  completed: boolean; // true = finished, false = skipped
  dayOfWeek: number; // 0-6
  hourOfDay: number; // 0-23
  consecutiveSession: number; // Which pomodoro in a row
  followedBreak: boolean; // Did they take the break before this
}

interface PomodoroStats {
  totalBreaks: number;
  sessions: PomodoroSession[];
}

@Component({
  selector: 'app-root',
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
    MatChipsModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  // Timer duration constants (in minutes)
  private readonly FOCUS_DURATION_MINUTES = 25;
  private readonly BREAK_DURATION_MINUTES = 5;

  // Timer update interval (in milliseconds)
  private readonly TIMER_UPDATE_INTERVAL_MS = 100;

  // PWA window dimensions
  private readonly PWA_WINDOW_WIDTH = 700;
  private readonly PWA_WINDOW_HEIGHT = 500;

  // Calculated timer durations in seconds
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

  // Color constants
  readonly FOCUS_BACKDROP_COLOR = '#5393e7';
  readonly BREAK_BACKDROP_COLOR = '#C66';
  readonly FOCUS_SPINNER_COLOR = '#005cbb';
  readonly BREAK_SPINNER_COLOR = '#fcff7a';

  // Categories
  categories: Category[] = [
    { id: 'work', name: 'Work', color: '#22c55e', icon: 'label' },
    { id: 'study', name: 'Study', color: '#3b82f6', icon: 'label' },
    { id: 'personal', name: 'Personal', color: '#a855f7', icon: 'label' },
    { id: 'urgent', name: 'Urgent', color: '#ef4444', icon: 'label' },
    { id: 'exercise', name: 'Exercise', color: '#eab308', icon: 'label' },
    { id: 'none', name: 'Tag', color: '#6b7280', icon: 'label' },
  ];
  selectedCategory: Category;

  // Session tracking
  sessionStartTime: Date | null = null;
  consecutiveSessionCount: number = 0;
  lastSessionWasBreak: boolean = false;

  constructor(private titleService: Title) {
    this.originalTitle = this.titleService.getTitle();
    this.currentTime = this.focusTime;
    this.selectedCategory = this.categories[5]; // Default to 'No Category'
  }

  ngOnInit() {
    // Feature detection: window.matchMedia and window.resizeTo
    if (
      this.isFeatureSupported('matchMedia') &&
      window.matchMedia('(display-mode: standalone)').matches
    ) {
      if (this.isFeatureSupported('resizeTo')) {
        try {
          window.resizeTo(this.PWA_WINDOW_WIDTH, this.PWA_WINDOW_HEIGHT);
        } catch (error) {
          console.warn('Unable to resize window:', error);
        }
      }
    }

    this.updateDisplay();

    // Feature detection: Audio API
    if (this.isFeatureSupported('Audio')) {
      try {
        this.alarmSound = new Audio('mixkit-interface-hint-notification-911.wav');
        this.alarmSound.load();
      } catch (error) {
        console.error('Failed to load alarm sound:', error);
        // Create a dummy audio element to prevent errors when playAlarm is called
        this.alarmSound = new Audio();
      }
    } else {
      console.warn('Audio API not supported');
      // Create a dummy audio element
      this.alarmSound = { play: () => Promise.resolve() } as HTMLAudioElement;
    }

    // Feature detection: localStorage
    if (this.isLocalStorageAvailable()) {
      try {
        const savedAutoStart = localStorage.getItem('autoStart');
        this.autoStart = savedAutoStart === 'true';

        // Load saved category
        const savedCategoryId = localStorage.getItem('selectedCategory');
        if (savedCategoryId) {
          const category = this.categories.find((c) => c.id === savedCategoryId);
          if (category) {
            this.selectedCategory = category;
          }
        }
      } catch (error) {
        console.warn('Failed to load preferences from localStorage:', error);
        this.autoStart = false; // Default value
      }
    } else {
      console.warn('localStorage is not available');
      this.autoStart = false; // Default value
    }
  }

  /**
   * Check if a browser feature is supported
   */
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

  /**
   * Check if localStorage is available and accessible
   */
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
    // Save autoStart value to localStorage with error handling
    if (this.isLocalStorageAvailable()) {
      try {
        localStorage.setItem('autoStart', this.autoStart.toString());
      } catch (error) {
        console.error('Failed to save autoStart preference to localStorage:', error);
      }
    } else {
      console.warn('localStorage is not available, preference cannot be saved');
    }
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

    // Track focus session start
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
        console.warn('Failed to play alarm sound:', error);
        // Alarm playback failed (possibly due to browser autoplay policy)
      });
    }
  }

  reset() {
    // If resetting during a focus session, don't save it
    if (this.isFocusTime) {
      this.sessionStartTime = null;
    }

    this.stopTimer();
    this.currentTime = this.getTotalTime();
    this.updateDisplay();
    this.updatePageTitle();
  }

  skip() {
    // If skipping a focus session, save it as incomplete
    if (this.isFocusTime && this.sessionStartTime) {
      this.saveSession(false);
    }
    this.switchMode();
  }

  switchMode() {
    // Save completed focus session
    if (!this.isFocusTime && this.sessionStartTime) {
      this.saveSession(true);
    }

    // Track break completion
    if (!this.isFocusTime) {
      this.incrementBreakCounter();
      this.lastSessionWasBreak = true;
    }

    this.stopTimer();
    this.playAlarm(); // Always play the alarm
    this.isFocusTime = !this.isFocusTime;
    this.currentTime = this.getTotalTime();
    this.updateDisplay();
    if (this.autoStart) {
      this.startTimer();
    }
  }

  updateDisplay() {
    if (this.isFocusTime) {
      // For focus time, progress goes from 0 to 100 (clockwise)
      this.progress = 100 - (this.currentTime / this.getTotalTime()) * 100;
    } else {
      // For break time, progress goes from 100 to 0 (counterclockwise)
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

  selectCategory(category: Category) {
    this.selectedCategory = category;

    // Save to localStorage
    if (this.isLocalStorageAvailable()) {
      try {
        localStorage.setItem('selectedCategory', category.id);
      } catch (error) {
        console.error('Failed to save category preference to localStorage:', error);
      }
    }
  }

  // Session tracking methods
  private saveSession(completed: boolean) {
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

    this.saveSessionToLocalStorage(session);
    this.sessionStartTime = null;
  }

  private saveSessionToLocalStorage(session: PomodoroSession) {
    if (!this.isLocalStorageAvailable()) return;

    try {
      // Get existing sessions
      const existingData = localStorage.getItem('pomodoroStats');
      const stats: PomodoroStats = existingData
        ? JSON.parse(existingData)
        : { totalBreaks: 0, sessions: [] };

      // Add new session
      stats.sessions.push(session);

      // Keep only last 500 sessions to avoid storage limits
      if (stats.sessions.length > 500) {
        stats.sessions = stats.sessions.slice(-500);
      }

      // Save back to localStorage
      localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save session to localStorage:', error);
    }
  }

  private incrementBreakCounter() {
    if (!this.isLocalStorageAvailable()) return;

    try {
      const existingData = localStorage.getItem('pomodoroStats');
      const stats: PomodoroStats = existingData
        ? JSON.parse(existingData)
        : { totalBreaks: 0, sessions: [] };

      stats.totalBreaks++;
      localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to increment break counter:', error);
    }
  }
}
