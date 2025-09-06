import { useState } from 'react';
import { checkIn } from '../lib/checkins';
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
    <button
      onClick={handleCheckIn}
      disabled={disabled || loading}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
    >
      {loading ? 'Checking In...' : 'Check In'}
    </button>
  );
}
