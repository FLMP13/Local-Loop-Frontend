import { useState, useEffect } from 'react';
import axios from 'axios';

export function useItems(filters) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    const fetchItems = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        const res = await axios.get(`/api/items?${params.toString()}`);
        if (!isCancelled) setItems(res.data);
      } catch (err) {
        if (!isCancelled) setError('Failed to load items.');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    fetchItems();
    return () => { isCancelled = true; };
  }, [filters]);

  return { items, error, loading };
}
