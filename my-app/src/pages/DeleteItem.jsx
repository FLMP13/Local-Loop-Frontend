// DeleteItem component to delete an item in the frondend application from the database via the backend API
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

export default function DeleteItem() {
    const [itemId, setItemId] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleDelete = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.delete(`/api/items/${itemId}`);
            console.log('Item deleted:', response.data);
            setSuccess('Item deleted successfully.');
            setError('');
            setItemId(''); // Clear the input field
        } catch (err) {
            console.error('Error deleting item:', err);
            setError('Failed to delete item. Please try again.');
            setSuccess('');
        }
    };

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <h2>Delete Item</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form onSubmit={handleDelete}>
                        <Form.Group controlId="formItemId">
                            <Form.Label>Item ID</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter item ID to delete"
                                value={itemId}
                                onChange={(e) => setItemId(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="danger" type="submit" className="mt-3">
                            Delete Item
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}