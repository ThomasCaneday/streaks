# Streaks for Anything

A minimal MVP for tracking daily streaks in challenges, built with React, TypeScript, Vite, and Firebase.

## Setup

1. Clone the repo.
2. Copy `.env.example` to `.env` and fill in your Firebase project config.
3. Run `npm install`.
4. Run `npm run dev` to start development server.

## Firebase Setup

- Enable Authentication with Email/Password.
- Enable Firestore.
- Deploy the Firestore rules from `firestore.rules`.

## Build and Deploy

- `npm run build` to build for production.
- For GitHub Pages, push to main branch, the workflow will deploy to gh-pages branch.

### GitHub Pages Deployment

1. Go to your GitHub repository settings
2. Navigate to "Pages" in the sidebar
3. Set source to "Deploy from a branch"
4. Set branch to "gh-pages" and folder to "/ (root)"
5. Add your Firebase environment variables as repository secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`

## Features

- Sign up/sign in with email and unique username.
- Create solo or group challenges.
- Check in daily to maintain streaks.
- View public leaderboard.
- Timezone-aware check-ins.
# Test deployment
