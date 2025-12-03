import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./timer/timer.component').then((m) => m.TimerComponent),
  },
  {
    path: 'coach',
    loadComponent: () => import('./ai-coach/ai-coach.component').then((m) => m.AiCoachComponent),
  },
];
