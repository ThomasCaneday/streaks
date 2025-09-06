import { Link, useNavigate } from 'react-router-dom';
import { logOut } from '../lib/auth';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/app" className="text-xl font-bold">Streaks</Link>
        <div className="space-x-4">
          <Link to="/app" className="hover:underline">Dashboard</Link>
          <Link to="/leaderboard" className="hover:underline">Leaderboard</Link>
          <Link to="/profile" className="hover:underline">Profile</Link>
          <button onClick={handleLogout} className="hover:underline">Sign Out</button>
        </div>
      </div>
    </nav>
  );
}
