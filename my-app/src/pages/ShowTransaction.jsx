import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

export default function ShowTransaction() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/transactions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch transaction');
        const data = await res.json();
        setTransaction(data);
      } catch (err) {
        setError('Failed to load transaction.');
      }
    };
    fetchTransaction();
  }, [id]);

  const handleAction = async (action) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/transactions/${transaction._id}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refetch transaction data
      const res = await fetch(`/api/transactions/${transaction._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTransaction(data);
    } catch (err) {
      // Optionally handle error
    }
    setUpdating(false);
  };

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!transaction) return <p>Loading…</p>;

  const { item, status, borrower, lender, requestDate } = transaction;

  return (
    <Container className="py-5">
      <h2 className="mb-4">Transaction Details</h2>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Transaction Info</Card.Title>
          <Card.Text>
            Status: {status}<br />
            Borrower: {borrower?.nickname || borrower?.email}<br />
            Lender: {lender?.nickname || lender?.email || item?.owner?.nickname || item?.owner?.email}<br />
            Requested: {new Date(requestDate).toLocaleString()}
          </Card.Text>
          {user?.id === transaction.lender?._id && transaction.status === 'requested' && (
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button
                variant="success"
                disabled={updating}
                onClick={() => handleAction('accept')}
              >
                Accept
              </Button>
              <Button
                variant="danger"
                disabled={updating}
                onClick={() => handleAction('decline')}
              >
                Decline
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
      {item && (
        <Card>
          <Card.Body>
            <Card.Title>{item.title}</Card.Title>
            <Card.Text>
              <strong>Description:</strong> {item.description}<br />
              <strong>Price:</strong> ${item.price}<br />
              <strong>Category:</strong> {item.category}<br />
              <strong>Owner:</strong> {item.owner?.nickname || item.owner?.email}<br />
              <strong>Zip Code:</strong> {item.owner?.zipCode}<br />
            </Card.Text>
            <Row>
              {item.images?.map((_, idx) => (
                <Col key={idx} md={4}>
                  <Card.Img
                    variant="top"
                    src={`/api/items/${item._id}/image/${idx}`}
                    alt={`Item image ${idx + 1}`}
                  />
                </Col>
              ))}
            </Row>
            <Button as={Link} to={`/items/${item._id}`} className="mt-3" variant="primary">
              View Item
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}