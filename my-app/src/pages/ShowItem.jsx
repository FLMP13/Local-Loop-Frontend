// Page for showing the item with details and images, they should be fetched frm the backend and displayed when someone clicks on show details
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

export default function ShowItem() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await axios.get(`/api/items/${id}`);
                setItem(response.data);
            } catch (err) {
                console.error('Error fetching item:', err);
                setError('Failed to fetch item. Please try again.');
            }
        };
        fetchItem();
    }, [id]);

    const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`/api/items/${id}`);
      navigate('/'); // or '/list-item'
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again.');
    }
  };

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!item) {
        return <p>Loading...</p>;
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
                              <Button variant="secondary" onClick={() => navigate(-1)}>
                                Back
                              </Button>
                              <Button
                                variant="warning"
                                as={Link}
                                to={`/items/${id}/edit`}
                              >
                                Edit Item
                              </Button>
                              <Button variant="danger" onClick={handleDelete}>
                                Delete Item
                              </Button>
                            </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}