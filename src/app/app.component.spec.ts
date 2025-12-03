import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TimerStateService } from './services/timer-state.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    const timerStateSpy = jasmine.createSpyObj('TimerStateService', ['setRunning'], {
      isRunning$: of(false),
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), { provide: TimerStateService, useValue: timerStateSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the app', () => {
      expect(component).toBeTruthy();
    });

    it('should have toolbar with navigation buttons', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const toolbar = compiled.querySelector('mat-toolbar');
      expect(toolbar).toBeTruthy();
    });

    it('should render logo and title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logo = compiled.querySelector('.app-logo');
      const title = compiled.querySelector('.toolbar-title');
      expect(logo).toBeTruthy();
      expect(title?.textContent).toContain('FocusGo');
    });
  });

  describe('Navigation State', () => {
    it('should initialize with timer not running', () => {
      expect(component.isTimerRunning).toBe(false);
    });

    it('should disable AI Coach button when timer is running', () => {
      component.isTimerRunning = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const aiCoachButton = Array.from(compiled.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('AI Coach')
      );

      expect(aiCoachButton?.hasAttribute('disabled')).toBe(true);
    });

    it('should enable AI Coach button when timer is not running', () => {
      component.isTimerRunning = false;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const aiCoachButton = Array.from(compiled.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('AI Coach')
      );

      expect(aiCoachButton?.hasAttribute('disabled')).toBe(false);
    });
  });

  describe('User Authentication', () => {
    it('should show sign in button when no user', () => {
      component.currentUser = null;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const signInButton = Array.from(compiled.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('Sign in')
      );

      expect(signInButton).toBeTruthy();
    });
  });
});
