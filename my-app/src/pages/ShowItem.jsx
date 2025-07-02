import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { useShowItem } from '../hooks/useShowItem';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';

export default function ShowItem() {
    const { user } = useContext(AuthContext);
    const { item, error, loading, handleDelete } = useShowItem();

    const handleRequestLend = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/transactions/request', { itemId: item._id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Request sent!');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to send request.');
        }
    };

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (loading) {
        return <p>Loading…</p>;
    }

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <h2>{item.title}</h2>
                    <Card>
                        <Card.Body>
                            <Card.Title>Description</Card.Title>
                            <Card.Text>{item.description}</Card.Text>

                            <Card.Title>Price</Card.Title>
                            <Card.Text>${item.price}</Card.Text>

                            <Card.Title>Category</Card.Title>
                            <Card.Text>{item.category}</Card.Text>

                            <Card.Title>Owner</Card.Title>
                            <Card.Text>
                                {item.owner?.nickname || item.owner?.email || 'Unknown'}
                            </Card.Text>

                            <Card.Title>Zip Code</Card.Title>
                            <Card.Text>
                                {item.owner?.zipCode || 'Unknown'}
                            </Card.Text>

                            <Card.Title>Images</Card.Title>
                            <Row>
                                {item.images.map((_, index) => (
                                    <Col key={index} md={4}>
                                        <Card.Img
                                            variant="top"
                                            src={`/api/items/${item._id}/image/${index}`}
                                            alt={`Item image ${index + 1}`}
                                        />
                                    </Col>
                                ))}
                            </Row>
                            <div className="d-flex justify-content-between mt-4">
                                <Button variant="secondary" onClick={() => window.history.back()}>
                                    Back
                                </Button>
                                
                                {user?.id === item.owner?._id ? (
                                    // if item is owned by the user
                                    <div>
                                        <Button
                                            variant="warning"
                                            as={Link}
                                            to={`/items/${item._id}/edit`}
                                            className="me-2"
                                        >
                                            Edit Item
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={handleDelete}
                                        >
                                            Delete Item
                                        </Button>
                                    </div>
                                ) : (
                                    // if item is not owned by the user
                                    user && (
                                        <Button
                                            variant="secondary"
                                            onClick={handleRequestLend}
                                        >
                                            Request to Lend
                                        </Button>
                                    )
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}