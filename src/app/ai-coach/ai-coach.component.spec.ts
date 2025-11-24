import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AiCoachComponent } from './ai-coach.component';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AiCoachComponent', () => {
  let component: AiCoachComponent;
  let fixture: ComponentFixture<AiCoachComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiCoachComponent, BrowserAnimationsModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AiCoachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display welcome message', () => {
    expect(component.messages.length).toBe(1);
    expect(component.messages[0].role).toBe('assistant');
    expect(component.messages[0].content).toContain('FocusGo AI Coach');
  });

  it('should add user message when sending', async () => {
    component.userInput = 'How was my week?';
    await component.sendMessage();

    const userMessages = component.messages.filter((m) => m.role === 'user');
    expect(userMessages.length).toBeGreaterThan(0);
    expect(userMessages[0].content).toBe('How was my week?');
  });

  it('should clear input after sending message', async () => {
    component.userInput = 'Test question';
    await component.sendMessage();

    expect(component.userInput).toBe('');
  });

  it('should not send empty messages', async () => {
    component.userInput = '   ';
    const initialLength = component.messages.length;
    await component.sendMessage();

    expect(component.messages.length).toBe(initialLength);
  });
});
