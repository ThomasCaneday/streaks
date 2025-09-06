import { createBrowserRouter } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ChallengeDetail from './pages/ChallengeDetail';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

// Determine basename based on hosting platform
const getBasename = () => {
  if (import.meta.env.DEV) return '/';
  
  // Check if we're on Firebase hosting
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('firebase') || 
        window.location.hostname.includes('web.app') ||
        window.location.hostname === 'streaks-b68de.web.app' ||
        window.location.hostname === 'streaks-b68de.firebaseapp.com') {
      return '/';
    }
  }
  
  // Default to GitHub Pages basename
  return '/streaks';
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/app',
    element: <Dashboard />,
  },
  {
    path: '/challenge/:id',
    element: <ChallengeDetail />,
  },
  {
    path: '/leaderboard',
    element: <Leaderboard />,
  },
  {
    path: '/profile',
    element: <Profile />,
  },
], {
  basename: getBasename(),
});
