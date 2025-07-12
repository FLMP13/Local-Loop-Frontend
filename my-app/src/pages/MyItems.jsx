// List all items in the database in a list format in the frontend application
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { AuthContext } from '../context/AuthContext'; // Adjust the path if needed
import { useMyItems } from '../hooks/useMyItems';

export default function MyItems({ statusFilter, title = "My Items" }) {
    const { user } = useContext(AuthContext);
    const { items, error, loading } = useMyItems(statusFilter);

    if (!user) {
        return (
            <Container fluid className="px-md-5" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
                <div className="hero-section bg-light p-4 p-md-5 mb-4">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-md-8 text-center">
                            <h1 className="display-5 fw-bold mb-3">My Items</h1>
                            <p className="lead text-muted mb-4">
                                Please log in to view and manage your shared items
                            </p>
                            <div className="d-flex gap-3 justify-content-center">
                                <Button 
                                    as={Link} 
                                    to="/login" 
                                    variant="primary" 
                                    size="lg"
                                    className="rounded-pill px-4"
                                >
                                    Log In
                                </Button>
                                <Button 
                                    as={Link} 
                                    to="/create-profile" 
                                    variant="outline-primary" 
                                    size="lg"
                                    className="rounded-pill px-4"
                                >
                                    Create Profile
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-5 px-4">
            <h2 className="text-center mb-5">My Items</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" style={{ color: 'var(--brand)' }} />
                    <p className="mt-3 text-muted">Loading your items...</p>
                </div>
            ) : items.length === 0 ? (
              <Row className="justify-content-center">
                <Col md={6} className="text-center">
                  <div className="py-5">
                    <h4 className="mb-4 text-muted">No items found</h4>
                    <p className="mb-4 text-muted">
                      You haven't added any items yet. Start by adding your first item to share with the community!
                    </p>
                    <Button
                      as={Link}
                      to="/add-item"
                      variant="primary"
                      size="lg"
                      className="px-4"
                    >
                      Add Your First Item
                    </Button>
                  </div>
                </Col>
              </Row>
            ) : (
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
                                <Card.Text>
                                    <strong>Status:</strong> {item.status}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Owner:</strong>{' '}
                                    {item.owner
                                        ? (item.owner.nickname
                                            || `${item.owner.firstName} ${item.owner.lastName}`)
                                        : 'Unknown'}
                                </Card.Text>
                                <Card.Text className="flex-grow-1">
                                    {item.description}
                                </Card.Text>
                                <Card.Text className="fw-bold mb-3">
                                    €{item.price.toFixed(2)}/week
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
            )}
        </Container>
    );
}