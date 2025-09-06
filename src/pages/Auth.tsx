import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthForm from '../components/AuthForm';

export default function Auth() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-yellow-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
          >
            🔥 Streaks
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-gray-600 dark:text-gray-300"
          >
            Track Your Daily Challenges
          </motion.p>
        </div>
        <AuthForm onSuccess={handleSuccess} />
      </motion.div>
    </div>
  );
}
