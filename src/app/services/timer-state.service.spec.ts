import { TestBed } from '@angular/core/testing';
import { TimerStateService } from './timer-state.service';
import { FirebaseService } from './firebase.service';
import { LoggerService } from './logger.service';

describe('TimerStateService', () => {
  let service: TimerStateService;
  let firebaseService: jasmine.SpyObj<FirebaseService>;
  let loggerService: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    const firebaseSpy = jasmine.createSpyObj('FirebaseService', ['getCurrentUser', 'getFirestore']);
    const loggerSpy = jasmine.createSpyObj('LoggerService', ['log', 'warn', 'error']);

    TestBed.configureTestingModule({
      providers: [
        TimerStateService,
        { provide: FirebaseService, useValue: firebaseSpy },
        { provide: LoggerService, useValue: loggerSpy },
      ],
    });

    service = TestBed.inject(TimerStateService);
    firebaseService = TestBed.inject(FirebaseService) as jasmine.SpyObj<FirebaseService>;
    loggerService = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isRunning state', () => {
    it('should initialize with isRunning as false', (done) => {
      service.isRunning$.subscribe((isRunning) => {
        expect(isRunning).toBe(false);
        done();
      });
    });

    it('should update isRunning state when setRunning is called', (done) => {
      service.setRunning(true);
      service.isRunning$.subscribe((isRunning) => {
        expect(isRunning).toBe(true);
        done();
      });
    });

    it('should emit new value to all subscribers', () => {
      const values: boolean[] = [];
      service.isRunning$.subscribe((val) => values.push(val));

      service.setRunning(true);
      service.setRunning(false);
      service.setRunning(true);

      expect(values).toEqual([false, true, false, true]);
    });
  });

  describe('state management', () => {
    it('should clear state', (done) => {
      service.clearState();
      service.state$.subscribe((state) => {
        expect(state).toBeNull();
        done();
      });
    });
  });

  describe('Firestore operations when user not signed in', () => {
    beforeEach(() => {
      firebaseService.getCurrentUser.and.returnValue(null);
    });

    it('should not save to Firestore when user is null', async () => {
      const state = {
        currentTime: 1500,
        isFocusTime: true,
        selectedCategoryId: 'work',
        sessionStartTime: new Date(),
        consecutiveSessionCount: 1,
        lastSessionWasBreak: false,
      };

      await service.saveToFirestore(state);
      expect(loggerService.warn).toHaveBeenCalledWith(
        'Cannot save timer state: user not authenticated'
      );
    });

    it('should return null when loading from Firestore without user', async () => {
      const result = await service.loadFromFirestore();
      expect(result).toBeNull();
    });

    it('should not clear Firestore when user is null', async () => {
      await service.clearFirestore();
      // Should complete without errors
      expect(firebaseService.getCurrentUser).toHaveBeenCalled();
    });
  });
});
