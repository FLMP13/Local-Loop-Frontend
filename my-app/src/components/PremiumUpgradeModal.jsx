import React, { useState } from 'react';
import {Modal, Button, Card, Row, Col, Badge, Alert} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


export default function PremiumUpgradeModal({ show, onHide, currentListings, maxListings, context = 'limit' }) {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const plans = {
    monthly: {
      name: 'Premium Monthly',
      price: '€3.99',
      period: '/month',
      description: 'Perfect for regular users'
    },
    yearly: {
      name: 'Premium Yearly',
      price: '€35.99',
      period: '/year',
      description: 'Best value - 3 months free!',
      savings: 'Save €12.00 (25%)'   
    }
  };

  const premiumFeatures = [
    'Unlimited item listings',
    '10% discount on all rentals',
    'Priority listing visibility',
    'Priority in rental requests',
    'Item view analytics & statistics'
  ];

  const handleUpgrade = () => {
    try {
      setError(null); // Clear any previous errors
      onHide(); // Close modal first
      navigate(`/premium-payment/${selectedPlan}`); // Redirect to dedicated premium payment page
    } catch (err) {
      console.error('Navigation error:', err);
      setError('Failed to navigate to payment page');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Upgrade to Premium</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {context === 'limit' ? (
          <Alert variant="warning" className="mb-4">
            <strong>Listing Limit Reached!</strong>
            <br />
            You have {currentListings} out of {maxListings} free listings. 
            Upgrade to premium for unlimited listings and exclusive benefits!
          </Alert>
        ) : context === 'discount' ? (
          <Alert variant="success" className="mb-4">
            <strong>💰 Save 10% on Every Rental!</strong>
            <br />
            Premium users get an automatic 10% discount on all rentals. Start saving today!
          </Alert>
        ) : context === 'priority' ? (
          <Alert variant="info" className="mb-4">
            <strong>🚀 Get Priority Access!</strong>
            <br />
            Premium users' requests are prioritized by lenders. Get your rentals faster!
          </Alert>
        ) : context === 'analytics' ? (
          <Alert variant="primary" className="mb-4">
            <strong>📊 Unlock Item Analytics!</strong>
            <br />
            See detailed view statistics, track popularity, and optimize your listings!
          </Alert>
        ) : context === 'priority-listing' ? (
          <Alert variant="warning" className="mb-4">
            <strong>⭐ Get Priority Visibility!</strong>
            <br />
            Premium listings appear first in search results. Get more views and bookings!
          </Alert>
        ) : (
          <Alert variant="info" className="mb-4">
            <strong>Unlock Premium Benefits!</strong>
            <br />
            Get unlimited listings, exclusive discounts, and premium features!
          </Alert>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        <Row className="mb-4">
          {Object.entries(plans).map(([key, plan]) => (
            <Col md={6} key={key} className="mb-3">
              <Card 
                className={`h-100 ${selectedPlan === key ? 'border-primary' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedPlan(key)}
              >
                <Card.Body className="text-center">
                  {key === 'yearly' && (
                    <Badge bg="success" className="mb-2">{plan.savings}</Badge>
                  )}
                  <Card.Title>{plan.name}</Card.Title>
                  <div className="display-6 text-primary">
                    {plan.price}
                    <small className="text-muted">{plan.period}</small>
                  </div>
                  <Card.Text className="text-muted">
                    {plan.description}
                  </Card.Text>
                  <div className="form-check d-flex justify-content-center">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="plan" 
                      checked={selectedPlan === key}
                      onChange={() => setSelectedPlan(key)}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="mb-4">
          <h5>Premium Features:</h5>
          <ul className="list-unstyled">
            {premiumFeatures.map((feature, index) => (
              <li key={index} className="mb-2">
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleUpgrade}
        >
          Continue to Payment
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
