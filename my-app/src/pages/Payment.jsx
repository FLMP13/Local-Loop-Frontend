import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function Payment() {
  const [clientId, setClientId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayPalConfig = async () => {
      try {
        const response = await axios.get("/api/config/paypal");
        console.log("PayPal config response:", response.data);
        setClientId(response.data.clientId);
      } catch (error) {
        console.error("Error fetching PayPal configuration:", error);
        setError("Failed to load PayPal configuration");
      }
    };
    fetchPayPalConfig();
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!clientId) return <p>Loading PayPal...</p>;

  return (
    <Container className="mt-5">
      <div className="checkout-page">
        <h1>Complete Your Payment</h1>
        <p>
          Max, your request to borrow from Gina Lenda has been accepted. Please
          provide payment details to proceed.
        </p>
        <Row className="justify-content-center">
          <Col md={6}>
            <Form>
              <PayPalScriptProvider
                options={{ "client-id": clientId, currency: "EUR" }}
              >
                <PayPalButtons
                  style={{ layout: "vertical" }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [
                        {
                          amount: {
                            value: "9.99",
                          },
                        },
                      ],
                    });
                  }}
                  onApprove={(data, actions) => {
                    return actions.order.capture().then((details) => {
                      alert(
                        `Zahlung erfolgreich von ${details.payer.name.given_name}`
                      );
                      // Optional: Backend-Benachrichtigung, Status-Update etc.
                    });
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
                <div className="rounded-circle bg-dark text-white d-flex justify-content-center align-items-center" style={{ width: 50, height: 50 }}>
                <strong>GL</strong>
              </div>
                <Card.Title>Gina Lenda</Card.Title>
                <Card.Text>
                  <strong>Item:</strong> Chain Saw
                </Card.Text>
                <Card.Text>
                  <strong>Borrowing Fee:</strong> €10.00
                </Card.Text>
                <Card.Text>
                  <strong>Deposit:</strong> €50.00
                </Card.Text>
              </Card.Body>
            </Card>
            </Col>
        </Row>
      </div>
    </Container>
  );
}
