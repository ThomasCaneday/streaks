import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, deleteUser } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { getUserTz } from './time';

export async function signUp(email: string, password: string, username: string): Promise<void> {
  try {
    console.log('Starting signup process for:', email, username);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('User created:', user.uid);

    // Wait a moment for auth to propagate
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Reserve username
    console.log('Reserving username:', username);
    const usernameRef = doc(db, 'usernames', username);
    const usernameSnap = await getDoc(usernameRef);
    if (usernameSnap.exists()) {
      console.log('Username already taken');
      throw new Error('Username already taken');
    }
    await setDoc(usernameRef, { uid: user.uid });
    console.log('Username reserved successfully');

    // Create profile
    console.log('Creating profile for user:', user.uid);
    const profileRef = doc(db, 'profiles', user.uid);
    await setDoc(profileRef, {
      username,
      currentTimezone: getUserTz(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Profile created successfully');
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function deleteAccount(user: User): Promise<void> {
  try {
    console.log('Starting account deletion for user:', user.uid);

    // Get user's profile to find username
    const profileRef = doc(db, 'profiles', user.uid);
    const profileSnap = await getDoc(profileRef);
    let username = null;
    if (profileSnap.exists()) {
      const profileData = profileSnap.data();
      username = profileData.username;
    }

    // Delete username reservation if it exists
    if (username) {
      const usernameRef = doc(db, 'usernames', username);
      try {
        await deleteDoc(usernameRef);
        console.log('Username reservation deleted');
      } catch (error) {
        console.warn('Error deleting username reservation:', error);
      }
    }

    // Get all challenges the user is a member of
    const challengesQuery = query(
      collection(db, 'challenges'),
      where('members', 'array-contains', user.uid)
    );
    const challengesSnap = await getDocs(challengesQuery);

    // Remove user from each challenge and delete participant data
    for (const challengeDoc of challengesSnap.docs) {
      const challengeId = challengeDoc.id;
      const challengeData = challengeDoc.data();

      // Remove user from challenge members array
      const updatedMembers = challengeData.members.filter((uid: string) => uid !== user.uid);
      await updateDoc(challengeDoc.ref, {
        members: updatedMembers,
        updatedAt: new Date(),
      });

      // Delete participant document
      const participantRef = doc(db, 'challengeParticipants', `${challengeId}_${user.uid}`);
      try {
        await deleteDoc(participantRef);
        console.log('Participant data deleted for challenge:', challengeId);
      } catch (error) {
        console.warn('Error deleting participant data for challenge:', challengeId, error);
      }

      // Delete all check-ins for this challenge
      const checkinsQuery = query(
        collection(db, 'checkins'),
        where('uid', '==', user.uid),
        where('challengeId', '==', challengeId)
      );
      const checkinsSnap = await getDocs(checkinsQuery);
      for (const checkinDoc of checkinsSnap.docs) {
        try {
          await deleteDoc(checkinDoc.ref);
        } catch (error) {
          console.warn('Error deleting check-in:', checkinDoc.id, error);
        }
      }
      console.log('Check-ins deleted for challenge:', challengeId);
    }

    // Delete user's profile
    try {
      await deleteDoc(profileRef);
      console.log('Profile deleted');
    } catch (error) {
      console.warn('Error deleting profile:', error);
    }

    // Delete the Firebase Auth user account
    await deleteUser(user);
    console.log('Firebase Auth user deleted');

  } catch (error) {
    console.error('Error during account deletion:', error);
    throw error;
  }
}
