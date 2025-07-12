import { useState, useEffect } from 'react';
import axios from 'axios';

export function useMyItems(statusFilter) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/items/mine', {
          headers: { Authorization: `Bearer ${token}` }
        });
        let filtered = response.data;
        if (statusFilter) {
          filtered = filtered.filter(item => item.status === statusFilter);
        }
        setItems(filtered);
      } catch (err) {
        console.error('Error fetching items in hook:', err);
        setError('Failed to load items. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [statusFilter]);

  return { items, error, loading };
}
