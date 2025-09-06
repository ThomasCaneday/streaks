import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from './firebase';

export interface LeaderboardEntry {
  username: string;
  challengeName: string;
  currentStreak: number;
  selectedAvatar?: string;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  // Get top 100 participants by currentStreak
  const q = query(
    collection(db, 'challengeParticipants'),
    orderBy('currentStreak', 'desc'),
    limit(100)
  );
  const querySnapshot = await getDocs(q);

  const entries: LeaderboardEntry[] = [];
  for (const docSnap of querySnapshot.docs) {
    const participant = docSnap.data();
    // Get challenge
    const challengeSnap = await getDocs(query(collection(db, 'challenges'), where('__name__', '==', participant.challengeId)));
    if (challengeSnap.empty) continue;
    const challenge = challengeSnap.docs[0].data();
    if (challenge.visibility !== 'public') continue;

    // Get profile
    const profileSnap = await getDocs(query(collection(db, 'profiles'), where('__name__', '==', participant.uid)));
    if (profileSnap.empty) continue;
    const profile = profileSnap.docs[0].data();

    entries.push({
      username: profile.username,
      challengeName: challenge.name,
      currentStreak: participant.currentStreak,
      selectedAvatar: profile.selectedAvatar,
    });
  }

  return entries;
}
