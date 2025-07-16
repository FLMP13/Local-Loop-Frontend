import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import PayPalPayment from "../components/PayPalPayment";

export default function PremiumPayment() {
  const { plan } = useParams(); // monthly or yearly
  const [clientId, setClientId] = useState(null);
  const [plans, setPlans] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const selectedPlan = plans?.[plan] || null;

  useEffect(() => {
    fetchPayPalConfig();
  }, []);

  const fetchPayPalConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch PayPal client ID and plans in parallel
      const [configResponse, plansResponse] = await Promise.all([
        axios.get("/api/config/paypal", {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get("/api/config/paypal/plans", {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      setClientId(configResponse.data.clientId);
      setPlans(plansResponse.data.plans);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching PayPal configuration:", error);
      setError("Failed to load payment configuration");
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async ({ subscriptionID }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post('/api/subscriptions/me/create', {
        plan,
        paypalSubscriptionId: subscriptionID
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });

      if (response.status === 201) {
        // Update user in AuthContext with premium status
        if (updateUser) {
          updateUser({ premiumStatus: 'active' });
        }
        
        // Redirect with success parameters
        navigate(`/profile?upgraded=true&plan=${plan}&price=${selectedPlan.price}`);
      }
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      setError('Failed to activate premium subscription');
    }
  };

  const handlePaymentError = (err) => {
    console.error('PayPal error:', err);
    setError('Payment failed. Please try again.');
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading payment configuration...</p>
        </div>
      </Container>
    );
  }

  if (error || !selectedPlan) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Payment Error</h4>
          <p>{error || 'Invalid payment plan selected'}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="checkout-page">
        <h1>Upgrade to Premium</h1>
        <p>
          {user?.firstName || 'User'}, upgrade to <strong>{selectedPlan.name}</strong> and unlock exclusive premium benefits!
        </p>
        
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Premium Features</h5>
              </Card.Header>
              <Card.Body>
                <ul className="list-unstyled mb-0">
                  <li><i className="bi bi-check-circle text-success me-2"></i>Unlimited item listings</li>
                  <li><i className="bi bi-check-circle text-success me-2"></i>10% discount on all rentals</li>
                  <li><i className="bi bi-check-circle text-success me-2"></i>Priority listing visibility</li>
                  <li><i className="bi bi-check-circle text-success me-2"></i>Priority in rental requests</li>
                  <li><i className="bi bi-check-circle text-success me-2"></i>Item view analytics & statistics</li>
                </ul>
              </Card.Body>
            </Card>

            <PayPalPayment
              clientId={clientId}
              type="subscription"
              planId={selectedPlan.id}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </Col>
          
          <Col md={4}>
            <Card className="mt-3">
              <Card.Body>
                <div
                  className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center mb-3"
                  style={{ width: 50, height: 50 }}
                >
                  <i className="bi bi-star-fill"></i>
                </div>
                <Card.Title>Premium Subscription</Card.Title>
                <Card.Text>
                  <strong>Plan:</strong> {selectedPlan.name}
                </Card.Text>
                <Card.Text>
                  <strong>Price:</strong> €{selectedPlan.price}/{selectedPlan.interval.toLowerCase()}
                </Card.Text>
                {selectedPlan.interval === 'YEAR' && (
                  <Card.Text className="text-success">
                    <strong>You save:</strong> Save €12.00 (25%)
                  </Card.Text>
                )}
                <hr />
                <Card.Text className="fw-bold">
                  <strong>Total:</strong> €{selectedPlan.price}
                </Card.Text>
                <Card.Text className="text-muted small">
                  * Auto-renewal can be cancelled anytime
                </Card.Text>
                <Card.Text className="text-muted small">
                  * Premium benefits activate immediately
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
}
