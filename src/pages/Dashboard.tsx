import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthChange } from '../lib/auth';
import { getUserChallenges, createChallenge } from '../lib/challenges';
import { hasCheckedInToday } from '../lib/checkins';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ChallengeCard from '../components/ChallengeCard';
import Navbar from '../components/Navbar';
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Your Challenges</h1>
        <p className="mb-4">Found {challenges.length} challenges</p>
        <div className="mb-4 space-x-2">
          <button onClick={handleCreateChallenge} className="bg-blue-600 text-white px-4 py-2 rounded">Create Challenge</button>
          <button onClick={() => user && loadChallenges(user)} className="bg-gray-600 text-white px-4 py-2 rounded">Refresh Challenges</button>
        </div>
        {challenges.length === 0 ? (
          <p>No challenges found. Try creating one!</p>
        ) : (
          challenges.map((c) => (
            <ChallengeCard
              key={c.id}
              id={c.id}
              name={c.name}
              currentStreak={c.currentStreak}
              hasCheckedToday={c.hasCheckedToday}
            />
          ))
        )}
      </div>
    </div>
  );
}
