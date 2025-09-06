import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

export default function Auth() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <AuthForm onSuccess={handleSuccess} />
    </div>
  );
}
