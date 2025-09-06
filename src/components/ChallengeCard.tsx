import { Link } from 'react-router-dom';

interface ChallengeCardProps {
  id: string;
  name: string;
  currentStreak: number;
  hasCheckedToday: boolean;
}

export default function ChallengeCard({ id, name, currentStreak, hasCheckedToday }: ChallengeCardProps) {
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-lg font-bold">{name}</h3>
      <p>Current Streak: {currentStreak}</p>
      <p>Checked Today: {hasCheckedToday ? 'Yes' : 'No'}</p>
      <Link to={`/challenge/${id}`} className="text-blue-600 hover:underline">Open</Link>
    </div>
  );
}
