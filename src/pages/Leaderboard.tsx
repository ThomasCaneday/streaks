import { useEffect, useState } from 'react';
import { getLeaderboard } from '../lib/leaderboard';
import Navbar from '../components/Navbar';
import type { LeaderboardEntry } from '../lib/leaderboard';

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(setEntries).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Public Leaderboard</h1>
        {entries.map((e, i) => (
          <div key={i} className="flex justify-between p-2 border-b">
            <span>{e.username} • {e.challengeName}</span>
            <span>{e.currentStreak}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
