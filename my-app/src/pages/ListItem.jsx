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
import { Link } from 'react-router-dom';

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
    <Container fluid className="py-5 px-4">
      <h2 className="text-center mb-5">Item List</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row xs={1} sm={2} md={4} className="g-4">
        {items.map(item => (
          <Col key={item._id}>
            <Card className="h-100">
              {item.images?.length > 0 && (
                <Card.Img
                  variant="top"
                  src={`/api/items/${item._id}/image/0`}
                  style={{ height: '180px', objectFit: 'cover' }}
                />
              )}
              <Card.Body className="d-flex flex-column">
                <Card.Title className="h5">{item.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-secondary">
                  {item.category}
                </Card.Subtitle>
                <Card.Text className="flex-grow-1">
                  {item.description}
                </Card.Text>
                <Card.Text className="fw-bold mb-3">
                  ${item.price.toFixed(2)}
                </Card.Text>
                <Button
                  as={Link}
                  to={`/items/${item._id}`}
                  variant="primary"
                  className="mt-auto"
                >
                  View Item
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}