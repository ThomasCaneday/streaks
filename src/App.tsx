import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ChallengeDetail from './pages/ChallengeDetail';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import InviteAccept from './pages/InviteAccept';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/app" element={<Dashboard />} />
      <Route path="/challenge/:id" element={<ChallengeDetail />} />
      <Route path="/invite/:token" element={<InviteAccept />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;
