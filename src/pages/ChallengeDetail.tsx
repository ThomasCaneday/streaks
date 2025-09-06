import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthChange } from '../lib/auth';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { hasCheckedInToday } from '../lib/checkins';
import Navbar from '../components/Navbar';
import CheckInButton from '../components/CheckInButton';
import MemberRow from '../components/MemberRow';
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

  if (loading) return <div>Loading...</div>;
  if (!challenge || !user) return <div>Not found</div>;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{challenge.name}</h1>
        <CheckInButton challengeId={challenge.id} user={user} onCheckIn={handleCheckIn} disabled={myHasChecked} />
        <h2 className="text-xl mt-8 mb-4">Members</h2>
        {members.map((m, i) => (
          <MemberRow key={i} username={m.username} currentStreak={m.currentStreak} hasCheckedToday={m.hasCheckedToday} />
        ))}
      </div>
    </div>
  );
}
