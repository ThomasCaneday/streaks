import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { ymdInTz, getUserTz } from './time';
import type { User } from 'firebase/auth';

export async function checkIn(challengeId: string, user: User): Promise<void> {
  const tz = getUserTz();
  const now = new Date();
  const today = ymdInTz(now, tz);

  const checkinId = `${challengeId}_${user.uid}_${today}`;
  const checkinRef = doc(db, 'checkins', checkinId);

  console.log('Checking in for challenge:', challengeId, 'user:', user.uid);

  // Check if already checked in
  const checkinSnap = await getDoc(checkinRef);
  if (checkinSnap.exists()) {
    console.log('Already checked in today');
    return;
  }

  console.log('Starting transaction for check-in');
  await runTransaction(db, async (transaction) => {
    const participantRef = doc(db, 'challengeParticipants', `${challengeId}_${user.uid}`);
    console.log('Getting participant document:', participantRef.path);
    const participantSnap = await transaction.get(participantRef);
    
    let participant;
    if (!participantSnap.exists()) {
      console.log('Participant document not found, creating it');
      participant = {
        uid: user.uid,
        challengeId,
        currentStreak: 0,
        longestStreak: 0,
        lastCheckinDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      transaction.set(participantRef, participant);
    } else {
      participant = participantSnap.data();
      console.log('Participant data:', participant);
    }

    const lastDate = participant.lastCheckinDate;
    let currentStreak = 1;
    if (lastDate) {
      const yesterday = ymdInTz(new Date(now.getTime() - 24 * 60 * 60 * 1000), tz);
      if (lastDate === yesterday) {
        currentStreak = participant.currentStreak + 1;
      }
    }

    console.log('Creating check-in document:', checkinId);
    transaction.set(checkinRef, {
      uid: user.uid,
      challengeId,
      date: today,
      at: serverTimestamp(),
    });

    console.log('Updating participant document with streak:', currentStreak);
    transaction.update(participantRef, {
      currentStreak,
      longestStreak: Math.max(participant.longestStreak || 0, currentStreak),
      lastCheckinDate: today,
      updatedAt: serverTimestamp(),
    });
  });
  console.log('Check-in transaction completed successfully');
}

export async function hasCheckedInToday(challengeId: string, user: User): Promise<boolean> {
  const tz = getUserTz();
  const today = ymdInTz(new Date(), tz);
  const checkinId = `${challengeId}_${user.uid}_${today}`;
  const checkinSnap = await getDoc(doc(db, 'checkins', checkinId));
  return checkinSnap.exists();
}
