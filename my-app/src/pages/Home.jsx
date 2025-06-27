// Make this a welcomning page for the frontend application of our local loop application where all current items are listed and a button to add a new item is provided
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get('/api/items');
        setItems(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load items.');
      }
    };
    fetchItems();
  }, []);

  return (
    <>
      {/* Full-width hero section with a light background */}
      <Container fluid className="bg-light text-dark text-center py-5">
        <h1 className="display-4">Welcome to the Local Loop</h1>
        <p className="lead mb-4">Share, lend, and discover items in your community</p>
        <Button
          as={Link}
          to="/create-profile"
          size="lg"
          variant="primary" // primary button on light background
          className="mb-3"
        >
          Create Profile
        </Button>
        <div className="mb-3"></div>
        <Button
          as={Link}
          to="/login"
          size="lg"
          variant="primary" // primary button on light background
          className="mb-3"
        >
          Login
        </Button>
        <div className="mb-3"></div>
        <Button
          as={Link}
          to="/add-item"
          size="lg"
          variant="primary" // primary button on light background
          className="mb-3"
        >
          + Add New Item
        </Button>
      </Container>

      {/* Full-width item list */}
      <Container fluid className="py-5 px-3">
        <h2 className="text-center mb-4">Current Items</h2>
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Item grid */}
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
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
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {item.category}
                  </Card.Subtitle>
                  <Card.Text className="flex-grow-1">
                    {item.description.substring(0, 60)}…
                  </Card.Text>
                  <div className="mb-2">
                    <strong>${item.price.toFixed(2)}</strong>
                  </div>
                  <Button
                    as={Link}
                    to={`/items/${item._id}`}
                    variant="primary"
                    className="mt-auto"
                  >
                    View
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {!items.length && !error && (
          <p className="text-center mt-4">No items found.</p>
        )}
      </Container>
    </>
  );
}