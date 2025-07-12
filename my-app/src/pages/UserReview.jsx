import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container, Card, Alert, Tabs, Tab } from 'react-bootstrap';
import RatingDisplay from '../components/RatingDisplay';

export default function UserReviews() {
  const { userId } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const defaultTab = params.get('tab') || 'lender';
  const [lenderReviews, setLenderReviews] = useState([]);
  const [borrowerReviews, setBorrowerReviews] = useState([]);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();
        setUserInfo(data);
      } catch (err) {
        // ignore user info error
      }
    };
    fetchUser();
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
                    <strong>From:</strong>{" "}
                    {review.reviewer
                      ? (review.reviewer.nickname || `${review.reviewer.firstName || ""} ${review.reviewer.lastName || ""}`)
                      : "Unknown"}
                  </p>
                  <p className="mb-1">
                    <strong>Item:</strong>{" "}
                    {review.transaction && review.transaction.item
                      ? review.transaction.item.title
                      : "Unknown"}
                  </p>
                </div>
                <small className="text-muted">
                  {review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString()
                    : ""}
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
      <h2 className="mb-4">
        User Reviews {userInfo ? `for ${userInfo.nickname || `${userInfo.firstName || ""} ${userInfo.lastName || ""}`}` : ""}
      </h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Tabs defaultActiveKey={defaultTab} className="mb-3">
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