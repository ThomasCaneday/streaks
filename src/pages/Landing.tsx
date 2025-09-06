import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Streaks for Anything</h1>
        <p className="mb-8">Build habits with friends or solo. Track your daily streaks!</p>
        <div className="space-x-4">
          <Link to="/auth" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Sign Up / Sign In</Link>
        </div>
      </div>
    </div>
  );
}
