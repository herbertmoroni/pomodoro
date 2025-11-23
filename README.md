# Pomodoro Focus Tracker

Personal productivity tool built to explore Angular + AWS Amplify architecture 
while solving a real problem: understanding where my focused time actually goes.

🌐 **Live Demo:** [https://focusgo.app](https://focusgo.app)

## Why This Project?

I built this as both a personal productivity tool and a learning laboratory while writing my 7th technical book, "AI Security for .NET Developers."

**Current Status:**
- ✅ Core Pomodoro timer functionality
- ✅ **Flexible timer duration** (click to edit, supports shorthand like "5" → "5:00")
- ✅ Category/tag system for organizing sessions
- ✅ Session tracking with comprehensive metadata
- ✅ Progressive Web App (works offline, installs on devices)
- ✅ Material Design UI with toolbar
- ✅ AWS Amplify serverless deployment
- ✅ Firebase Authentication (Google sign-in)
- ✅ Cloud sync with Firestore
- ✅ User notifications with Material Snackbar
- ✅ Custom category management (add/edit/delete/reorder)
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
- Firebase Crashlytics for tracking user errors in production (authentication failures, Firestore errors, etc.)

### AI Integration Exploration (In Progress)
Currently evaluating different approaches for adding AI-powered time analysis:
- Tested GitHub Models for initial prototyping
- Exploring cost/performance trade-offs of various AI APIs
- Researching security patterns for AI integration
- These learnings will inform the AI Security book


## Data Structure & AI Integration

> **📋 Detailed AI Integration Plan:** See [AI-ROADMAP.md](./AI-ROADMAP.md) for comprehensive AI features, data structure design, and implementation strategy.

The app tracks detailed session data (duration, completion, timing patterns, breaks) designed for future AI analysis to provide personalized productivity insights and recommendations.

## SEO & Growth Roadmap

### Short Term (Easy Wins)
- Add Schema.org structured data (JSON-LD) for SoftwareApplication
- Create a blog section with productivity tips
- Add an about/features page (more indexable content)
- Implement breadcrumbs when you add more pages

### Long Term
- Content marketing - Write articles about productivity
- Backlinks - Submit to PWA directories
- Performance - Keep Lighthouse scores high (already good with PWA)

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

