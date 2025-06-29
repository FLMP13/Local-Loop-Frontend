
import React from 'react';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
import { useAddItem } from '../hooks/useAddItem';

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
    const {
        user,
        title,
        description,
        price,
        category,
        images,
        imagePreviews,
        error,
        handleTitleChange,
        handleDescriptionChange,
        handlePriceChange,
        handleCategoryChange,
        handleImageChange,
        handleSubmit
    } = useAddItem();
 
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
                                        onChange={handleTitleChange}
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
                                        onChange={handleDescriptionChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="formCategory" className="mb-3">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Select
                                        value={category}
                                        onChange={handleCategoryChange}
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
                                        onChange={handlePriceChange}
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