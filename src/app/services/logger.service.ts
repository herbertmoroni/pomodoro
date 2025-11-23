import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private isDevelopment = !environment.production;

  // Log informational messages (only in development)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(message: string, ...optionalParams: any[]): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(message, ...optionalParams);
    }
  }

  // Log warning messages (only in development)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message: string, ...optionalParams: any[]): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(message, ...optionalParams);
    }
  }

  // Log error messages (always logged, even in production)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(message: string, ...optionalParams: any[]): void {
    // eslint-disable-next-line no-console
    console.error(message, ...optionalParams);
  }

  // Log error messages only in development
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errorDev(message: string, ...optionalParams: any[]): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.error(message, ...optionalParams);
    }
  }
}
