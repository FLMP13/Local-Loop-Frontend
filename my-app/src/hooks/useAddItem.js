import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export function useAddItem() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitError, setLimitError] = useState(null);

  const handleTitleChange = e => setTitle(e.target.value);
  const handleDescriptionChange = e => setDescription(e.target.value);
  const handlePriceChange = e => setPrice(e.target.value);
  const handleCategoryChange = e => setCategory(e.target.value);

  const handleImageChange = e => {
    const files = Array.from(e.target.files).slice(0, 3);
    setImages(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleImageRemove = (indexToRemove) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[indexToRemove]);
    
    const newImages = images.filter((_, index) => index !== indexToRemove);
    const newPreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleAvailabilityChange = range => {
    setAvailability(range);
  };

  const handleUpgrade = async (plan) => {
    try {
      await axios.post('/api/users/me/premium/upgrade', { plan }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // After successful upgrade, try to submit the item again
      setShowUpgradeModal(false);
      setLimitError(null);
      setError('');
      
      // Re-attempt the item creation
      await submitItem();
    } catch (err) {
      console.error('Error upgrading to premium:', err);
      throw new Error('Failed to upgrade to premium');
    }
  };

  const submitItem = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', parseFloat(price));
    formData.append('category', category);
    images.forEach(img => formData.append('images', img));

    if (availability?.from && availability?.to) {
      formData.append(
        'availability',
        JSON.stringify({
          from: availability.from.toISOString(),
          to:   availability.to.toISOString()
        })
      );
    }

    const response = await axios.post('/api/items', formData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLimitError(null);
    
    try {
      await submitItem();
      navigate('/my-items');
    } catch (err) {
      console.error('Error adding item in hook:', err.response?.data || err);
      
      // Check if it's a listing limit error
      if (err.response?.status === 403 && err.response?.data?.code === 'LISTING_LIMIT_EXCEEDED') {
        setLimitError(err.response.data.details);
        setShowUpgradeModal(true);
      } else {
        setError('Failed to add item. Please try again.');
      }
    }
  };

  return {
    user,
    title,
    description,
    price,
    category,
    images,
    imagePreviews,
    error,
    availability,
    showUpgradeModal,
    limitError,
    handleTitleChange,
    handleDescriptionChange,
    handlePriceChange,
    handleCategoryChange,
    handleImageChange,
    handleImageRemove,
    handleAvailabilityChange,
    handleSubmit,
    handleUpgrade,
    setShowUpgradeModal
  };
}
