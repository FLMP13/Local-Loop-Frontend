import React, { useEffect, useState } from "react";
import { Container, Card, Alert, Spinner } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { CheckCircle, ShieldCheck, CurrencyDollar, Phone, ArrowRight } from 'react-bootstrap-icons';

// PaymentSuccess component to display successful payment details
export default function PaymentSuccess() {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/transactions/${transactionId}/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransaction(response.data);
      } catch (err) {
        console.error("Error fetching transaction:", err);
        setError("Failed to load transaction details.");
      }
    };

    fetchTransaction();
  }, [transactionId]);

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!transaction) return (
    <div className="d-flex justify-content-center mt-5">
      <Spinner animation="border" />
    </div>
  );

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card style={{ maxWidth: "500px", padding: "2rem", textAlign: "center" }}>
        <h2 className="text-success mb-3">
          <CheckCircle className="me-2" />
          Payment Successful!
        </h2>
        <p>Your payment for <strong>{transaction.itemTitle}</strong> has been completed successfully.</p>
        
        <div className="alert alert-info my-3">
          <strong>What happens next?</strong>
          <ul className="list-unstyled mt-2 mb-0">
            <li><ShieldCheck className="me-2" />A pickup code has been generated for you</li>
            <li><CurrencyDollar className="me-2" />The lender will receive their payment when you pick up the item</li>
            <li><Phone className="me-2" />Give the pickup code to the lender when collecting the item</li>
          </ul>
        </div>

        <p>
          <strong>Lender:</strong> {transaction.lender}<br />
          <strong>Total Amount:</strong> €{transaction.totalAmount}
        </p>
        <Link to={`/transactions/${transactionId}`} className="btn btn-primary mt-3">
          <ArrowRight className="me-2" /> View Pickup Code & Details
        </Link>
      </Card>
    </Container>
  );
}
