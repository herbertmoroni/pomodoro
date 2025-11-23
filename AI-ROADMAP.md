# AI Integration Roadmap

This document outlines the vision and strategy for AI-powered productivity coaching in FocusGo. It captures the **what** and **why** of our AI features, not the implementation details.

## Vision

Transform FocusGo from a simple timer into an **intelligent productivity coach** that:
- Learns your unique work patterns through natural conversation
- Remembers context across weeks and months of interactions
- Provides personalized insights based on your actual session data
- Helps you experiment with new approaches and measures results
- Acts as a supportive guide, not a judgmental metrics dashboard

Think of it as **having a productivity expert who knows your work style, remembers your goals, and helps you continuously improve** - all through simple conversation.

## Core Principles

1. **Conversational First**: No forms, surveys, or complex setup. Learn everything through natural chat interactions. Ask "How was my week?" and get meaningful insights immediately.

2. **Privacy Focused**: User owns and controls all data and memory. No data sold, no training on user data without consent, no dark patterns. Can export or delete everything anytime.

3. **Transparent**: Users can see everything the AI knows about them. The "memory" is viewable, editable, and understandable. No black box.

4. **Experimental**: Track changes and measure what works. The AI helps you run personal productivity experiments with before/after analysis.

5. **Supportive Coach, Not Judge**: Celebrates progress, helps with struggles, asks questions rather than lecturing. Recognizes that life happens and productivity isn't always linear.

6. **Free to Use, Free to Share**: Built as a learning tool and shared freely with others. Designed to scale affordably so it stays accessible.

---

## Data Architecture

Our data architecture is designed to enable intelligent coaching while keeping costs low and respecting user privacy. It combines three layers of context:

### Layer 1: Session Tracking (✅ Implemented)

Every Pomodoro session captures rich metadata optimized for AI analysis:

```typescript
interface PomodoroSession {
  id: string;
  categoryId: string;           // Tag/category (Work, Study, Personal)
  categoryName: string;          // Name preserved even if renamed later
  duration: number;              // Planned duration (seconds)
  actualDuration: number;        // Actual time spent
  startTime: string;             // ISO timestamp
  endTime: string;               // ISO timestamp
  completed: boolean;            // Finished naturally vs skipped/abandoned
  dayOfWeek: number;            // 0-6 for weekly pattern detection
  hourOfDay: number;            // 0-23 for daily pattern detection
  consecutiveSession: number;    // Session count in current streak
  followedBreak: boolean;        // Whether user took a break before this
}
```

**Storage**: Firestore (`users/{userId}/sessions/{sessionId}`)

#### Why This Structure?

This isn't just time tracking - it's **pattern recognition data** that enables AI to detect:

**Timing Patterns**
- "You complete 90% of Study sessions between 9-11 AM"
- "Tuesday mornings show your highest completion rates for Work tasks"
- "Your focus quality drops significantly after 8 PM"

**Fatigue & Recovery**
- "You skip 60% of sessions after the 4th consecutive pomodoro without a break"
- "Taking 15-minute breaks increases your next session completion rate by 25%"
- "You maintain better focus when sessions are spread throughout the day vs. batched"

**Category Insights**
- "Work sessions average 85% completion but Writing sessions only 60% - what's different?"
- "You're spending 70% of your focus time on Work - consider more balance"
- "Deep Work category has your best completion rate - schedule more of these"

**Behavioral Anomalies**
- "You've skipped 8 sessions today - unusual for you. Need to talk about what's blocking focus?"
- "Your session count dropped 60% this week compared to your usual pattern"

### Layer 2: Semantic Memory (🔄 Planned)

Rather than storing every word of every conversation (expensive, slow), we extract and store **semantic insights** - the meaningful context AI needs to be helpful.

