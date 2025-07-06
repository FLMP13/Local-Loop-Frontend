import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Alert, Tabs, Tab } from 'react-bootstrap';
import RatingDisplay from '../components/RatingDisplay';

export default function UserReviews() {
  const { userId } = useParams();
  const [lenderReviews, setLenderReviews] = useState([]);
  const [borrowerReviews, setBorrowerReviews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async (role) => {
      try {
        const response = await fetch(`/api/reviews/user/${userId}?role=${role}`);
        const data = await response.json();
        
        if (role === 'lender') {
          setLenderReviews(data);
        } else {
          setBorrowerReviews(data);
        }
      } catch (err) {
        setError('Failed to fetch reviews');
      }
    };

    fetchReviews('lender');
    fetchReviews('borrower');
  }, [userId]);

  const ReviewList = ({ reviews, role }) => (
    <>
      {reviews.length === 0 ? (
        <p className="text-muted">No reviews as {role} yet.</p>
      ) : (
        reviews.map(review => (
          <Card key={review._id} className="mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <RatingDisplay rating={review.rating} count={1} />
                  <p className="mt-2 mb-1">
                    <strong>From:</strong> {review.reviewer.nickname || `${review.reviewer.firstName} ${review.reviewer.lastName}`}
                  </p>
                  <p className="mb-1">
                    <strong>Item:</strong> {review.transaction.item.title}
                  </p>
                </div>
                <small className="text-muted">
                  {new Date(review.createdAt).toLocaleDateString()}
                </small>
              </div>
              {review.comment && (
                <p className="mt-2 mb-0">{review.comment}</p>
              )}
            </Card.Body>
          </Card>
        ))
      )}
    </>
  );

  return (
    <Container className="py-5">
      <h2 className="mb-4">User Reviews</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Tabs defaultActiveKey="lender" className="mb-3">
        <Tab eventKey="lender" title="As Lender">
          <ReviewList reviews={lenderReviews} role="lender" />
        </Tab>
        <Tab eventKey="borrower" title="As Borrower">
          <ReviewList reviews={borrowerReviews} role="borrower" />
        </Tab>
      </Tabs>
    </Container>
  );
}