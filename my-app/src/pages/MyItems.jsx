// List all items in the database in a list format in the frontend application
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { AuthContext } from '../context/AuthContext'; // Adjust the path if needed
import { useMyItems } from '../hooks/useMyItems';

export default function MyItems({ statusFilter, title = "My Items" }) {
    const { user } = useContext(AuthContext);
    const { items, error, loading } = useMyItems(statusFilter);

    if (!user) {
        return (
            <Container className="py-5">
                <Alert variant="info" className="text-center">
                    Please <Link to="/login">log in</Link> or <Link to="/create-profile">create a profile</Link> to view your items.
                </Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="py-5 px-4">
            <h2 className="text-center mb-5">My Items</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {loading ? (
              <p>Loading…</p>
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
            )}
        </Container>
    );
}