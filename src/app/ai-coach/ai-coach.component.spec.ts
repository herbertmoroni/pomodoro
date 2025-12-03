import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AiCoachComponent } from './ai-coach.component';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FirebaseService } from '../services/firebase.service';
import { ChatService } from '../services/chat.service';
import { SessionService } from '../services/session.service';
import { AiChatService } from '../services/ai-chat.service';
import { of } from 'rxjs';

describe('AiCoachComponent', () => {
  let component: AiCoachComponent;
  let fixture: ComponentFixture<AiCoachComponent>;

  beforeEach(async () => {
    const firebaseSpy = jasmine.createSpyObj('FirebaseService', ['getCurrentUser'], {
      user$: of(null),
    });
    const chatSpy = jasmine.createSpyObj('ChatService', [
      'getCurrentChatId',
      'setCurrentChatId',
      'generateChatId',
      'saveMessage',
      'loadChatHistory',
      'getRecentChats',
    ]);
    const sessionSpy = jasmine.createSpyObj('SessionService', ['getSessions']);
    const aiChatSpy = jasmine.createSpyObj('AiChatService', ['isAvailable', 'sendMessage']);

    chatSpy.getCurrentChatId.and.returnValue(null);
    chatSpy.getRecentChats.and.returnValue(Promise.resolve([]));
    chatSpy.generateChatId.and.returnValue('chat_123');
    sessionSpy.getSessions.and.returnValue(Promise.resolve([]));
    aiChatSpy.isAvailable.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [AiCoachComponent, BrowserAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: FirebaseService, useValue: firebaseSpy },
        { provide: ChatService, useValue: chatSpy },
        { provide: SessionService, useValue: sessionSpy },
        { provide: AiChatService, useValue: aiChatSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AiCoachComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display sign-in message when user is not authenticated', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(component.messages.length).toBe(1);
    expect(component.messages[0].role).toBe('assistant');
    expect(component.messages[0].content).toContain('sign in first');
  }));

  it('should not send empty messages', async () => {
    component.userInput = '   ';
    const initialLength = component.messages.length;
    await component.sendMessage();

    expect(component.messages.length).toBe(initialLength);
  });

  it('should not send messages when loading', async () => {
    component.isLoading = true;
    component.userInput = 'Test';
    const initialLength = component.messages.length;

    await component.sendMessage();

    expect(component.messages.length).toBe(initialLength);
  });
});
