import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProgressSpinnerMode, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { interval, Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatProgressSpinnerModule,MatIconModule,MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  color: string = 'primary';
  totalTime = 25 * 60; // 25 minutes in seconds
  currentTime = this.totalTime;
  progress = 100;
  displayTime = '25:00';
  isRunning = false;
  timerSubscription: Subscription | null = null;

  ngOnInit() {
    this.updateDisplay();
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
    this.timerSubscription = interval(1000).subscribe(() => {
      this.currentTime--;
      this.progress = (this.currentTime / this.totalTime) * 100;
      this.updateDisplay();
      if (this.currentTime <= 0) {
        this.pauseTimer();
      }
    });
  }

  pauseTimer() {
    this.isRunning = false;
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  reset() {
    this.pauseTimer();
    this.currentTime = this.totalTime;
    this.progress = 100;
    this.updateDisplay();
  }

  skip() {
    // Implement skip functionality
  }

  updateDisplay() {
    this.progress = (this.currentTime / this.totalTime) * 100;
    this.color = this.progress > 50 ? 'primary' : 'warn';
    const minutes = Math.floor(this.currentTime / 60);
    const seconds = this.currentTime % 60;
    this.displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

}
