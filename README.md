# Pomodoro Focus Tracker

Personal productivity tool built to explore Angular + AWS Amplify architecture 
while solving a real problem: understanding where my focused time actually goes.

🌐 **Live Demo:** [https://focusgo.app](https://focusgo.app)

## Why This Project?

I built this as both a personal productivity tool and a learning laboratory while writing my 7th technical book, "AI Security for .NET Developers."

**Current Status:**
- ✅ Core Pomodoro timer functionality
- ✅ Category/tag system for organizing sessions
- ✅ Session tracking with comprehensive metadata
- ✅ Progressive Web App (works offline, installs on devices)
- ✅ Material Design UI with toolbar
- ✅ AWS Amplify serverless deployment
- ✅ Firebase Authentication (Google sign-in)
- ✅ Cloud sync with Firestore
- ✅ User notifications with Material Snackbar
- 🔄 **Next: Analytics dashboard and AI integration**

## Tech Stack

- **Frontend:** Angular 18 + Angular Material
- **Authentication:** Firebase Auth (Google OAuth)
- **Database:** Firebase Firestore
- **Hosting:** AWS Amplify (serverless)
- **Future:** AI APIs for time analysis features

## What I'm Learning

### Amplify Architecture
This project let me explore AWS Amplify's serverless architecture with Angular:
- Amplify Hosting for static Angular apps
- CI/CD pipeline integration
- Environment-based configuration
- Cost-effective hosting for personal projects

### AI Integration Exploration (In Progress)
Currently evaluating different approaches for adding AI-powered time analysis:
- Tested GitHub Models for initial prototyping
- Exploring cost/performance trade-offs of various AI APIs
- Researching security patterns for AI integration
- These learnings will inform the AI Security book

## Features

### Current
- ⏱️ Pomodoro timer with customizable intervals
- 🏷️ Category/tag system (Work, Study, Personal, Urgent, Exercise)
- 📊 Session tracking with detailed metadata
- 🎨 Material Design UI
- 📱 Responsive (works on mobile)
- 💾 Local data persistence

### Planned
- 🔐 Firebase Authentication
- ☁️ Cloud sync with Firebase Firestore
- 🤖 AI-powered time pattern analysis
- 📈 Advanced analytics dashboard
- � Visual reports and charts
- �🔄 Data export functionality

## Data Structure & AI Integration

### Session Tracking Architecture

The app tracks comprehensive session data designed for future AI analysis:

```typescript
interface PomodoroSession {
  id: string;
  categoryId: string;           // Tag/category for the session
  categoryName: string;          // Category name (for history if renamed)
  duration: number;              // Planned duration (seconds)
  actualDuration: number;        // Actual time spent
  startTime: string;             // ISO timestamp
  endTime: string;               // ISO timestamp
  completed: boolean;            // Natural completion vs skipped
  dayOfWeek: number;            // 0-6 for weekly patterns
  hourOfDay: number;            // 0-23 for daily patterns
  consecutiveSession: number;    // Session count in current streak
  followedBreak: boolean;        // Whether a break was taken before
}
```

### Why This Data Structure?

**For Personal Analytics:**
- Track time investment across different life areas (work, study, personal)
- Understand productivity patterns by time of day and day of week
- Measure focus sustainability (consecutive sessions, completion rates)
- Identify when breaks improve performance

**For AI-Powered Insights:**
The data structure is optimized for AI analysis to provide actionable insights:

#### Pattern Recognition
- "You complete 90% of Study sessions between 9-11 AM"
- "Your focus drops after 3 consecutive sessions without a break"
- "Tuesday mornings show highest completion rates for Work tasks"

#### Fatigue Detection
- "You skip 60% of sessions after the 4th consecutive pomodoro"
- "Taking breaks increases your next session completion rate by 25%"

#### Optimization Suggestions
- "Schedule Urgent tasks in the morning when your completion rate is highest"
- "Consider longer breaks after Study sessions - your data shows improved focus"
- "You work best in 2-3 session blocks with breaks between"

#### Smart Planning
- Suggest optimal times for specific categories based on historical performance
- Recommend break timing based on fatigue patterns
- Predict realistic daily capacity based on completion history

### Storage Strategy

**Phase 1 (Completed):** localStorage
- Simple implementation
- No backend required
- Works offline
- Data viewable in browser DevTools

**Phase 2 (Current):** Firebase Firestore
- ✅ Cross-device sync
- ✅ Safe from browser data clearing
- ✅ Firebase Auth for secure access
- ✅ Multi-user with data isolation
- Ready for AI API integration

Users sign in with Google to sync sessions across devices. Signed-out users still work with localStorage only.

## SEO & Growth Roadmap

### Short Term (Easy Wins)
- Add Schema.org structured data (JSON-LD) for SoftwareApplication
- Create a blog section with productivity tips
- Add an about/features page (more indexable content)
- Implement breadcrumbs when you add more pages

### Long Term
- Content marketing - Write articles about productivity
- Backlinks - Submit to PWA directories
- Social proof - Add testimonials/reviews
- Performance - Keep Lighthouse scores high (already good with PWA)

## Installation

**Desktop (Chrome, Edge, Brave):**
Visit [focusgo.app](https://focusgo.app) → Click install icon in address bar

**Mobile (Android):**
Visit site → Tap "Add to Home Screen"

**iOS Safari:**
Visit site → Share → "Add to Home Screen"

## About

Built by Herbert Moroni Gois while writing "AI Security for .NET Developers".

**Background:**
- Senior Software Engineer with 20+ years .NET/Angular experience
- Published author of 6 technical books
- Former CTO at 4Sec Global

**Connect:**
- [LinkedIn](https://www.linkedin.com/in/herbertmoroni/)
- [Medium](https://medium.com/@herbertmoroni)
- [Amazon Author Page](https://www.amazon.com/stores/Herbert-Moroni/author/B0BCBWB3V2?ref=sr_ntt_srch_lnk_6&qid=1763746106&sr=8-6&isDramIntegrated=true&shoppingPortalEnabled=true&ccs_id=672d33bb-79c9-4b4b-b8bf-471d6048d733) (search "Herbert Moroni")

## License

This project is open source and available for personal and commercial use.

## Acknowledgments

- Pomodoro Technique® by Francesco Cirillo
- Sound effects from Mixkit
- Icons and UI components from Angular Material

