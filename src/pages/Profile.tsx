import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthChange, logOut } from '../lib/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import { motion } from 'framer-motion';
import type { User } from 'firebase/auth';

interface ProfileData {
  username: string;
  currentTimezone: string;
  avatarUrl?: string;
  selectedAvatar?: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<ProfileData | null>(null);
  const navigate = useNavigate();

  // Available avatars
  const availableAvatars = [
    'avatar_0_0.png', 'avatar_0_1.png', 'avatar_0_2.png',
    'avatar_1_0.png', 'avatar_1_1.png', 'avatar_1_2.png',
    'avatar_2_0.png', 'avatar_2_1.png', 'avatar_2_2.png'
  ];

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      if (!u) {
        navigate('/');
        return;
      }
      setUser(u);
      loadProfile(u);
    });
    return unsubscribe;
  }, [navigate]);

  const loadProfile = async (u: User) => {
    try {
      const profileRef = doc(db, 'profiles', u.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const data = profileSnap.data() as ProfileData;
        setProfile(data);
        setTempProfile(data);
      } else {
        // Create default profile
        const defaultProfile: ProfileData = {
          username: u.email?.split('@')[0] || `user${u.uid.slice(0, 8)}`,
          currentTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        await updateDoc(profileRef, { ...defaultProfile });
        setProfile(defaultProfile);
        setTempProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !tempProfile) return;
    
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileRef, { ...tempProfile });
      setProfile(tempProfile);
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // TODO: Implement account deletion
        alert('Account deletion not yet implemented');
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Profile not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Profile
          </h1>

          <Card className="mb-6">
            <div className="text-center mb-6">
              <Avatar
                src={profile.selectedAvatar ? `/avatars/${profile.selectedAvatar}` : undefined}
                size="lg"
                fallback={profile.username.charAt(0).toUpperCase()}
                className="mx-auto mb-4"
              />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {profile.username}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={tempProfile?.username || ''}
                    onChange={(e) => setTempProfile(prev => prev ? { ...prev, username: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timezone
                </label>
                {editing ? (
                  <select
                    value={tempProfile?.currentTimezone || ''}
                    onChange={(e) => setTempProfile(prev => prev ? { ...prev, currentTimezone: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.currentTimezone}</p>
                )}
              </div>

              {editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Choose Avatar
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {availableAvatars.map((avatar) => (
                      <button
                        key={avatar}
                        onClick={() => setTempProfile(prev => prev ? { ...prev, selectedAvatar: avatar } : null)}
                        className={`relative p-2 rounded-lg border-2 transition-all ${
                          tempProfile?.selectedAvatar === avatar
                            ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <img
                          src={`/avatars/${avatar}`}
                          alt={`Avatar ${avatar}`}
                          className="w-16 h-16 rounded-full mx-auto"
                        />
                        {tempProfile?.selectedAvatar === avatar && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Click on an avatar to select it
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-4 mt-6">
              {editing ? (
                <>
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </Card>

          {/* Milestones Section */}
          <Card className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Milestone Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">🔥 7 Day Streak</Badge>
              <Badge variant="warning">🏆 Top 10</Badge>
              <Badge variant="info">👥 Group Leader</Badge>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-800">
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
              Danger Zone
            </h3>
            <div className="space-y-4">
              <Button variant="danger" onClick={handleLogout}>
                Sign Out
              </Button>
              <Button variant="danger" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