```typescript
interface UserMemory {
  userId: string;
  createdAt: string;
  lastUpdated: string;
  
  // User context learned through conversation
  profile: {
    profession?: string;           // "software developer", "writer", "student"
    workContext?: string;          // "remote", "office", "hybrid", "freelance"
    timezone: string;              // Auto-detected from browser
    goals?: string[];              // Natural language: "improve morning focus"
    preferences?: string[];        // "prefers 25min sessions", "needs quiet"
  };
  
  // Active experiments user is trying
  experiments: Experiment[];
  
  // Key insights AI has shared
  insights: AIInsight[];
  
  // Important conversation topics
  conversationContext: ConversationMemory[];
}

interface Experiment {
  id: string;
  startDate: string;
  description: string;            // "Trying early morning deep work blocks"
  hypothesis: string;             // "Should improve afternoon energy levels"
  status: 'active' | 'completed' | 'abandoned';
  endDate?: string;
  results?: string;               // AI's analysis after completion
  userFeedback?: string;          // "It helped but hard to maintain"
}

interface AIInsight {
  id: string;
  date: string;
  category: 'pattern' | 'recommendation' | 'achievement' | 'warning';
  insight: string;                // "You're most productive Tue-Thu mornings"
  acknowledged: boolean;          // User saw it
  actedUpon?: boolean;           // User tried the recommendation
}

interface ConversationMemory {
  date: string;
  topic: string;                  // "work-life balance", "burnout concerns"
  summary: string;                // "User feeling overwhelmed by deadlines"
  importance: 'high' | 'medium' | 'low';
  relatedGoal?: string;          // Link to goal if relevant
}
```

**Storage**: Firestore (`users/{userId}/memory`)

#### Why Semantic Memory Instead of Full Chat History?

**Token Efficiency**: Instead of sending 50 previous messages (3000+ tokens) to AI, send compressed memory (300 tokens)

**Example:**
```
❌ Without semantic memory (sending full chat):
"User: I'm struggling with focus in afternoons"
"AI: Try working in the mornings..."
"User: I'll try that"
"User (week later): How's my focus?"
"AI: Let me check your data..."
[AI must re-read entire conversation to understand context]

✅ With semantic memory:
memory.experiments = [{
  description: "Early morning deep work",
  startDate: "2025-11-10",
  status: "active"
}]
[AI immediately knows user is trying morning work, can analyze progress]
```

**Better Long-term Context**: AI can reference goals set months ago without reading thousands of messages

**Cost Effective**: Lower token usage = cheaper per user = easier to keep free/affordable

**Privacy Friendly**: Stores insights, not verbatim conversations

#### How Memory Gets Updated

After each conversation, a hidden AI call extracts semantic insights:

```
User conversation: "I'm a software developer working remotely. 
                    I want to improve my morning focus."

Memory extraction (hidden from user):
→ profile.profession = "software developer"
→ profile.workContext = "remote"
→ goals.push("improve morning focus")
→ conversationContext.push({
    topic: "morning productivity",
    summary: "User wants to improve morning focus",
    importance: "high"
  })
```

This happens automatically, users don't see the extraction step.

### Layer 3: Chat History (🔄 Planned)

Full conversation threads are stored for user review and recent context:

```typescript
interface ChatThread {
  id: string;
  userId: string;
  title: string;                 // Auto-generated or user-edited
  startDate: string;
  lastMessageDate: string;
  messageCount: number;
}

interface ChatMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}
```

**Storage**: Firestore (`users/{userId}/chats/{chatId}/messages/{messageId}`)

#### Why Store Full Chat History?

**User Benefit**:
- Review past conversations ("What did the AI suggest last month?")
- Track progress over time
- Export data for personal records
- Continuity across sessions

**AI Context**:
- Recent messages (last 10-15) provide immediate conversation context
- Semantic memory provides long-term context
- Together they create natural, contextual conversations

**Privacy & Control**:
- Users can delete individual chats or all history
- Export everything in JSON format
- See exactly what AI "remembers"

### Complete Context Flow

When user asks a question, AI receives:

