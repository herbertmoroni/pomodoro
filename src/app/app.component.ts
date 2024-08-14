import { Component, OnInit, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'pomodoro';

  timeLeft: number = 1500; // 25 minutes in seconds
  interval: any;
  progress: number = 0;

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.startTimer();
  }

  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.progress = ((1500 - this.timeLeft) / 1500) * 100;
        this.updateProgress(this.progress);
      } else {
        clearInterval(this.interval);
      }
    }, 1000);
  }

  updateProgress(progress: number) {
    this.renderer.setStyle(document.documentElement, '--progress', `${progress}%`);
  }

  get minutes(): string {
    return Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
  }

  get seconds(): string {
    return (this.timeLeft % 60).toString().padStart(2, '0');
  }
}
