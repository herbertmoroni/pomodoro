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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatProgressSpinnerModule, MatIconModule, MatButtonModule, CommonModule, MatSlideToggleModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  focusTime = 25 * 60; // 25 minutes in seconds
  breakTime = 5 * 60; // 5 minutes in seconds
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
    if (window.matchMedia('(display-mode: standalone)').matches) {
      window.resizeTo(600, 400); // Width: 600px, Height: 400px
    }

    this.updateDisplay();
    this.alarmSound = new Audio('mixkit-interface-hint-notification-911.wav');

    // Load autoStart value from localStorage
    const savedAutoStart = localStorage.getItem('autoStart');
    this.autoStart = savedAutoStart === 'true';
  }

  onAutoStartChange() {
    // Save autoStart value to localStorage
    localStorage.setItem('autoStart', this.autoStart.toString());
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
    this.timerSubscription = timer(0, 100).subscribe(() => {
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
    this.alarmSound.play();
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