```typescript
{
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content: `You are a productivity coach for FocusGo.
      
      USER PROFILE: ${memory.profile}
      ACTIVE GOALS: ${memory.goals}
      ACTIVE EXPERIMENTS: ${memory.experiments}
      RECENT INSIGHTS: ${memory.insights}
      
      RECENT SESSION SUMMARY (last 7 days):
      ${sessionAnalytics}  // Completion rates, timing patterns, categories
      `
    },
    ...recentChatMessages,  // Last 10 messages for immediate context
    { 
      role: "user", 
      content: userQuestion 
    }
  ]
}
```

This gives AI:
- ✅ Long-term memory (semantic)
- ✅ Recent conversation context (chat history)
- ✅ Real productivity data (sessions)
- ✅ User's goals and experiments

**Total context**: ~2,000-2,500 tokens (efficient and affordable)

---

## Example Interactions

### Simple Analytics Query
### Simple Analytics Query

```
User: "How was my week?"

AI: "Solid week! You completed 32 focus sessions totaling 13 hours:

📊 Breakdown:
    • Work: 18 sessions (56%) - 7.5 hours
    • Study: 10 sessions (31%) - 4.2 hours  
    • Personal: 4 sessions (13%) - 1.3 hours
    
⭐ Highlights:
    • Your completion rate was 85% - above your usual 78%
    • Tuesday & Thursday mornings were especially productive
    • You maintained good balance with breaks
    
💡 Insight: You're doing best when starting work by 9 AM. 
    Consider protecting that morning time."
```

### Goal Setting & Tracking
### Goal Setting & Tracking

```
User: "I'm struggling with focus in the afternoons"

AI: "I hear you - afternoon focus is a common challenge. Looking at your 
    data, I see 90% of your completed sessions happen before 2 PM. 
    Your afternoons show a 45% skip rate.
    
    What usually happens in your afternoons? Meetings? Fatigue? 
    Distractions?"

User: "Yeah, lots of meetings and I'm pretty tired by then"

AI: "That makes sense. Would you like to try an experiment? Schedule your 
    deep work (Study and Writing categories) in the mornings when your 
    completion rate is highest, and save lighter tasks for afternoons.
    
    I'll track this as an experiment and we can review in 2 weeks?"

User: "Let's try it"

AI: "Experiment started: 'Morning deep work blocks'. I'll check in with 
    you in 2 weeks to see how it's going!"

[Memory updated:
 - experiments: [{description: "Morning deep work blocks", 
                 startDate: "2025-11-23", status: "active"}]
 - conversationContext: [{topic: "afternoon focus struggles", 
                         importance: "high"}]
]
```

**Two weeks later:**

```
User: "How's my focus experiment going?"

AI: "Great question! Your 'Morning deep work blocks' experiment has been 
    running for 2 weeks. Here's what I'm seeing:
    
    📈 Morning sessions (before noon):
       • Completion rate: 88% (up from 75%)
       • Average duration: 24.5 minutes (nearly full pomodoros)
    
    📉 Afternoon sessions (after 2 PM):
       • Completion rate: 52% (down from 60%)
       • You're doing fewer of them (good - matching your energy)
    
    💡 The strategy is working for mornings, but afternoons got worse. 
    How are you feeling about it?"

User: "Mornings are great! But I'm exhausted afternoons"

AI: "That pattern shows clearly in your data. Since morning focus is 
    working so well, maybe afternoons need a different approach?
    
    Ideas:
    1. Power nap at 2 PM (even 15 min helps)
    2. Switch to shorter sessions (15 min) in afternoons
    3. Save truly easy tasks for afternoon hours
    
    Which sounds most realistic for you?"
```

### Learning User Context
### Learning User Context

```
AI: "Hi! I notice this is your first time chatting with me. 
     What kind of work brings you to FocusGo?"

User: "I'm a software developer"

AI: "Nice! Are you working from home, office, or hybrid?"

User: "Remote, but I go to coworking spaces sometimes"

AI: "Got it. I'll start learning your patterns as you use the timer. 
     Feel free to chat with me anytime about your focus or productivity!"

[Memory saved:
 - profile.profession: "software developer"
 - profile.workContext: "remote with coworking spaces"
]
```

