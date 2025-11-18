import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Title } from '@angular/platform-browser';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [Title]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  describe('Component Initialization', () => {
    it('should create the app', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with focus time', () => {
      expect(component.currentTime).toBe(25 * 60);
      expect(component.isFocusTime).toBe(true);
      expect(component.displayTime).toBe('25:00');
    });

    it('should render timer display', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const timerDisplay = compiled.querySelector('.timer-display');
      expect(timerDisplay?.textContent).toContain('25:00');
    });

    it('should render mode label', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const modeLabel = compiled.querySelector('.focus-label');
      expect(modeLabel?.textContent).toContain('FOCUS');
    });

    it('should load autoStart from localStorage', () => {
      localStorage.setItem('autoStart', 'true');
      const newFixture = TestBed.createComponent(AppComponent);
      const newComponent = newFixture.componentInstance;
      newComponent.ngOnInit();
      expect(newComponent.autoStart).toBe(true);
      localStorage.removeItem('autoStart');
    });
  });

  describe('Timer Controls', () => {
    it('should start timer when toggleTimer is called', () => {
      component.toggleTimer();
      expect(component.isRunning).toBe(true);
    });

    it('should pause timer when toggleTimer is called while running', () => {
      component.startTimer();
      expect(component.isRunning).toBe(true);
      component.toggleTimer();
      expect(component.isRunning).toBe(false);
    });

    it('should reset timer to current mode total time', () => {
      component.currentTime = 100;
      component.reset();
      expect(component.currentTime).toBe(component.getTotalTime());
      expect(component.isRunning).toBe(false);
    });

    it('should switch mode when skip is called', () => {
      spyOn(component, 'switchMode');
      component.skip();
      expect(component.switchMode).toHaveBeenCalled();
    });
  });

  describe('Mode Switching', () => {
    it('should switch from focus to break time', () => {
      component.isFocusTime = true;
      spyOn(component, 'playAlarm');
      component.switchMode();
      expect(component.isFocusTime).toBe(false);
      expect(component.currentTime).toBe(component.breakTime);
      expect(component.playAlarm).toHaveBeenCalled();
    });

    it('should switch from break to focus time', () => {
      component.isFocusTime = false;
      spyOn(component, 'playAlarm');
      component.switchMode();
      expect(component.isFocusTime).toBe(true);
      expect(component.currentTime).toBe(component.focusTime);
      expect(component.playAlarm).toHaveBeenCalled();
    });

    it('should auto-start timer after switch when autoStart is enabled', () => {
      component.autoStart = true;
      spyOn(component, 'startTimer');
      spyOn(component, 'playAlarm');
      component.switchMode();
      expect(component.startTimer).toHaveBeenCalled();
    });

    it('should not auto-start timer after switch when autoStart is disabled', () => {
      component.autoStart = false;
      spyOn(component, 'startTimer');
      spyOn(component, 'playAlarm');
      component.switchMode();
      expect(component.startTimer).not.toHaveBeenCalled();
    });
  });

  describe('Display Updates', () => {
    it('should format display time correctly', () => {
      component.currentTime = 125; // 2 minutes 5 seconds
      component.updateDisplay();
      expect(component.displayTime).toBe('02:05');
    });

    it('should calculate progress for focus time', () => {
      component.isFocusTime = true;
      component.currentTime = component.focusTime / 2;
      component.updateDisplay();
      expect(component.progress).toBe(50);
    });

    it('should calculate progress for break time', () => {
      component.isFocusTime = false;
      component.currentTime = component.breakTime / 2;
      component.updateDisplay();
      expect(component.progress).toBe(50);
    });
  });

  describe('Color Properties', () => {
    it('should return focus backdrop color when in focus mode', () => {
      component.isFocusTime = true;
      expect(component.backdropColor).toBe(component.FOCUS_BACKDROP_COLOR);
    });

    it('should return break backdrop color when in break mode', () => {
      component.isFocusTime = false;
      expect(component.backdropColor).toBe(component.BREAK_BACKDROP_COLOR);
    });

    it('should return focus spinner color when in focus mode', () => {
      component.isFocusTime = true;
      expect(component.spinnerColor).toBe(component.FOCUS_SPINNER_COLOR);
    });

    it('should return break spinner color when in break mode', () => {
      component.isFocusTime = false;
      expect(component.spinnerColor).toBe(component.BREAK_SPINNER_COLOR);
    });
  });

  describe('Auto-Start Toggle', () => {
    it('should save autoStart to localStorage when changed', () => {
      spyOn(localStorage, 'setItem');
      component.autoStart = true;
      component.onAutoStartChange();
      expect(localStorage.setItem).toHaveBeenCalledWith('autoStart', 'true');
    });
  });

  describe('Mode Labels', () => {
    it('should return FOCUS label when in focus mode', () => {
      component.isFocusTime = true;
      expect(component.modeLabel).toBe('FOCUS');
    });

    it('should return BREAK label when in break mode', () => {
      component.isFocusTime = false;
      expect(component.modeLabel).toBe('BREAK');
    });

    it('should return forward icon when in focus mode', () => {
      component.isFocusTime = true;
      expect(component.skipIcon).toBe('arrow_forward');
    });

    it('should return back icon when in break mode', () => {
      component.isFocusTime = false;
      expect(component.skipIcon).toBe('arrow_back');
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from timer on destroy', () => {
      component.startTimer();
      const subscription = component.timerSubscription;
      spyOn(subscription!, 'unsubscribe');
      component.ngOnDestroy();
      expect(subscription!.unsubscribe).toHaveBeenCalled();
    });
  });
});
