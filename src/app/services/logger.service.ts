import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private isDevelopment = !environment.production;

  // Log informational messages (only in development)
  log(message: string, ...optionalParams: any[]): void {
    if (this.isDevelopment) {
      console.log(message, ...optionalParams);
    }
  }

  // Log warning messages (only in development)
  warn(message: string, ...optionalParams: any[]): void {
    if (this.isDevelopment) {
      console.warn(message, ...optionalParams);
    }
  }

  // Log error messages (always logged, even in production)
  error(message: string, ...optionalParams: any[]): void {
    console.error(message, ...optionalParams);
  }

  // Log error messages only in development
  errorDev(message: string, ...optionalParams: any[]): void {
    if (this.isDevelopment) {
      console.error(message, ...optionalParams);
    }
  }
}
