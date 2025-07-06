import React, { useContext, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useShowItem } from '../hooks/useShowItem';
import { AuthContext } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { Button, Card, Col, Container, Row, Alert } from 'react-bootstrap';

export default function ShowItem() {
    const { user } = useContext(AuthContext);
    const { item, loading, error, handleDelete } = useShowItem();
    const [selectedRange, setSelectedRange] = useState();

    const handleRequestBorrow = async () => {
        if (!selectedRange?.from || !selectedRange?.to) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                '/api/transactions/request',
                {
                    itemId: item._id,
                    requestedFrom: selectedRange.from.toISOString(),
                    requestedTo: selectedRange.to.toISOString()
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
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

    // returns true for days that should be disabled
    const disabledDays = day =>
        !item.availability?.some(
            ({ from, to }) => day >= new Date(from) && day <= new Date(to)
        );

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
                            <Card.Title>Availability</Card.Title>
                            <h3>Pick your lending dates</h3>
                            <DayPicker
                                mode="range"
                                selected={selectedRange}
                                onSelect={setSelectedRange}
                                disabled={[disabledDays]}
                            />
                            {selectedRange?.from && selectedRange?.to && (
                                <p>
                                    You’ve chosen{' '}
                                    {selectedRange.from.toLocaleDateString()} –{' '}
                                    {selectedRange.to.toLocaleDateString()}.<br />
                                    Weekly total: ${computeWeeklyCharge(selectedRange, item.price)}
                                </p>
                            )}
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
                                            onClick={handleRequestBorrow}
                                        >
                                            Request to Borrow
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

function computeWeeklyCharge({ from, to }, weeklyRate) {
    const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
    const weeks = Math.ceil(days / 7);
    return weeks * weeklyRate;
}