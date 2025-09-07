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

export async function generateInviteToken(challengeId: string, user: User): Promise<string> {
  try {
    console.log('Generating invite token for user:', user.uid, 'challenge:', challengeId);
    
    // Check if user is authenticated
    if (!user || !user.uid) {
      throw new Error('User not authenticated');
    }
    
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log('Generated token:', token);
    
    const inviteRef = doc(collection(db, 'invites'));
    const inviteData = {
      token,
      challengeId,
      createdBy: user.uid,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
    
    console.log('Creating invite document with data:', inviteData);
    
    // Try to create the document, with a small delay if needed
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        await setDoc(inviteRef, inviteData);
        console.log('Invite token created successfully');
        return token;
      } catch (error) {
        attempts++;
        console.warn(`Attempt ${attempts} failed:`, error);
        
        if (attempts >= maxAttempts) {
          throw error;
        }
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error('Failed to create invite token after multiple attempts');
  } catch (error) {
    console.error('Error generating invite token:', error);
    console.error('Error details:', {
      user: user ? user.uid : 'no user',
      challengeId
    });
    throw error;
  }
}

export async function getChallengeFromInviteToken(token: string): Promise<string | null> {
  try {
    const q = query(collection(db, 'invites'), where('token', '==', token));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    
    const invite = querySnapshot.docs[0].data();
    if (new Date() > invite.expiresAt.toDate()) return null; // Expired
    
    return invite.challengeId;
  } catch (error) {
    console.error('Error getting challenge from token:', error);
    return null;
  }
}

export async function getUserChallenges(user: User): Promise<Challenge[]> {
  try {
    console.log('Getting challenges for user:', user.uid);
    console.log('User authenticated:', !!user);
    console.log('User email:', user.email);
    
    const q = query(collection(db, 'challenges'), where('members', 'array-contains', user.uid));
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
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as { code?: string })?.code || 'Unknown code',
      user: user ? user.uid : 'no user'
    });
    throw error;
  }
}
