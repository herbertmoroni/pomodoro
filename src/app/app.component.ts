import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription, timer } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatProgressSpinnerModule, MatIconModule, MatButtonModule, CommonModule, MatSlideToggleModule, FormsModule, MatTooltipModule],
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

  constructor(private titleService: Title) {
    this.originalTitle = this.titleService.getTitle();
    this.currentTime = this.focusTime;
  }

  ngOnInit() {
    // Feature detection: window.matchMedia and window.resizeTo
    if (this.isFeatureSupported('matchMedia') && window.matchMedia('(display-mode: standalone)').matches) {
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
      } catch (error) {
        console.warn('Failed to load autoStart preference from localStorage:', error);
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
        return typeof window !== 'undefined' && 'resizeTo' in window && typeof window.resizeTo === 'function';
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
    return { 'stroke': this.spinnerColor };
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
    this.startTime = Date.now() - ((this.getTotalTime() - this.currentTime) * 1000);
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
    this.stopTimer();
    this.currentTime = this.getTotalTime();
    this.updateDisplay();
    this.updatePageTitle();
  }

  skip() {
    this.switchMode();
  }

  switchMode() {
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
      this.progress = 100 - ((this.currentTime / this.getTotalTime()) * 100);
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
}