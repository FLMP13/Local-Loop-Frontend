import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container, Card, Alert, Tabs, Tab, Image } from 'react-bootstrap';
import axios from 'axios';
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
  const [avatarBlobUrl, setAvatarBlobUrl] = useState(null);

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
        
        // Fetch avatar if user has one
        if (data.profilePic) {
          await fetchUserAvatar();
        }
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      }
    };
    fetchUser();
  }, [userId]);

  const fetchUserAvatar = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}/avatar`, {
        responseType: 'blob'
      });
      const blobUrl = URL.createObjectURL(response.data);
      setAvatarBlobUrl(blobUrl);
    } catch (err) {
      console.error('Failed to fetch user avatar:', err);
      // Don't set error state, just handle gracefully
    }
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (avatarBlobUrl) {
        URL.revokeObjectURL(avatarBlobUrl);
      }
    };
  }, [avatarBlobUrl]);

  // Get display name (nickname or first name)
  const getDisplayName = () => {
    if (!userInfo) return '';
    return userInfo.nickname || userInfo.firstName || 'User';
  };

  const ReviewList = ({ reviews, role }) => (
    <>
      {reviews.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-3" style={{ opacity: 0.6 }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="#6c757d">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 9H9.5v-.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V11zm2.1 3H7.9c-.5 0-.9-.4-.9-.9C7 11.2 9.2 9 12 9s5 2.2 5 4.1c0 .5-.4.9-.9.9z"/>
            </svg>
          </div>
          <h5 className="text-muted">No reviews as {role} yet</h5>
          <p className="text-muted mb-0">Reviews will appear here once {getDisplayName()} starts {role === 'lender' ? 'lending items' : 'borrowing items'}.</p>
        </div>
      ) : (
        <div className="row g-3">
          {reviews.map(review => (
            <div key={review._id} className="col-12">
              <Card className="border-0 bg-light review-card">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <RatingDisplay rating={review.rating} count={1} />
                      <div>
                        <div className="fw-semibold text-dark">
                          {review.reviewer
                            ? (review.reviewer.nickname || review.reviewer.firstName || "Unknown User")
                            : "Unknown User"}
                        </div>
                        <small className="text-muted">
                          {review.transaction && review.transaction.item
                            ? `for "${review.transaction.item.title}"`
                            : "Item details unavailable"}
                        </small>
                      </div>
                    </div>
                    <small className="text-muted">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : ""}
                    </small>
                  </div>
                  {review.comment && (
                    <div className="review-comment">
                      <p className="mb-0 text-dark" style={{ lineHeight: '1.6' }}>
                        "{review.comment}"
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <Container fluid className="px-md-5" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Modern Hero Section with User Profile */}
      <div className="hero-section bg-light p-4 p-md-5 mb-4">
        <div className="d-flex align-items-center gap-4">
          {/* User Avatar */}
          <div className="user-avatar-container">
            {avatarBlobUrl ? (
              <Image 
                src={avatarBlobUrl} 
                className="user-avatar-image"
              />
            ) : (
              <div className="user-avatar-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="#6c757d">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
          </div>
          
          {/* User Info */}
          <div className="flex-grow-1">
            <h1 className="display-6 fw-bold mb-2">{getDisplayName()}</h1>
            <p className="lead text-muted mb-0">
              Community Reviews & Ratings
            </p>
            {userInfo && (
              <div className="d-flex gap-4 mt-3">
                <div className="text-center">
                  <div className="h5 mb-0 fw-bold text-primary">
                    {userInfo.lenderRating?.count || 0}
                  </div>
                  <small className="text-muted">As Lender</small>
                </div>
                <div className="text-center">
                  <div className="h5 mb-0 fw-bold text-success">
                    {userInfo.borrowerRating?.count || 0}
                  </div>
                  <small className="text-muted">As Borrower</small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="rounded-pill mb-4 mx-auto" style={{ maxWidth: '800px' }}>
          <div className="d-flex align-items-center">
            <span className="me-2">⚠️</span>
            {error}
          </div>
        </Alert>
      )}
      
      <div className="row justify-content-center">
        <div className="col-xl-10">
          <Card className="border-0 shadow-sm modern-card">
            <Card.Body className="p-4 p-md-5">
              <Tabs defaultActiveKey={defaultTab} className="mb-4 nav-pills">
                <Tab eventKey="lender" title={`As Lender (${lenderReviews.length})`}>
                  <ReviewList reviews={lenderReviews} role="lender" />
                </Tab>
                <Tab eventKey="borrower" title={`As Borrower (${borrowerReviews.length})`}>
                  <ReviewList reviews={borrowerReviews} role="borrower" />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
}