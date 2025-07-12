import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export function useShowItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`/api/items/${id}`);
      navigate('/');
    } catch (err) {
      console.error('Error deleting item in hook:', err);
      setError('Failed to delete item. Please try again.');
    }
  };

  return { item, error, loading, handleDelete };
}
