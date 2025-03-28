import React, { useEffect, useState } from 'react';
import { auth } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

function Profile() {
  const [userPosts, setUserPosts] = useState([]);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatar: '',
    bio: '',
    location: null,
    joinedDate: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await auth.getProfile();
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchUserPosts = async () => {
        const token = localStorage.getItem('token'); // Get the token from local storage
      try {
        console.log('Sending token:', token); // Log the token being sent
        const response = await axios.get('http://localhost:5000/api/user/posts', {
            headers: {
                'Authorization': `Bearer ${token}` // Include the token in the Authorization header
            }
        });
        if (Array.isArray(response.data)) {
            setUserPosts(response.data);
        } else {
            console.error('User posts response is not an array:', response.data);
            setUserPosts([]); // Set to empty array if response is not valid
        }
      } catch (error) {
        console.error('Error fetching user posts:', error);
        console.error('Error fetching user posts:', error);
        console.error('Error fetching user posts:', error);
      }
    };

    fetchUserPosts();
  }, []);

  const handleSaveProfile = async () => {
    try {
      await auth.updateProfile(editedProfile);
      setProfile(editedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.avatar}
                    onChange={(e) => setEditedProfile({ ...editedProfile, avatar: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Avatar URL"
                  />
                ) : (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="h-24 w-24 rounded-full"
                  />
                )}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Name"
                    />
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Email"
                    />
                    <textarea
                      value={editedProfile.bio}
                      onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Bio"
                      rows={3}
                    />
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                    <p className="mt-2 text-gray-700">{profile.bio}</p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="mt-4 ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Your Complaints</h3>
            <div className="mt-6 space-y-6">
              {userPosts.map(post => (
                <div key={post.id} className="border-b border-gray-200 pb-6">
                  <p className="text-gray-900">{post.content}</p>
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post"
                      className="mt-2 h-48 w-full object-cover rounded-lg"
                    />
                  )}
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex space-x-4">
                      <span>👍 {post.likes} likes</span>
                      <span>💬 {post.comments} comments</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                      ${post.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        post.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {post.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
