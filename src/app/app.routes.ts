import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'coach',
    loadComponent: () => import('./ai-coach/ai-coach.component').then((m) => m.AiCoachComponent),
  },
];
