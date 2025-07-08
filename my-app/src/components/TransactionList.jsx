import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import SimpleFilter from './SimpleFilter';
import { STATUS_COLORS } from './StatusColors';
import Badge from 'react-bootstrap/Badge';

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || 'secondary';
  const label = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  return (
    <Badge bg={color} style={{ fontSize: '1rem', padding: '0.5em 1em' }}>
      {label}
    </Badge>
  );
}

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

  function getStatusPriority(transaction, userId) {
    // Lower number = higher priority (top of list)
    if (transaction.status === 'requested') return 0;
    if (transaction.status === 'renegotiation_requested') return 1;
    if (transaction.status === 'accepted' || transaction.status === 'borrowed' || transaction.status === 'returned') return 2;
    if (transaction.status === 'rejected' || transaction.status === 'declined') return 3;
    if (transaction.status === 'completed') return 4;
    return 5; // Unknown status
  }

  function filterAndSortTransactions(transactions, filter, userId) {
    let filtered = transactions.filter(t => {
      // Status filter
      if (filter.status && t.status !== filter.status) return false;
      // Max price filter
      if (filter.maxPrice && t.item?.price > Number(filter.maxPrice)) return false;
      // Name/description/username filter
      if (filter.name) {
        const search = filter.name.toLowerCase();
        const fields = [
          t.item?.title,
          t.item?.description,
          t.lender?.nickname,
          t.lender?.email,
          t.borrower?.nickname,
          t.borrower?.email,
        ].filter(Boolean).map(s => s.toLowerCase());
        if (!fields.some(f => f.includes(search))) return false;
      }
      return true;
    });

    // Sort by action priority, then by date
    filtered = filtered.sort((a, b) => {
      const pa = getStatusPriority(a, userId);
      const pb = getStatusPriority(b, userId);
      if (pa !== pb) return pa - pb;
      if (filter.sortBy === 'date_asc') {
        return new Date(a.requestDate) - new Date(b.requestDate);
      }
      // Default: newest first
      return new Date(b.requestDate) - new Date(a.requestDate);
    });

    return filtered;
  }

  const filteredTransactions = filterAndSortTransactions(transactions, filter, user.id);

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
                      <StatusBadge status={tx.status} /><br />
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