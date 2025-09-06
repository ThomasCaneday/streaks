import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';

export default function Landing() {
  const exampleStreaks = [
    { name: 'Morning Run', streak: 7, progress: 70 },
    { name: 'Read 30 mins', streak: 12, progress: 85 },
    { name: 'Drink Water', streak: 5, progress: 50 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-yellow-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Track Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">Streaks</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Stay Accountable. Level Up. Build habits with friends or solo.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/auth">
              <Button size="lg" className="text-xl px-12 py-4">
                Start Your First Streak
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Example Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {exampleStreaks.map((streak, index) => (
            <motion.div
              key={streak.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              <Card className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {streak.name}
                </h3>
                <div className="flex items-center justify-center mb-3">
                  <span className="text-2xl mr-2">🔥</span>
                  <span className="text-3xl font-bold text-pink-500">{streak.streak}</span>
                </div>
                <ProgressBar progress={streak.progress} />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Keep it up!
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
