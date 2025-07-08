import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export function useEditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`/api/items/${id}`);
        const it = res.data;
        setTitle(it.title);
        setDescription(it.description);
        setPrice(it.price);
        setCategory(it.category);
        setAvailability(it.availability || []);
      } catch (e) {
        setError('Failed to load item');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleTitleChange = e => setTitle(e.target.value);
  const handleDescriptionChange = e => setDescription(e.target.value);
  const handlePriceChange = e => setPrice(e.target.value);
  const handleCategoryChange = e => setCategory(e.target.value);
  const handleAvailabilityChange = ranges => {
    setAvailability(ranges);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const updated = {
      title,
      description,
      price,
      category,
      availability
    };
    await axios.put(`/api/items/${id}`, updated);
    navigate('/');
  };

  return {
    title,
    description,
    price,
    category,
    error,
    loading,
    availability,
    handleTitleChange,
    handleDescriptionChange,
    handlePriceChange,
    handleCategoryChange,
    handleAvailabilityChange,
    handleSubmit
  };
}
