import { doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from 'firebase/auth';

export interface Challenge {
  id: string;
  ownerUid: string;
  name: string;
  isGroup: boolean;
  visibility: 'public' | 'private';
  members: string[]; // Changed from object to array
  startDate: Date;
  streakPolicy: { window: 'calendar' | 'rolling24h'; resetHour: number };
  createdAt: Date;
  updatedAt: Date;
}

export async function createChallenge(
  user: User,
  name: string,
  isGroup: boolean,
  visibility: 'public' | 'private'
): Promise<string> {
  try {
    const challengeRef = doc(collection(db, 'challenges'));
    const challenge: Omit<Challenge, 'id'> = {
      ownerUid: user.uid,
      name,
      isGroup,
      visibility,
      members: [user.uid], // Changed from object to array
      startDate: new Date(),
      streakPolicy: { window: 'calendar', resetHour: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    console.log('Creating challenge:', challenge);
    await setDoc(challengeRef, challenge);
    console.log('Challenge created with ID:', challengeRef.id);

    // Create participant doc
    const participantRef = doc(db, 'challengeParticipants', `${challengeRef.id}_${user.uid}`);
    const participantData = {
      uid: user.uid,
      challengeId: challengeRef.id,
      currentStreak: 0,
      longestStreak: 0,
      lastCheckinDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    console.log('Creating participant:', participantData);
    await setDoc(participantRef, participantData);
    console.log('Participant created');

    return challengeRef.id;
  } catch (error) {
    console.error('Error in createChallenge:', error);
    throw error;
  }
}

export async function joinChallenge(challengeId: string, user: User): Promise<void> {
  const challengeRef = doc(db, 'challenges', challengeId);
  const challengeSnap = await getDoc(challengeRef);
  if (!challengeSnap.exists()) throw new Error('Challenge not found');

  const challenge = challengeSnap.data() as Challenge;
  if (challenge.members.includes(user.uid)) return; // Already member

  // Add to members
  await updateDoc(challengeRef, {
    members: [...challenge.members, user.uid],
    updatedAt: new Date(),
  });

  // Create participant doc if not exists
  const participantRef = doc(db, 'challengeParticipants', `${challengeId}_${user.uid}`);
  const participantSnap = await getDoc(participantRef);
  if (!participantSnap.exists()) {
    await setDoc(participantRef, {
      uid: user.uid,
      challengeId,
      currentStreak: 0,
      longestStreak: 0,
      lastCheckinDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export async function getUserChallenges(user: User): Promise<Challenge[]> {
  try {
    console.log('Getting challenges for user:', user.uid);
    const q = query(
      collection(db, 'challenges'),
      where('members', 'array-contains', user.uid)
    );
    console.log('Executing query...');
    const querySnapshot = await getDocs(q);
    console.log('Query completed, found', querySnapshot.docs.length, 'challenges');
    
    const challenges = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Challenge doc:', doc.id, data);
      return { id: doc.id, ...data } as Challenge;
    });
    
    console.log('Challenges:', challenges);
    return challenges;
  } catch (error) {
    console.error('Error in getUserChallenges:', error);
    throw error;
  }
}
