# Firebase Setup Guide

Quick reference for Firebase configuration in FocusGo project.

## Prerequisites

- Firebase account
- Firebase project created (focusgo)

---

## Initial Firebase Setup (One-time)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select existing
3. Project name: `focusgo`
4. Enable/link Google Analytics (optional, use existing property)
5. Click **"Create project"**

### 2. Add Web App

1. Click **"+ Add app"** → Select **Web** icon `</>`
2. App nickname: **"FocusGo Web"**
3. **Don't check** "Also set up Firebase Hosting" (using Amplify)
4. Click **"Register app"**
5. **Save the Firebase config** (needed for Angular environment files)
6. Click **"Continue to console"**

### 3. Enable Authentication

1. Left sidebar → **"Authentication"**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Google"** provider:
   - Click "Google"
   - Toggle "Enable"
   - Select support email
   - Click "Save"

### 4. Create Firestore Database

1. Left sidebar → **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"**
4. Click **"Next"**
5. Choose location: **nam5** (North America - Montreal) or closest to users
   - ⚠️ Cannot be changed later!
6. Click **"Enable"**
7. Wait for creation (~30 seconds)

### 5. Set Up Security Rules

1. Go to **"Rules"** tab
2. Copy rules from `firestore.rules` file in the project root
3. Paste into the Firebase Console editor
4. Click **"Publish"**

> **Note:** The rules enforce per-user data isolation for sessions, categories, profiles, and AI memory.

3. Click **"Publish"**

---

## Firebase Config

To find your Firebase config (needed for environment files):

1. Firebase Console → ⚙️ (Settings) → **Project settings**
2. Scroll to **"Your apps"** section
3. Find "FocusGo Web" app
4. Copy the `firebaseConfig` object

Example config structure:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "focusgo-xxxxx.firebaseapp.com",
  projectId: "focusgo-xxxxx",
  storageBucket: "focusgo-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Project Setup Status

- ✅ Firebase project created
- ✅ Web app registered
- ✅ Google Authentication enabled
- ✅ Firestore database created (nam5)
- ✅ Security rules configured
- 🔄 Angular integration (next step)

---

## Deploying to Production Domain

When deploying to a custom domain (e.g., focusgo.app):

1. **Add Authorized Domain:**
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add your production domain (e.g., `focusgo.app`, `www.focusgo.app`)

2. **Deploy Security Rules:**
   - Firebase Console → Firestore Database → Rules tab
   - Copy/paste rules from `firestore.rules` file
   - Click "Publish"

3. **Test:**
   - Sign in on production domain
   - Verify data saves to Firestore

---

## Next Steps

1. Install Firebase SDK: `npm install firebase`
2. Add Firebase config to environment files
3. Create Firebase services (auth, firestore)
4. Implement sign-in UI

See implementation details in the main codebase.

---

**Last Updated**: November 22, 2025