**Later conversation:**

```
User: "I can't focus today"

AI: "Sorry to hear that. You mentioned you work from home - are you there 
    today, or at a coworking space?"

[AI remembered work context from previous conversation]

User: "Home. Too many distractions"

AI: "Makes sense. For software developers I've worked with, changing 
    location mid-day sometimes helps. Could you try your coworking space 
    for afternoon sessions?
    
    Or if that's not an option - what if we tried shorter 15-minute 
    sessions just to build momentum?"
```

### Detecting Anomalies & Checking In
### Detecting Anomalies & Checking In

```
AI: "Hey - I noticed you've skipped 8 sessions in a row today. That's 
    really unusual for you. Everything okay? Want to talk about what's 
    blocking your focus?"

User: "Just feeling overwhelmed with this project deadline"

AI: "I understand - deadline pressure is tough. Your data shows you're 
    actually more productive when you take it one pomodoro at a time, 
    rather than trying to power through.
    
    What if we set a small goal: just complete 2 sessions today on the 
    project? That's totally doable, and it'll be real progress."

[Memory saved:
 - conversationContext: [{
     topic: "deadline pressure",
     summary: "User overwhelmed by project deadline, skipping sessions",
     importance: "high"
   }]
]
```

**Next week:**

```
User: "Finished that project!"

AI: "Congratulations! 🎉 I remember you were feeling overwhelmed last week. 
    Looking at your sessions, you completed 22 pomodoros on it over 5 days.
    
    That's actually a great pace - about 4-5 quality focus blocks per day. 
    How are you feeling now that it's done?"

[AI remembered the previous struggle from conversationContext]
```

### Smart Recommendations Based on Patterns

```
User: "When should I schedule my writing time?"

AI: "Based on your last 60 days of data, your Writing category sessions 
    have:
    
    ⭐ 92% completion rate at 9-11 AM (your best time)
    😐 68% completion rate at 2-4 PM
    💤 41% completion rate at 7-9 PM
    
    Your brain is sharpest for writing in the morning. Also interesting: 
    you complete more Writing sessions on Tuesdays and Wednesdays than 
    other days.
    
    Try protecting Tuesday & Wednesday mornings for writing - that's when 
    your completion data suggests you're in the zone."
```

### Profession-Specific Context

```
User: "How many pomodoros should I aim for daily?"

AI: "For software developers like you, I'd suggest focusing on quality over 
    quantity. Your data shows:
    
    • 6-7 quality sessions = your sweet spot
    • 8+ sessions = completion rate drops to 65%
    • Sessions after your 7th = 55% skip rate
    
    Most developers I work with maintain focus for 3-4 sessions in the 
    morning, break for lunch, then 2-3 lighter sessions afternoon.
    
    Your pattern actually matches this - you're already naturally working 
    this way. I'd say 6-7 sessions is a realistic, sustainable target."

[AI uses profession context from memory to provide relevant insights]
```

---

## Privacy & Control

### Transparency: What Does the AI Know About Me?

Users can view their complete memory at any time through a **Memory Dashboard**:

**What I can see:**
- ✅ Everything in semantic memory (profile, goals, experiments, insights)
- ✅ All conversation summaries and topics
- ✅ Full chat history (every message)
- ✅ All conversation summaries and topics
- ✅ Full chat history (every message)
- ✅ Every session record with timestamps
- ✅ Exactly what data is sent to AI in each request

**Example Memory Dashboard View:**

```
Your AI Memory (Last updated: Nov 23, 2025)

PROFILE
• Profession: Software Developer
• Work Context: Remote with coworking spaces
• Timezone: UTC-5

ACTIVE GOALS
• Improve morning focus
• Better work-life balance

EXPERIMENTS
• Morning deep work blocks (Started: Nov 10, Status: Active)
  Hypothesis: Should improve afternoon energy
  
RECENT INSIGHTS
• You're most productive Tue-Thu mornings (Nov 18)
• Completion rate up 10% when taking breaks (Nov 15)

CONVERSATION TOPICS (Last 30 days)
• Deadline pressure (Nov 16, importance: high)
• Work-life balance concerns (Nov 12, importance: medium)
• Morning routine optimization (Nov 8, importance: high)

[Edit Memory] [Clear All Memory] [Export Data] [Pause Learning]
```

