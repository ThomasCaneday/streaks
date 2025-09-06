import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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
