import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

export default function ReviewModal({ show, onHide, transaction, userRole, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          transactionId: transaction._id,
          rating,
          comment
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit review');
      }

      onReviewSubmitted();
      onHide();
      setRating(5);
      setComment('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const revieweeRole = userRole === 'lender' ? 'borrower' : 'lender';
  const revieweeName = userRole === 'lender' 
    ? (transaction.borrower?.nickname || transaction.borrower?.email)
    : (transaction.lender?.nickname || transaction.lender?.email);

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Review {revieweeRole}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <p>
            Rate your experience with <strong>{revieweeName}</strong> as a {revieweeRole} 
            for the item "<strong>{transaction.item?.title}</strong>".
          </p>
          
          <Form.Group className="mb-3">
            <Form.Label>Rating</Form.Label>
            <Form.Select
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              required
            >
              <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
              <option value={4}>⭐⭐⭐⭐ Good</option>
              <option value={3}>⭐⭐⭐ Average</option>
              <option value={2}>⭐⭐ Poor</option>
              <option value={1}>⭐ Very Poor</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Comment (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              maxLength={500}
            />
            <Form.Text className="text-muted">
              {comment.length}/500 characters
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}