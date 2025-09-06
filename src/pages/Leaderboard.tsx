import { useEffect, useState } from 'react';
import { getLeaderboard } from '../lib/leaderboard';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import { motion } from 'framer-motion';
import type { LeaderboardEntry } from '../lib/leaderboard';

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(setEntries).finally(() => setLoading(false));
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge variant="warning">🥇</Badge>;
    if (rank === 2) return <Badge variant="info">🥈</Badge>;
    if (rank === 3) return <Badge variant="error">🥉</Badge>;
    return <Badge variant="info">{rank}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Leaderboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Top streaks across all challenges 🔥
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {entries.map((entry, index) => (
            <motion.div
              key={`${entry.username}-${entry.challengeName}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="mb-4"
            >
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRankBadge(index + 1)}
                    </div>
                    <Avatar 
                      src={entry.selectedAvatar ? `${import.meta.env.BASE_URL}avatars/${entry.selectedAvatar}` : undefined}
                      fallback={entry.username.charAt(0).toUpperCase()} 
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {entry.username}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {entry.challengeName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🔥</span>
                      <span className="text-3xl font-bold text-pink-500">
                        {entry.currentStreak}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {entries.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-lg text-gray-600 dark:text-gray-300">
              No entries yet. Be the first to start a streak!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
