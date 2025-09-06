interface MemberRowProps {
  username: string;
  currentStreak: number;
  hasCheckedToday: boolean;
}

export default function MemberRow({ username, currentStreak, hasCheckedToday }: MemberRowProps) {
  return (
    <div className="flex justify-between items-center p-2 border-b">
      <span>{username}</span>
      <div className="flex items-center space-x-2">
        <span>Streak: {currentStreak}</span>
        <div className={`w-4 h-4 rounded-full ${hasCheckedToday ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>
    </div>
  );
}
