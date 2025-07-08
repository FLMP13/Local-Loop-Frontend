import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { Link, useNavigate } from 'react-router-dom';
import SimpleFilter from './SimpleFilter';
import Badge from 'react-bootstrap/Badge';

const STATUS_COLORS = {
  requested: 'secondary',
  accepted: 'success',
  rejected: 'danger',
  borrowed: 'info',
  returned: 'primary',
  completed: 'dark',
  renegotiation_requested: 'warning',
  retracted: 'secondary'
}; // should match the colors in ShowTransaction.jsx

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || 'secondary';
  const label = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  return (
    <Badge bg={color} style={{ fontSize: '1rem', padding: '0.5em 1em' }}>
      {label}
    </Badge>
  );
}

export default function TransactionList({ endpoint, title, statusOptions, onTransactionChange }) {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

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
        statusOptions={statusOptions} 
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

          const allowedStates = ['requested', 'renegotiation_requested'];
          const isForbidden = !allowedStates.includes(tx.status);

          return (
            <Card
              key={tx._id}
              className={`mb-3 ${cardText} ${cardBg} ${tx.status === 'retracted' ? 'text-muted bg-light' : ''}`}
              style={tx.status === 'retracted' ? { opacity: 0.6, cursor: 'pointer' } : { cursor: 'pointer' }}
              onClick={() => navigate(`/transactions/${tx._id}`)}
            >
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
                    <div className="mt-2 d-flex gap-2">
                      <Button
                        as={Link}
                        to={`/transactions/edit/${tx._id}`}
                        variant="outline-primary"
                        size="sm"
                        className={`fw-bold ${isForbidden ? 'disabled text-muted border-secondary' : ''}`}
                        disabled={isForbidden}
                        style={{ minWidth: 70 }}
                        onClick={e => e.stopPropagation()}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={async e => {
                          e.stopPropagation();
                          if (isForbidden) return;
                          if (window.confirm('Are you sure you want to delete this transaction?')) {
                            try {
                              const token = localStorage.getItem('token');
                              await fetch(`/api/transactions/${tx._id}/retract`, {
                                method: 'PATCH',
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              setTransactions(transactions.map(t =>
                                t._id === tx._id ? { ...t, status: 'retracted' } : t
                              ));
                              alert('Transaction deleted successfully.');
                            } catch (err) {
                              console.error('Error deleting transaction:', err);
                              alert('Failed to delete transaction.');
                            }
                          }
                        }}
                        variant="outline-danger"
                        size="sm"
                        className={`fw-bold ${isForbidden ? 'disabled text-muted border-secondary' : ''}`}
                        disabled={isForbidden}
                        style={{ minWidth: 70 }}
                      >
                        Delete
                      </Button>
                    </div>
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