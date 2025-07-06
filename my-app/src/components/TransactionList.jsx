import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import SimpleFilter from './SimpleFilter';

export default function TransactionList({ endpoint, title }) {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setTransactions(data || []);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions.');
      }
    };
    fetchTransactions();
  }, [endpoint]);

  const filteredTransactions = transactions.filter(tx => 
    filter === '' || tx.status === filter
  );

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">{title}</h2>
      <SimpleFilter 
        filter={filter} 
        setFilter={setFilter} 
        statusOptions={['requested','accepted','rejected','completed']} 
      />
      
      {filteredTransactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        filteredTransactions.map(tx => {
          // Defensive checks for missing data
          const itemTitle = tx.item?.title || 'Unknown Item';
          const borrowerName = tx.borrower?.nickname || tx.borrower?.email || 
                              `${tx.borrower?.firstName || ''} ${tx.borrower?.lastName || ''}`.trim() || 'Unknown';
          const lenderName = tx.lender?.nickname || tx.lender?.email || 
                            `${tx.lender?.firstName || ''} ${tx.lender?.lastName || ''}`.trim() || 
                            tx.item?.owner?.nickname || tx.item?.owner?.email || 'Unknown';
          const requestDate = tx.requestDate ? new Date(tx.requestDate).toLocaleString() : 'Unknown';

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
          } else if (tx.status === 'completed') {
            cardBg = 'bg-info';
            cardText = 'text-white';
          }

          return (
            <Card key={tx._id} className={`mb-3 ${cardText} ${cardBg}`}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <Card.Title>{itemTitle}</Card.Title>
                    <Card.Text>
                      Status: {tx.status || 'Unknown'}<br />
                      Borrower: {borrowerName}<br />
                      Lender: {lenderName}<br />
                      Requested: {requestDate}
                    </Card.Text>
                  </div>
                  <div className="text-end">
                    <Button 
                      as={Link} 
                      to={`/transactions/${tx._id}`}
                      variant={cardBg ? 'light' : 'primary'}
                      size="sm"
                      className="mb-2"
                    >
                      View Details
                    </Button>
                    {/* Add review links for completed transactions */}
                    {tx.status === 'completed' && (
                      <div>
                        {tx.borrower?._id && tx.borrower._id !== user?.id && (
                          <Button 
                            as={Link} 
                            to={`/users/${tx.borrower._id}/reviews`}
                            variant="outline-light"
                            size="sm"
                            className="d-block mt-1"
                          >
                            Borrower Reviews
                          </Button>
                        )}
                        {tx.lender?._id && tx.lender._id !== user?.id && (
                          <Button 
                            as={Link} 
                            to={`/users/${tx.lender._id}/reviews`}
                            variant="outline-light"
                            size="sm"
                            className="d-block mt-1"
                          >
                            Lender Reviews
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          );
        })
      )}
    </Container>
  );
}