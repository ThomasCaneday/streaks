import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthChange } from '../lib/auth';
import { joinChallenge, getChallengeFromInviteToken } from '../lib/challenges';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import Toast from '../components/Toast';
import { motion } from 'framer-motion';
import type { User } from 'firebase/auth';
import type { Challenge } from '../lib/challenges';

export default function InviteAccept() {
  const { token } = useParams<{ token: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();

  const loadInvite = useCallback(async (inviteToken: string) => {
    try {
      const challengeId = await getChallengeFromInviteToken(inviteToken);
      if (!challengeId) {
        setToastMessage('Invalid or expired invite link');
        setShowToast(true);
        navigate('/app');
        return;
      }
      
      const challengeSnap = await getDoc(doc(db, 'challenges', challengeId));
      if (!challengeSnap.exists()) {
        setToastMessage('Challenge not found');
        setShowToast(true);
        navigate('/app');
        return;
      }
      const ch = { id: challengeSnap.id, ...challengeSnap.data() } as Challenge;
      setChallenge(ch);
      setLoading(false);
    } catch (error) {
      console.error('Error loading invite:', error);
      setToastMessage('Error loading invite');
      setShowToast(true);
      navigate('/app');
    }
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      if (!u) {
        navigate('/auth');
        return;
      }
      setUser(u);
    });
    return unsubscribe;
  }, [navigate]);

  useEffect(() => {
    if (token && user) {
      loadInvite(token);
    }
  }, [token, user, loadInvite]);

  const handleJoin = async () => {
    if (!challenge || !user) return;

    setJoining(true);
    try {
      await joinChallenge(challenge.id, user);
      setToastMessage('Successfully joined the challenge!');
      setShowToast(true);
      setTimeout(() => navigate(`/challenge/${challenge.id}`), 2000);
    } catch (error) {
      console.error('Error joining challenge:', error);
      setToastMessage('Error joining challenge. Please try again.');
      setShowToast(true);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading invite...</div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Invalid invite link</div>
        </div>
      </div>
    );
  }

  const isMember = challenge.members.includes(user!.uid);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <Card>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                You've been invited to join
              </h1>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
                {challenge.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {challenge.members.length} member{challenge.members.length !== 1 ? 's' : ''} • {challenge.visibility === 'public' ? 'Public' : 'Private'} challenge
              </p>
              {isMember ? (
                <div>
                  <p className="text-green-600 dark:text-green-400 mb-4">
                    You're already a member of this challenge!
                  </p>
                  <Button onClick={() => navigate(`/challenge/${challenge.id}`)}>
                    View Challenge
                  </Button>
                </div>
              ) : (
                <Button onClick={handleJoin} disabled={joining}>
                  {joining ? 'Joining...' : 'Accept Invite'}
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
