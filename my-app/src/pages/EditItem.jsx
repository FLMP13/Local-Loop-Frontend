// Page for Editing an Item in the Frontend which is then sent to the Backend for storage
// filepath: c:\Users\julia\seba\Frontend\my-app\src\pages\EditItem.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';

const categories = [
  'Electronics','Furniture','Clothing',
  'Books','Sports','Toys','Tools','Other'
];

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/items/${id}`)
      .then(r => {
        const it = r.data;
        setTitle(it.title);
        setDescription(it.description);
        setPrice(it.price);
        setCategory(it.category);
      })
      .catch(e => setError('Failed to load item'));
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.put(`/api/items/${id}`, { title, description, price, category });
      navigate(`/items/${id}`);
    } catch {
      setError('Update failed');
    }
  };

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="py-5">
      <h2 className="mb-4">Edit Item</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control value={title} onChange={e=>setTitle(e.target.value)} required/>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" rows={3}
            value={description} onChange={e=>setDescription(e.target.value)} required/>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Price</Form.Label>
          <Form.Control type="number" step="0.01"
            value={price} onChange={e=>setPrice(e.target.value)} required/>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select value={category}
            onChange={e=>setCategory(e.target.value)} required>
            <option value="">Select…</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </Form.Select>
        </Form.Group>
        <Button type="submit">Save Changes</Button>
      </Form>
    </Container>
  );
}