### Control: Your Data, Your Rules

**Edit Memory**
- Click any memory item to edit or delete it
- "I don't want AI to remember this conversation topic" → deleted
- "My profession changed" → update profile
- Memory updates immediately affect AI behavior

**Clear Memory** (Nuclear Option)
- Delete all semantic memory (profile, goals, experiments, insights)
- Keep or delete chat history (user choice)
- Keeps session data (your productivity records)
- AI starts fresh, like a new user

**Export Everything**
```json
// Download complete data as JSON
{
  "memory": { /* full UserMemory object */ },
  "chats": [ /* all conversations */ ],
  "sessions": [ /* all Pomodoro sessions */ ],
  "exportDate": "2025-11-23T10:30:00Z"
}
```

**Pause Learning**
- Toggle "Pause Learning" to stop AI from extracting new memory
- Can still chat, but AI won't update memory
- Resume anytime
- Useful if discussing sensitive topics temporarily

**Delete Specific Chats**
- Right-click any chat thread → Delete
- Removes from history but doesn't affect extracted memory
- "Delete this chat and forget related memory" → removes both

### Privacy Commitments

**Your Data is Yours**
- ✅ Stored in your Firestore (under your Firebase account if self-hosting)
- ✅ Never sold or used for advertising
- ✅ Not used to train AI models without explicit consent
- ✅ Can be exported or deleted anytime
- ✅ No tracking, no analytics without consent

**Data Sent to AI Service**
- ✅ Only sent when you ask a question in chat
- ✅ Includes: semantic memory + recent chat + session summary
- ✅ Does NOT include: email, identifiers, or data from other users
- ✅ API calls are encrypted (HTTPS)
- ✅ AI service (GitHub Models/OpenAI) doesn't store conversations for training

**Multi-User Privacy**
- ✅ Each user's data is completely isolated in Firestore
- ✅ No user can see another user's sessions, chats, or memory
- ✅ No aggregation or comparison across users (future consideration)
- ✅ Admin/developer cannot see user conversations without explicit database access

---

## Why This Approach?

### Token Efficiency → Affordability

Traditional approach (sending full chat history):
```
50 messages × 60 tokens each = 3,000 tokens
+ 200 token system prompt
+ 1,000 tokens session data
= 4,200 tokens per request

At $0.005/1K tokens: $0.021 per chat
User chats 10 times/month: $0.21/user/month
```

Our approach (semantic memory + recent context):
```
Semantic memory: 300 tokens
Last 10 messages: 600 tokens  
System prompt: 200 tokens
Session summary: 1,000 tokens
= 2,100 tokens per request

At $0.005/1K tokens: $0.01 per chat
User chats 10 times/month: $0.10/user/month
```

**50% cost reduction** → easier to keep free or very cheap for users

### Better AI Performance

**Problem with full chat history:**
- AI must scan through conversational back-and-forth to find relevant context
- Older important information gets "lost" in noise
- Token limit restricts how far back AI can see

**Benefit of semantic memory:**
- Key insights already extracted and structured
- AI immediately knows: goals, experiments, preferences
- Can reference context from months ago without token limits
- Faster, more relevant responses

### User Experience

**Feels continuous:** "You mentioned struggling with afternoon focus" (2 weeks later)

**Respects privacy:** User can see and control everything AI "remembers"

**Transparent:** No mystery about what AI knows

**Long-term coaching:** Remembers goals and tracks progress over months

---

## Technical Considerations

### AI Service: GitHub Models vs. OpenAI

**Current Plan (Development):**
- GitHub Models (free during preview)
- GPT-4o model
- Perfect for prototyping and initial users
- Same API format as OpenAI (easy migration)

