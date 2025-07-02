import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import { Link } from 'react-router-dom';
import SimpleFilter from './SimpleFilter'; // import the filter

export default function TransactionList({ endpoint, title }) {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ name: '', maxPrice: '', status: '' });

  useEffect(() => {
    if (!user) return;
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        setError('Failed to load transactions.');
      }
    };
    fetchTransactions();
  }, [user, endpoint]);

  // Apply filters before rendering
  const filteredTransactions = transactions.filter(tx => {
    const nameMatch = filter.name
      ? tx.item?.title?.toLowerCase().includes(filter.name.toLowerCase())
      : true;
    const priceMatch = filter.maxPrice
      ? tx.item?.price <= parseFloat(filter.maxPrice)
      : true;
    const statusMatch = filter.status
      ? tx.status === filter.status
      : true;
    return nameMatch && priceMatch && statusMatch;
  });

  if (!user) {
    return <Alert variant="info">Please log in to view your transactions.</Alert>;
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">{title}</h2>
      <SimpleFilter filter={filter} setFilter={setFilter} statusOptions={['requested','accepted','rejected']} />
      {error && <Alert variant="danger">{error}</Alert>}
      {filteredTransactions.map(tx => {
        let cardBg = '';
        let cardText = 'text-dark';

        if (tx.status === 'requested') {
          cardBg = 'bg-warning';
          cardText = 'text-dark';
        } else if (tx.status === 'accepted' || tx.status === 'approved') {
          cardBg = 'bg-success';
          cardText = 'text-white';
        } else if (tx.status === 'rejected' || tx.status === 'declined') {
          cardBg = 'bg-danger';
          cardText = 'text-white';
        }

        return (
          <Card
            as={Link}
            to={`/transactions/${tx._id}`}
            key={tx._id}
            className={`mb-3 text-decoration-none ${cardText} ${cardBg}`}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body>
              <Card.Title>{tx.item?.title || 'Item'}</Card.Title>
              <Card.Text>
                Status: {tx.status}<br />
                {tx.borrower && <>Borrower: {tx.borrower.nickname || tx.borrower.email}<br /></>}
                {tx.lender
                  ? <>Lender: {tx.lender.nickname || tx.lender.email}<br /></>
                  : tx.item?.owner && (
                      <>Lender: {tx.item.owner.nickname || tx.item.owner.email}<br /></>
                    )
                }
                Requested: {new Date(tx.requestDate).toLocaleString()}
              </Card.Text>
            </Card.Body>
          </Card>
        );
      })}
      {filteredTransactions.length === 0 && <p>No transactions found.</p>}
    </Container>
  );
}