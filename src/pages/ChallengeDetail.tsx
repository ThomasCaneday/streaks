import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthChange } from '../lib/auth';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { hasCheckedInToday } from '../lib/checkins';
import Navbar from '../components/Navbar';
import CheckInButton from '../components/CheckInButton';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import { motion } from 'framer-motion';
import type { User } from 'firebase/auth';
import type { Challenge } from '../lib/challenges';

interface Member {
  username: string;
  currentStreak: number;
  hasCheckedToday: boolean;
}

export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [myHasChecked, setMyHasChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadChallenge = useCallback(async (challengeId: string) => {
    try {
      console.log('Loading challenge:', challengeId);
      const challengeSnap = await getDoc(doc(db, 'challenges', challengeId));
      if (!challengeSnap.exists()) {
        alert('Challenge not found');
        navigate('/app');
        return;
      }
      const ch = { id: challengeSnap.id, ...challengeSnap.data() } as Challenge;
      console.log('Challenge loaded:', ch);
      setChallenge(ch);

      // Load members
      const memberUids = ch.members; // members is now an array
      console.log('Member UIDs:', memberUids);
      const profiles = await Promise.all(
        memberUids.map(async (uid) => {
          console.log('Loading data for member:', uid);
          const profileSnap = await getDoc(doc(db, 'profiles', uid));
          console.log('Profile data for', uid, ':', profileSnap.exists() ? profileSnap.data() : 'Profile not found');
          const participantSnap = await getDoc(doc(db, 'challengeParticipants', `${challengeId}_${uid}`));
          const hasChecked = await hasCheckedInToday(challengeId, { uid } as User);
          const username = profileSnap.exists() && profileSnap.data()?.username 
            ? profileSnap.data()!.username 
            : `User ${uid.slice(0, 8)}`;
          return {
            username,
            currentStreak: participantSnap.exists() ? participantSnap.data()?.currentStreak || 0 : 0,
            hasCheckedToday: hasChecked,
          };
        })
      );
      console.log('Member profiles loaded:', profiles);
      setMembers(profiles);
      
      // Check if current user has checked in today
      if (user) {
        const checked = await hasCheckedInToday(challengeId, user);
        setMyHasChecked(checked);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading challenge:', error);
      setLoading(false);
    }
  }, [navigate, user]);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      if (!u) {
        navigate('/');
        return;
      }
      setUser(u);
      if (id) loadChallenge(id);
    });
    return unsubscribe;
  }, [id, navigate, loadChallenge]);

  // Ensure current user's profile exists
  useEffect(() => {
    if (user) {
      const ensureProfile = async () => {
        const profileRef = doc(db, 'profiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        if (!profileSnap.exists()) {
          console.log('Creating missing profile for user:', user.uid);
          await setDoc(profileRef, {
            username: user.email?.split('@')[0] || `user${user.uid.slice(0, 8)}`,
            currentTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      };
      ensureProfile();
    }
  }, [user]);

  const handleCheckIn = async () => {
    if (id && user) {
      await loadChallenge(id);
      // Also update myHasChecked status
      const checked = await hasCheckedInToday(id, user);
      setMyHasChecked(checked);
    }
  };

  const handleInvite = () => {
    const shareUrl = `${window.location.origin}/challenge/${id}`;
    navigator.clipboard.writeText(shareUrl);
    // TODO: Add toast notification
    alert('Invite link copied to clipboard!');
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

  if (!challenge || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Not found</div>
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
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {challenge.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Keep your streak alive! 🔥
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <div className="text-center">
              <CheckInButton
                challengeId={challenge.id}
                user={user}
                onCheckIn={handleCheckIn}
                disabled={myHasChecked}
              />
              {myHasChecked && (
                <p className="text-green-600 dark:text-green-400 mt-2">
                  ✅ Checked in today!
                </p>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Members ({members.length})
            </h2>
            <Button onClick={handleInvite} variant="secondary">
              Invite Friends
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Card className="flex items-center space-x-4">
                  <Avatar fallback={member.username.charAt(0).toUpperCase()} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {member.username}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        🔥 {member.currentStreak}
                      </span>
                      {member.hasCheckedToday && (
                        <Badge variant="success">Today</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
