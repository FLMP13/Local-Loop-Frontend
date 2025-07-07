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
        <h2 className="text-success mb-3">🎉 Vielen Dank für Ihre Zahlung!</h2>
        <p>Die Zahlung für <strong>{transaction.itemTitle}</strong> wurde erfolgreich abgeschlossen.</p>
        <p>
          Verliehen von: <strong>{transaction.lender}</strong><br />
          Betrag: <strong>€{transaction.itemPrice}</strong>
        </p>
        <Link to="/my-borrowings" className="btn btn-primary mt-3">
          ➜ Zu MyBorrowings
        </Link>
      </Card>
    </Container>
  );
}
