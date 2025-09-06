import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthChange } from '../lib/auth';
import { getUserChallenges, createChallenge } from '../lib/challenges';
import { hasCheckedInToday } from '../lib/checkins';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import { motion } from 'framer-motion';
import type { User } from 'firebase/auth';
import type { Challenge } from '../lib/challenges';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [challenges, setChallenges] = useState<(Challenge & { hasCheckedToday: boolean; currentStreak: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadChallenges = useCallback(async (u: User) => {
    try {
      const ch = await getUserChallenges(u);
      const withCheckins = await Promise.all(
        ch.map(async (c) => {
          const hasChecked = await hasCheckedInToday(c.id, u);
          // Fetch current streak from participant document
          let currentStreak = 0;
          try {
            const participantRef = doc(db, 'challengeParticipants', `${c.id}_${u.uid}`);
            const participantSnap = await getDoc(participantRef);
            if (participantSnap.exists()) {
              currentStreak = participantSnap.data().currentStreak || 0;
            }
          } catch (error) {
            console.error('Error fetching participant data:', error);
          }
          
          return {
            ...c,
            hasCheckedToday: hasChecked,
            currentStreak,
          };
        })
      );
      setChallenges(withCheckins);
      console.log('Loaded challenges:', withCheckins);
    } catch (error) {
      console.error('Error loading challenges:', error);
      // Retry after a short delay in case of auth timing issues
      setTimeout(() => {
        if (u) loadChallenges(u);
      }, 1000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      if (!u) {
        navigate('/');
        return;
      }
      setUser(u);
      loadChallenges(u);
    });
    return unsubscribe;
  }, [navigate, loadChallenges]);

  const handleCreateChallenge = async () => {
    const name = prompt('Challenge name:');
    if (name && user) {
      try {
        await createChallenge(user, name, false, 'public');
        loadChallenges(user);
      } catch {
        alert('Error creating challenge');
      }
    }
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
            Your Streaks
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Keep the momentum going! 🔥
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="cursor-pointer" onClick={() => navigate(`/challenge/${challenge.id}`)}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {challenge.name}
                </h3>
                <div className="flex items-center justify-center mb-4">
                  <span className="text-4xl mr-3">🔥</span>
                  <motion.span
                    className="text-5xl font-bold text-pink-500"
                    key={challenge.currentStreak}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {challenge.currentStreak}
                  </motion.span>
                </div>
                <ProgressBar progress={(challenge.currentStreak % 7) * (100 / 7)} className="mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  {challenge.hasCheckedToday ? 'Checked in today!' : 'Check in to keep your streak'}
                </p>
              </Card>
            </motion.div>
          ))}

          {/* Create New Challenge Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: challenges.length * 0.1 }}
          >
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-pink-500 dark:hover:border-pink-400" onClick={handleCreateChallenge}>
              <div className="text-center py-8">
                <div className="text-6xl mb-4 text-gray-400 dark:text-gray-500">+</div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  Create New Challenge
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Start a new streak today
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {challenges.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              No challenges yet. Create your first streak!
            </p>
            <Button onClick={handleCreateChallenge} size="lg">
              Get Started
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
