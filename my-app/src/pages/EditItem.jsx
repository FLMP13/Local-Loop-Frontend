import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useEditItem } from '../hooks/useEditItem';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';

// Needs to be adapted to categories
const categories = [
  'Electronics','Furniture','Clothing',
  'Books','Sports','Toys','Tools','Other'
];

export default function EditItem() {
  const {
    title,
    description,
    price,
    category,
    availability,
    error,
    loading,
    handleTitleChange,
    handleDescriptionChange,
    handlePriceChange,
    handleCategoryChange,
    handleAvailabilityChange,
    handleSubmit
  } = useEditItem();

  if (loading) return <p>Loading…</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="py-5">
      <h2 className="mb-4">Edit Item</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control value={title} onChange={handleTitleChange} required/>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" rows={3}
            value={description} onChange={handleDescriptionChange} required/>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Price</Form.Label>
          <Form.Control type="number" step="0.01"
            value={price} onChange={handlePriceChange} required/>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select value={category}
            onChange={handleCategoryChange} required>
            <option value="">Select…</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Availability</Form.Label>
          <DayPicker
            mode="range"
            selected={availability}
            onSelect={handleAvailabilityChange}
          />
        </Form.Group>
        <Button type="submit">Save Changes</Button>
      </Form>
    </Container>
  );
}