import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

export function useItems(filters) {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const fetchItems = async () => {
      try {
        const token = user?.token || localStorage.getItem('token');
        const response = await axios.get('/api/items', {
          params: filters,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setItems(response.data);
      } catch (err) {
        setError('Failed to fetch items');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [filters, user]);

  return { items, loading, error };
}
