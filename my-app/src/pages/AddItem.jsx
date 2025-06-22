// Page for Adding an Item in the Frontend which is then sent to the Backend for storage 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';


export default function AddItem() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [images, setImages] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        const response = await axios.post('/api/items', {
            title,
            description,
            price: parseFloat(price),
            category,
            images
        });
        console.log('Item added:', response.data);
        navigate('/'); // Redirect to home after successful submission
        } catch (err) {
        console.error('Error adding item:', err);
        setError('Failed to add item. Please try again.');
        }
    };
    
    return (
        <Container>
        <Row className="justify-content-md-center">
            <Col md={6}>
            <h2>Add Item</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter item title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                </Form.Group>
    
                <Form.Group controlId="formDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter item description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                </Form.Group>
    
                <Form.Group controlId="formPrice">
                <Form.Label>Price</Form.Label>
                <Form.Control
                    type="number"
                    placeholder="Enter item price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
                </Form.Group>
    
                <Form.Group controlId="formCategory">
                <Form.Label>Category</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter item category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                />
                </Form.Group>
                <Form.Group controlId="formImages">
                <Form.Label>Images (URLs)</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter image URLs separated by commas"
                    value={images.join(', ')}
                    onChange={(e) => setImages(e.target.value.split(',').map(url => url.trim()))}
                    required
                />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-3">Add Item</Button>
            </Form>
            </Col>
        </Row>
        </Container>
    );
}