import React, { useEffect, useState } from "react";
import { Container, Card, Alert, Spinner } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

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
        <h2 className="text-success mb-3">Thank you for your payment!</h2>
        <p>The payment for <strong>{transaction.itemTitle}</strong> was completed successfully.</p>
        <p>You can now get your pick-up code in your transaction details, which you can give the lender of your item after receiving it.</p>
        <p>
          Lent by: <strong>{transaction.lender}</strong><br />
          Amount: <strong>€{transaction.itemPrice}</strong>
        </p>
        <Link to={`/transactions/${transactionId}`} className="btn btn-primary mt-3">
          ➜ Go to Transaction
        </Link>
      </Card>
    </Container>
  );
}
