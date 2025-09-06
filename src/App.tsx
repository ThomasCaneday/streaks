import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useEffect } from 'react';

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

function App() {
  useEffect(() => {
    // Handle GitHub Pages SPA routing
    if (window.location.search && !import.meta.env.DEV) {
      const search = window.location.search.slice(1);
      if (search) {
        // Convert ~and~ back to /
        const path = search.replace(/~and~/g, '/');
        // Navigate to the correct route
        window.history.replaceState(null, '', getBasename() + '/' + path);
        // Reload the page to let React Router handle the new URL
        window.location.reload();
      }
    }
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
