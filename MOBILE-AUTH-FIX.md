# Mobile Authentication Fix

## Issue
Google sign-in was not working properly on mobile devices (specifically Chrome mobile), preventing users from authenticating.

## Solution
Added **Firestore offline persistence** using `enableIndexedDbPersistence()`.

## What Changed

### Firebase Service (`firebase.service.ts`)
Added one line to enable Firestore offline persistence:

```typescript
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// In constructor:
enableIndexedDbPersistence(this.db)
```

### What This Does
- **Caches Firestore data locally** in browser's IndexedDB
- **Survives page reloads** and redirects
- **Works offline** - data syncs when back online
- **Multi-tab support** - handles multiple browser tabs gracefully
- **No server changes needed** - purely client-side

### Why This Fixed Mobile Auth
The redirect flow on mobile requires a page reload. Without Firestore persistence:
1. User clicks "Sign in"
2. Redirects to Google
3. Returns to app (page reloads)
4. Auth state was lost/delayed

With persistence:
1. Auth state is cached locally
2. Available immediately after redirect
3. Data persists across the redirect flow

## Technical Details
- Uses IndexedDB for local storage
- Auth persistence: `browserLocalPersistence` (already existed)
- Firestore persistence: `enableIndexedDbPersistence()` (newly added)
- Both work together to maintain state through redirects

## No Firebase Configuration Required
This is a client-side feature. No changes needed in Firebase console or security rules.
