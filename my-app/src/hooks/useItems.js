import { useState, useEffect, useContext } from 'react';  
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx'; 

export function useItems(filters) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const { user } = useContext(AuthContext);
  const token   = user?.token;

  useEffect(() => {
    let isCancelled = false;

    const fetchItems = async () => {
      setLoading(true);
      setError('');

      try {
        const hasRadius = !!filters.radius;
        const baseUrl   = hasRadius ? '/api/items/nearby' : '/api/items';
        
        // Build query parameters from filters
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });

        // Fetch with auth header if we have a token
        const res = await axios.get(
          `${baseUrl}?${params.toString()}`,
          token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {}
        ); 

        if (!isCancelled) setItems(res.data);
      } catch (err) {
        if (!isCancelled) setError('Failed to load items.');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    fetchItems();
    return () => { isCancelled = true; };
  }, [filters, token]);

  return { items, error, loading };
}
