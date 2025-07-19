import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext to access user and token
import axios from "axios";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

// Payment component for handling PayPal transactions
export default function Payment() {
  const { id } = useParams(); // transaction ID
  const [clientId, setClientId] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [transactionSummary, setTransactionSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        //Fetch PayPal configuration from the backend
        const response = await axios.get("/api/config/paypal");
        console.log("PayPal config response:", response.data);
        setClientId(response.data.clientId);

        // Debug: Check what's in the user object
        console.log("User from AuthContext:", user);

        if (id) {
          // Fetch transaction details with timestamp to avoid caching
          const token = localStorage.getItem("token");
          const timestamp = Date.now();
          const summaryResponse = await axios.get(
            `/api/transactions/${id}/summary?t=${timestamp}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              },
            }
          );
          setTransactionSummary(summaryResponse.data);
        }
      } catch (error) {
        console.error("Error fetching PayPal configuration:", error);
        setError(error.response?.data?.error || "Failed to load payment data");
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentData();
  }, [id]);
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" style={{ color: 'var(--brand)' }} />
        <p className="mt-3 text-muted">Loading payment details...</p>
      </div>
    );
  }
  if (error) return <Alert variant="danger">Error: {error}</Alert>;
  if (!clientId) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" style={{ color: 'var(--brand)' }} />
        <p className="mt-3 text-muted">Loading PayPal...</p>
      </div>
    );
  }

  return (
    <Container className="mt-5">
      <div className="checkout-page">
        <h1>Complete Your Payment</h1>
        {transactionSummary ? (
          <p>
            {user?.firstName || 'User'}, your request to borrow <strong>{transactionSummary.itemTitle}</strong> from {transactionSummary.lender} has
            been accepted. Please provide payment details to proceed.
          </p>
        ) : (
          <p>
            {user?.firstName || 'User'}, your request to borrow an item has been accepted.
            Please provide payment details to proceed.
          </p>
        )}
        <Row className="justify-content-center">
          <Col md={6}>
            <Form>
              <PayPalScriptProvider
                options={{ "client-id": clientId, currency: "EUR" }}
              >
                <PayPalButtons
                  style={{ layout: "vertical" }}
                  createOrder={(data, actions) => {
                    const rawAmount = transactionSummary.totalAmount || transactionSummary.itemPrice || "9.99";
                    // Ensure amount has exactly 2 decimal places for PayPal
                    const amount = parseFloat(rawAmount).toFixed(2);
                    console.log("Creating order with amount:", amount);
                    return actions.order.create({
                      purchase_units: [
                        {
                          amount: {
                            value: amount,
                          },
                          payee: {
                            email_address: "localloop@business.example.com"
                          },
                          description: `Rental payment for ${transactionSummary.itemTitle} - Localloop will distribute to lender`
                        },
                      ],
                    });
                  }}
                  onApprove={async (data, actions) => {
                    try {
                      // Transaction payment approved
                      const details = await actions.order.capture();
                      console.log('Payment successful:', details);

                      const token = localStorage.getItem("token");
                      // PATCH: complete-payment
                      const paymentRes = await axios.patch(
                        `/api/transactions/${id}/complete-payment`,
                        {}, // No PayPal payment ID needed for sandbox
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      if (paymentRes.status !== 200) throw new Error('Payment update failed');

                      // PATCH: pickup-code (optional, ignore error if already generated)
                      try {
                        const codeRes = await axios.patch(
                          `/api/transactions/${id}/pickup-code`,
                          {},
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                      } catch (codeErr) {
                        console.warn('Pickup code generation failed (may already exist):', codeErr?.response?.data?.error || codeErr.message);
                      }

                      navigate(`/payment-success/${id}`);
                    } catch (error) {
                      console.error('Error:', error);
                      alert('Ein Fehler ist aufgetreten: ' + (error?.message || 'Unbekannter Fehler'));
                    }
                  }}
                  onError={(err) => {
                    console.error("PayPal Fehler:", err);
                  }}
                />
              </PayPalScriptProvider>
            </Form>
          </Col>
          {/* Right side summary*/}
          <Col md={4}>
            <Card className="mt-3">
              <Card.Body>
                {transactionSummary ? (
                  <>
                    <div
                      className="rounded-circle bg-dark text-white d-flex justify-content-center align-items-center"
                      style={{ width: 50, height: 50 }}
                    >
                      <strong>
                        {transactionSummary.lender.split(' ').map(name => name[0]).join('')}
                      </strong>
                    </div>
                    <Card.Title>{transactionSummary.lender}</Card.Title>
                    <Card.Text>
                      <strong>Item:</strong> {transactionSummary.itemTitle}
                    </Card.Text>
                    <Card.Text>
                      <strong>Rental Period:</strong><br />
                      {new Date(transactionSummary.requestedFrom).toLocaleDateString()} - {new Date(transactionSummary.requestedTo).toLocaleDateString()}
                    </Card.Text>
                    <hr />
                    <Card.Text>
                      <strong>Rental Cost:</strong> €{transactionSummary.lendingFee}
                    </Card.Text>
                    <Card.Text>
                      <strong>Security Deposit:</strong> €{transactionSummary.deposit}
                    </Card.Text>
                    {transactionSummary.premiumDiscount && (
                      <>
                        <Card.Text className="text-success">
                          <strong>Premium Discount:</strong> -€{transactionSummary.premiumDiscount.discountAmount.toFixed(2)} ({transactionSummary.premiumDiscount.discountRate}% off)
                        </Card.Text>
                        <Card.Text className="text-muted small">
                          Original Cost: €{transactionSummary.premiumDiscount.originalAmount.toFixed(2)}
                        </Card.Text>
                      </>
                    )}
                    <Card.Text className="fw-bold">
                      <strong>Total Payment:</strong> €{transactionSummary.totalAmount}
                    </Card.Text>
                    <Card.Text className="text-muted small">
                      Weekly Rate: €{transactionSummary.itemPrice}/week
                    </Card.Text>
                    <Card.Text className="text-muted small">
                      * Deposit will be returned after item return
                    </Card.Text>
                    <Card.Text>
                      <strong>Status:</strong> {transactionSummary.status}
                    </Card.Text>
                  </>
                ) : (
                  <>
                    <div className="text-center my-3">
                      <Spinner animation="border" size="sm" style={{ color: 'var(--brand)' }} />
                    </div>
                    <Card.Title>Loading...</Card.Title>
                    <Card.Text>Loading transaction details...</Card.Text>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
}
