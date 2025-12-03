import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { FirebaseService } from './firebase.service';
import { LoggerService } from './logger.service';

describe('ChatService', () => {
  let service: ChatService;
  let firebaseService: jasmine.SpyObj<FirebaseService>;
  let loggerService: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    const firebaseSpy = jasmine.createSpyObj('FirebaseService', ['getCurrentUser', 'getFirestore']);
    const loggerSpy = jasmine.createSpyObj('LoggerService', ['log', 'warn', 'error']);

    TestBed.configureTestingModule({
      providers: [
        ChatService,
        { provide: FirebaseService, useValue: firebaseSpy },
        { provide: LoggerService, useValue: loggerSpy },
      ],
    });

    service = TestBed.inject(ChatService);
    firebaseService = TestBed.inject(FirebaseService) as jasmine.SpyObj<FirebaseService>;
    loggerService = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Chat ID management', () => {
    it('should initialize with null chat ID', () => {
      expect(service.getCurrentChatId()).toBeNull();
    });

    it('should set and get current chat ID', () => {
      service.setCurrentChatId('test-chat-123');
      expect(service.getCurrentChatId()).toBe('test-chat-123');
    });

    it('should generate unique chat ID with timestamp', () => {
      const chatId = service.generateChatId();
      expect(chatId).toMatch(/^chat_\d+$/);
      expect(service.getCurrentChatId()).toBe(chatId);
    });

    it('should generate different IDs on consecutive calls', (done) => {
      const id1 = service.generateChatId();
      setTimeout(() => {
        const id2 = service.generateChatId();
        expect(id1).not.toBe(id2);
        done();
      }, 10);
    });

    it('should clear current chat ID', () => {
      service.setCurrentChatId('test-chat');
      service.clearCurrentChat();
      expect(service.getCurrentChatId()).toBeNull();
    });
  });

  describe('Firestore operations when user not signed in', () => {
    beforeEach(() => {
      firebaseService.getCurrentUser.and.returnValue(null);
    });

    it('should warn when trying to save message without user', async () => {
      const message = {
        role: 'user' as const,
        content: 'Hello',
        timestamp: new Date(),
      };

      await service.saveMessage('chat-123', message);
      expect(loggerService.warn).toHaveBeenCalledWith('Cannot save message: user not signed in');
    });

    it('should return empty array when loading chat history without user', async () => {
      const messages = await service.loadChatHistory('chat-123');
      expect(messages).toEqual([]);
    });

    it('should return empty array when getting recent chats without user', async () => {
      const chats = await service.getRecentChats();
      expect(chats).toEqual([]);
    });
  });
});