**Future (Production at Scale):**
- OpenAI API directly (if GitHub Models preview ends)
- Or keep GitHub Models if it remains free/affordable
- Cost: ~$0.10/user/month with our architecture
- Can support hundreds of users affordably

### Firestore Structure

```
users/
  {userId}/
    memory/              ← Single document (UserMemory)
    sessions/            ← Collection (PomodoroSession documents)
      {sessionId}
    chats/               ← Collection (ChatThread documents)
      {chatId}/
        metadata         ← Document (ChatThread)
        messages/        ← Collection (ChatMessage documents)
          {messageId}
```

**Scalability:**
- Firestore free tier: 50K reads, 20K writes per day
- Our usage: ~100 reads/writes per user per day
- Free tier supports ~200-300 active daily users
- Paid tier: $0.06 per 100K operations (very cheap)

### Token Budget Management

**Per chat request:**
- System prompt: 200 tokens (fixed)
- Semantic memory: 300 tokens (grows slowly)
- Recent messages: 600 tokens (capped at last 10)
- Session summary: 1,000 tokens (last 7-30 days)
- User question: 100 tokens (average)
- **Total input: ~2,200 tokens**

**Response:**
- AI response: 300-500 tokens (average)

**Total per chat: ~2,700 tokens** (well within GPT-4o limits)

### Memory Extraction

Hidden AI call after each user-AI exchange:

```typescript
// Extract semantic updates from conversation
const extractionPrompt = `
Based on this conversation, extract:
1. Any new goals mentioned
2. Profile updates (profession, work context, preferences)
3. Experiments user wants to try
4. Important topics to remember

Conversation:
${lastUserMessage}
${lastAIResponse}

Current memory: ${JSON.stringify(currentMemory)}

Return updated memory as JSON.
`;
```

**Cost:** ~1,000 tokens per extraction
**Frequency:** After each conversation (not every message, but each chat session)
**Result:** Automatic, invisible to user, keeps memory current

---

## Success Metrics (Future)

### User Engagement
- How often do users chat with AI?
- Do they return for follow-up conversations?
- Do they try AI recommendations?

### User Value
- Self-reported: "Is AI coach helpful?" (thumbs up/down per response)
- Experiment completion rate (do users follow through?)
- Goal achievement (user feedback)
- Retention: users with AI vs. without

### AI Quality
- Response relevance (user feedback)
- Context accuracy (does AI remember correctly?)
- Pattern detection quality (are insights accurate?)

### Cost Management
- Average tokens per user per month
- Cost per user per month
- Break-even point if monetization needed

---

## Open Questions & Future Exploration

**Model Selection**
- Will GitHub Models stay free long-term?
- Should we support multiple AI providers?
- Any cheaper but effective models for simple queries?

**Privacy Compliance**
- GDPR requirements for AI memory?
- User consent flows for memory extraction?
- Data retention policies?

**Advanced Features**
- Voice chat with AI coach?
- Proactive notifications ("Your morning focus time is starting!")?
- Team/shared workspace insights?
- Integration with calendars or other tools?

**Monetization** (if needed)
- Free tier with basic AI chat
- Premium: advanced insights, longer memory, priority access?
- Or keep completely free as passion project?

---

## Summary: What Makes This Different?

Most productivity apps:
- ❌ Static dashboards with charts
- ❌ Generic advice not based on your data
- ❌ No memory of your goals or context
- ❌ Forms and surveys to set up
- ❌ Expensive AI features ($10-20/month)

FocusGo AI Coach:
- ✅ Natural conversation, learns as you talk
- ✅ Personalized insights from your actual session data
- ✅ Remembers your goals, experiments, and context
- ✅ Supportive coaching, not just metrics
- ✅ Affordable/free (efficient architecture)
- ✅ Complete transparency and control
- ✅ Privacy-focused, no data sold

**It's like having a productivity expert who knows your work patterns, remembers your goals, and helps you improve continuously - all through simple conversation.**

---

**Last Updated:** November 23, 2025
