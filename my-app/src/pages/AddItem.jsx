// Page for Adding an Item in the Frontend which is then sent to the Backend for storage 
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
import { AuthContext } from '../context/AuthContext'; // Adjust path if needed

const categories = [
  'Electronics', 
  'Furniture', // Is that something to lend/borrow?
  'Clothing', // Is that something to lend/borrow?
  'Books',
  'Sports', //Sporting equipment?
  'Toys',
  'Tools',
  'Other'
];


export default function AddItem() {
    const { user, token } = useContext(AuthContext);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Handle image selection and preview generation
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 3); // Limit to 3 images
        setImages(files);
        setImagePreviews(files.map(file => URL.createObjectURL(file)));
    };
    
    // Handle form submission to add a new item by sending data to the backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('price', parseFloat(price));
            formData.append('category', category);
            images.forEach((image) => {
                formData.append('images', image);
            });
            const response = await axios.post('/api/items', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Item added:', response.data);
            navigate('/'); // Redirect to home or items page after successful submission
        } catch (err) {
            console.error('Error adding item:', err);
            setError('Failed to add item. Please try again.');
        }
    };

    if (!user) {
        return (
            <Container className="py-5">
                <Alert variant="info" className="text-center">
                    Please <Link to="/login">log in</Link> or <Link to="/create-profile">create a profile</Link> to add an item.
                </Alert>
            </Container>
        );
    }
    
    return (
        <Container className="py-5">
            <Row className="justify-content-md-center">
                <Col md={8} lg={6}>
                    <Card className="shadow">
                        <Card.Body>
                            <h2 className="mb-4 text-center">Add Item</h2>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group controlId="formTitle" className="mb-3">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter item title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </Form.Group>
    
                                <Form.Group controlId="formDescription" className="mb-3">
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

                                <Form.Group controlId="formCategory" className="mb-3">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((cat, idx) => (
                                            <option key={idx} value={cat}>{cat}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group controlId="formPrice" className="mb-3">
                                    <Form.Label>Weekly Price</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Enter Weekly item price"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId="formImages" className="mb-3">
                                    <Form.Label>Images (max 3)</Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        required
                                    />
                                    <Form.Text muted>
                                        {images.length} image(s) selected. {images.length === 3 && "Maximum reached."}
                                    </Form.Text>
                                    <Row className="mt-2">
                                        {imagePreviews.map((src, idx) => (
                                            <Col xs={4} key={idx} className="mb-2">
                                                <Image src={src} thumbnail style={{ width: '100%', height: '100px', objectFit: 'cover' }} alt={`Preview ${idx + 1}`} />
                                            </Col>
                                        ))}
                                    </Row>
                                </Form.Group>
                                <div className="d-grid">
                                    <Button variant="primary" type="submit" size="lg">
                                        Add Item
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}