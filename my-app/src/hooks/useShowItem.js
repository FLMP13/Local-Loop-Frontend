import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export function useShowItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/items/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setItem(response.data);
      } catch (err) {
        console.error('Error fetching item in hook:', err);
        setError('Failed to fetch item. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/items/${id}`);
      navigate('/');
    } catch (err) {
      console.error('Error deleting item in hook:', err);
      setError('Failed to delete item. Please try again.');
    } finally {
      setShowDeleteModal(false);
    }
  };

  return { 
    item, 
    error, 
    loading, 
    showDeleteModal,
    setShowDeleteModal,
    handleDeleteClick,
    handleDeleteConfirm
  };
}
