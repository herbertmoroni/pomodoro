import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription, timer } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatProgressSpinnerModule,MatIconModule,MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  //spinnerColor: string = '#3f51b5'; 
  totalTime = 25 * 60; // 25 minutes in seconds
  currentTime = this.totalTime;
  progress = 0;
  displayTime = '25:00';
  isRunning = false;
  timerSubscription: Subscription | null = null;
  alarmSound!: HTMLAudioElement;
  startTime: number = 0;
  originalTitle: string;

  constructor(private titleService: Title) {
    this.originalTitle = this.titleService.getTitle();
  }

  ngOnInit() {
    this.updateDisplay();
    this.alarmSound = new Audio('mixkit-interface-hint-notification-911.wav');
  }

  ngOnDestroy() {
    this.pauseTimer();
    this.titleService.setTitle(this.originalTitle);
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
    this.startTime = Date.now() - ((this.totalTime - this.currentTime) * 1000);
    this.timerSubscription = timer(0, 100).subscribe(() => {
      const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      this.currentTime = this.totalTime - elapsedSeconds;
      this.updateDisplay();
      this.updatePageTitle();
      if (this.currentTime <= 0) {
        this.pauseTimer();
        this.playAlarm();
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

  playAlarm() {
    this.alarmSound.play();
  }

  reset() {
    this.pauseTimer();
    this.currentTime = this.totalTime;
    this.progress = 0;
    this.updateDisplay();
    this.updatePageTitle();
  }

  skip() {
     //Implement the skip method
  }

  updateDisplay() {
    this.progress = 100 - ((this.currentTime / this.totalTime) * 100);
    //this.spinnerColor = this.getColor(this.progress);
    const minutes = Math.floor(this.currentTime / 60);
    const seconds = this.currentTime % 60;
    this.displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
  }

  getColor(value: number): string {
    const hue = ((100 - value) * 1.2).toFixed(0); // Hue ranges from 120 (green) to 0 (red)
    return `hsl(${hue}, 100%, 50%)`;
  }

  updatePageTitle() {
    if (this.isRunning || this.currentTime < this.totalTime) {
      this.titleService.setTitle(`${this.displayTime} - Pomodoro Timer`);
    } else {
      this.titleService.setTitle(this.originalTitle);
    }
  }

}
