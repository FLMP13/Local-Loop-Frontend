import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Container, Card, Button, Alert, Form } from 'react-bootstrap';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function EditTransaction() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [transaction, setTransaction] = useState(null);
  const [item, setItem] = useState(null);
  const [selectedRange, setSelectedRange] = useState();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransaction = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransaction(data);
        setSelectedRange({
          from: new Date(data.requestedFrom),
          to: new Date(data.requestedTo)
        });
        setMessage(data.message || '');
        // Fetch item if not populated
        if (data.item && data.item.availability) {
          setItem(data.item);
        } else if (data.item?._id) {
          // Fetch item details
          const itemRes = await fetch(`/api/items/${data.item._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (itemRes.ok) {
            setItem(await itemRes.json());
          }
        }
      } else {
        setError('Failed to load transaction.');
      }
    };
    fetchTransaction();
  }, [id]);

  // Disable days not in any available range
  const disabledDays = (day) => {
    if (!item?.availability) return false;
    return !item.availability.some(({ from, to }) =>
      day >= new Date(from) && day <= new Date(to)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRange?.from || !selectedRange?.to) {
      setError('Please select a valid time frame.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/transactions/${id}/edit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          requestedFrom: selectedRange.from,
          requestedTo: selectedRange.to,
          message
        })
      });
      if (!res.ok) throw new Error('Failed to update transaction');
      navigate(`/transactions/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update transaction');
    }
  };

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!transaction) return <p>Loading...</p>;

  return (
    <Container className="py-5">
      <Card>
        <Card.Body>
          <Card.Title>Edit Transaction</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Requested Time Frame</Form.Label>
              <DayPicker
                mode="range"
                selected={selectedRange}
                onSelect={setSelectedRange}
                disabled={disabledDays}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message (optional)</Form.Label>
              <Form.Control
                as="textarea"
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </Form.Group>
            <Button type="submit" variant="primary">Save Changes</Button>
            <Button variant="secondary" className="ms-2" onClick={() => navigate(-1)}>Cancel</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}