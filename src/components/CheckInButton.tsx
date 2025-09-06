import { useState } from 'react';
import { checkIn } from '../lib/checkins';
import Button from './Button';
import { motion } from 'framer-motion';
import type { User } from 'firebase/auth';

interface CheckInButtonProps {
  challengeId: string;
  user: User;
  onCheckIn: () => void;
  disabled: boolean;
}

export default function CheckInButton({ challengeId, user, onCheckIn, disabled }: CheckInButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await checkIn(challengeId, user);
      onCheckIn();
    } catch {
      alert('Error checking in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      <Button
        onClick={handleCheckIn}
        disabled={disabled || loading}
        size="lg"
        className="w-full max-w-xs mx-auto"
      >
        {loading ? 'Checking In...' : disabled ? 'Already Checked In' : 'Check In 🔥'}
      </Button>
    </motion.div>
  );
}
