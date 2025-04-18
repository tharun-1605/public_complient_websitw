import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

function CreatePost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null, // Change to null for file handling
    video: null, // Change to null for file handling
    latitude: null,
    longitude: null,
    useCurrentLocation: false,
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const fetchLocation = () => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          toast.success('Location fetched successfully!');
          setLocationLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Failed to fetch location. Please allow location access.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please allow location access.';
              break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable. Please ensure your device location services are enabled.';
                break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'An unknown error occurred while fetching location.';
              break;
          }
          toast.error(errorMessage);
          setLocationError(errorMessage);
          setLocationLoading(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
      setFormData((prev) => ({ ...prev, useCurrentLocation: false }));
    }
  };

  useEffect(() => {
    if (formData.useCurrentLocation) {
      fetchLocation();
    }
  }, [formData.useCurrentLocation]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      toast.error('Please enter your complaint');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Converts a file to base64
      const toBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      const imageBase64 = formData.image ? await toBase64(formData.image) : null;
      const videoBase64 = formData.video ? await toBase64(formData.video) : null;

      const payload = {
        title: formData.title,
        content: formData.content,
        image: imageBase64, // base64 string for image
        video: videoBase64, // base64 string for video
      };

      if (formData.useCurrentLocation && formData.latitude && formData.longitude) {
        payload.latitude = formData.latitude;
        payload.longitude = formData.longitude;
      }

      await axios.post('https://public-complient-websitw.onrender.com/api/posts', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      toast.success('Complaint posted successfully!');
      navigate('/user-dashboard');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to post complaint. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="bg-gray-900 bg-opacity-90 backdrop-blur-md rounded-xl shadow-2xl p-10 w-full max-w-lg">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Create a Complaint</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-300">Title</label>
            <input
              id="title"
              type="text"
              className="w-full p-3 mt-1 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-semibold text-gray-300">Description</label>
            <textarea
              id="content"
              rows={4}
              className="w-full p-3 mt-1 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your complaint..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-semibold text-gray-300">Upload Image (Optional)</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFormData({ ...formData, image: file });
                }
              }}
              className="w-full mt-1 p-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="video" className="block text-sm font-semibold text-gray-300">Upload Video (Optional)</label>
            <input
              type="file"
              id="video"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFormData({ ...formData, video: file });
                }
              }}
              className="w-full mt-1 p-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="useCurrentLocation"
            checked={formData.useCurrentLocation}
            onChange={(e) => setFormData({ ...formData, useCurrentLocation: e.target.checked })}
            className="rounded"
            disabled={locationLoading}
          />
          <label htmlFor="useCurrentLocation" className="text-sm font-semibold text-gray-300">
            {locationLoading ? 'Fetching location...' : 'Add current location'}
          </label>
          {locationError && !locationLoading && (
            <button
              type="button"
              onClick={fetchLocation}
              className="ml-3 px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-700 text-white"
            >
              Retry
            </button>
          )}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate('/user-dashboard')}
              className="px-5 py-2 rounded-lg text-white bg-gray-700 hover:bg-gray-600 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition font-bold"
            >
              Post Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
