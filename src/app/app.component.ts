import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatProgressSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  timeLeft: number = 1500; // 25 minutes in seconds
  interval: any;
  progress: number = 0;

  ngOnInit(): void {
    this.startTimer();
  }

  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.progress = ((1500 - this.timeLeft) / 1500) * 100;
      } else {
        clearInterval(this.interval);
      }
    }, 1000);
  }

  get minutes(): string {
    return Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
  }

  get seconds(): string {
    return (this.timeLeft % 60).toString().padStart(2, '0');
  }
}
