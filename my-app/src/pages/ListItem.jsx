// List all items in the database in a list format in the frontend application
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

export default function ListItem() {
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axios.get('/api/items');
                setItems(response.data);
            } catch (err) {
                console.error('Error fetching items:', err);
                setError('Failed to load items. Please try again.');
            }
        };
        fetchItems();
    }, []);

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md={8}>
                    <h2>Item List</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <ListGroup>
                        {items.map(item => (
                            <ListGroup.Item key={item._id}>
                                <Card>
                                    <Card.Body>
                                        <Card.Title>{item.title}</Card.Title>
                                        <Card.Text>{item.description}</Card.Text>
                                        <Card.Text>Price: ${item.price.toFixed(2)}</Card.Text>
                                        <Button variant="primary">View Details</Button>
                                    </Card.Body>
                                </Card>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>
            </Row>
        </Container>
    );
}