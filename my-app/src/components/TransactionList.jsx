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
  paid: 'info',
  rejected: 'danger',
  borrowed: 'primary',
  returned: 'warning',
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

// Helper function to check if a transaction has active buttons for the user
function hasActiveButtons(transaction, user) {
  if (!user || !transaction) return false;
  
  // Lender: Accept/Decline/Renegotiate if requested
  if (user.id === transaction.lender?._id && transaction.status === 'requested') {
    return true;
  }
  
  // Borrower: Accept/Decline if renegotiation_requested
  if (user.id === transaction.borrower?._id && transaction.status === 'renegotiation_requested') {
    return true;
  }
  
  // Borrower: Edit/Delete for requested (only when not renegotiation_requested)
  if (user.id === transaction.borrower?._id && transaction.status === 'requested') {
    return true;
  }
  
  // Borrower: Pay button for accepted
  if (user.id === transaction.borrower?._id && transaction.status === 'accepted') {
    return true;
  }
  
  // Lender: Enter pickup code after payment
  if (user.id === transaction.lender?._id && transaction.status === 'paid') {
    return true;
  }
  
  // Lender: Generate/View Return Code and Force Return if borrowed
  if (user.id === transaction.lender?._id && transaction.status === 'borrowed') {
    return true;
  }
  
  // Borrower: Enter the code after returning the item
  if (user.id === transaction.borrower?._id && transaction.status === 'borrowed') {
    return true;
  }
  
  // Borrower: Force Pick Up if paid
  if (user.id === transaction.borrower?._id && transaction.status === 'paid') {
    return true;
  }
  
  return false;
}

// Action buttons component matching ShowTransaction.jsx
function ActionButtons({ transaction, user, onAction }) {
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);

  const handleAction = async (action) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You must be logged in to perform this action.');
      
      let url = `/api/transactions/${transaction._id}/${action}`;
      let method = 'PATCH';
      let body = null;
      
      // Handle renegotiation actions differently
      if (action === 'renegotiation/accept') {
        url = `/api/transactions/${transaction._id}/renegotiation/accept`;
      } else if (action === 'renegotiation/decline') {
        url = `/api/transactions/${transaction._id}/renegotiation/decline`;
        method = 'PATCH';
        body = JSON.stringify({ message: "Sorry, can't do those dates." });
      } else if (action === 'retract') {
        url = `/api/transactions/${transaction._id}/retract`;
      }
      
      const options = {
        method,
        headers: { 
          Authorization: `Bearer ${token}`,
          ...(body && { 'Content-Type': 'application/json' })
        },
        ...(body && { body })
      };
      
      await fetch(url, options);
      // Refresh the transaction list after action
      onAction && onAction();
    } catch (err) {
      console.error('Action failed:', err);
    }
    setUpdating(false);
  };

  const handleDeleteClick = async () => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    await handleAction('retract');
  };

  // Lender: Accept/Decline/Renegotiate if requested
  if (user?.id === transaction.lender?._id && transaction.status === 'requested') {
    return (
      <div className="d-flex gap-2">
        <Button
          variant="success"
          size="sm"
          disabled={updating}
          onClick={e => { e.stopPropagation(); handleAction('accept'); }}
        >
          Accept
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={updating}
          onClick={e => { e.stopPropagation(); handleAction('decline'); }}
        >
          Decline
        </Button>
        <Button
          variant="warning"
          size="sm"
          disabled={updating}
          onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}`); }}
        >
          Renegotiate
        </Button>
      </div>
    );
  }

  // Borrower: Accept/Decline if renegotiation_requested
  if (user?.id === transaction.borrower?._id && transaction.status === 'renegotiation_requested') {
    return (
      <div className="d-flex gap-2">
        <Button
          variant="success"
          size="sm"
          disabled={updating}
          onClick={e => { e.stopPropagation(); handleAction('renegotiation/accept'); }}
        >
          Accept
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={updating}
          onClick={e => { e.stopPropagation(); handleAction('renegotiation/decline'); }}
        >
          Decline
        </Button>
      </div>
    );
  }

  // Borrower: Edit/Delete for requested (but not when renegotiation_requested because then they have Accept/Decline)
  if (
    user?.id === transaction.borrower?._id &&
    transaction.status === 'requested'
  ) {
    return (
      <div className="d-flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}/edit`); }}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={updating}
          onClick={e => { e.stopPropagation(); handleDeleteClick(); }}
        >
          Delete
        </Button>
      </div>
    );
  }

  // Borrower: Pay if accepted
  if (user?.id === transaction.borrower?._id && transaction.status === 'accepted') {
    return (
      <Button
        variant="primary"
        size="sm"
        onClick={e => { e.stopPropagation(); navigate(`/payment/${transaction._id}`); }}
      >
        Pay
      </Button>
    );
  }

  // Lender: Enter PickUp Code after payment
  if (user?.id === transaction.lender?._id && transaction.status === 'paid') {
    return (
      <Button
        variant="success"
        size="sm"
        onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}?showPickup=1`); }}
      >
        Enter Code after Item was picked up
      </Button>
    );
  }

  // Lender: Generate Code and Force Return if borrowed
  if (user?.id === transaction.lender?._id && transaction.status === 'borrowed') {
    return (
      <div className="d-flex gap-2">
        <Button
          variant="info"
          size="sm"
          disabled={updating}
          onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}`); }}
        >
          Generate Code
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={updating}
          onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}`); }}
        >
          Force Return
        </Button>
      </div>
    );
  }

  // Borrower: Enter the code after returning the item
  if (user?.id === transaction.borrower?._id && transaction.status === 'borrowed') {
    return (
      <Button
        variant="success"
        size="sm"
        onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}?showReturn=1`); }}
      >
        Enter the Code after returning the Item
      </Button>
    );
  }

  // Borrower: Force Pick Up if paid
  if (user?.id === transaction.borrower?._id && transaction.status === 'paid') {
    return (
      <Button
        variant="danger"
        size="sm"
        onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}`); }}
      >
        Force Pick Up
      </Button>
    );
  }

  return null;
}

export default function TransactionList({ endpoint, title, statusOptions, onTransactionChange }) {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchTransactions();
  }, [endpoint]);

  function filterAndSortTransactions(transactions, filter, userId) {
    let filtered = transactions.filter(t => {
      if (filter.status && t.status !== filter.status) return false;
      if (filter.maxPrice && t.item?.price > Number(filter.maxPrice)) return false;
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

    // Sort by: 1) Active buttons first, 2) Date (newest first or as specified)
    filtered = filtered.sort((a, b) => {
      // Only check for active buttons if userId is available
      const aHasButtons = userId ? hasActiveButtons(a, { id: userId }) : false;
      const bHasButtons = userId ? hasActiveButtons(b, { id: userId }) : false;
      
      // Transactions with active buttons come first
      if (aHasButtons && !bHasButtons) return -1;
      if (!aHasButtons && bHasButtons) return 1;
      
      // If both have or don't have buttons, sort by date
      if (filter.sortBy === 'date_asc') {
        return new Date(a.requestDate) - new Date(b.requestDate);
      }
      return new Date(b.requestDate) - new Date(a.requestDate);
    });

    return filtered;
  }

  const filteredTransactions = filterAndSortTransactions(transactions, filter, user?.id);

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // Show loading state if user is not loaded yet
  if (!user) {
    return (
      <Container className="py-5">
        <p>Loading...</p>
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
          const itemTitle = tx.item?.title || 'Unknown Item';
          const borrowerName = tx.borrower?.nickname || tx.borrower?.email || 
                              `${tx.borrower?.firstName || ''} ${tx.borrower?.lastName || ''}`.trim() || 'Unknown';
          const lenderName = tx.lender?.nickname || tx.lender?.email || 
                            `${tx.lender?.firstName || ''} ${tx.lender?.lastName || ''}`.trim() || 
                            tx.item?.owner?.nickname || tx.item?.owner?.email || 'Unknown';
          const requestDate = tx.requestDate ? new Date(tx.requestDate).toLocaleString() : 'Unknown';

          let cardBg = '';
          switch (tx.status) {
            case 'requested':
              cardBg = 'card-bg-requested';
              break;
            case 'accepted':
              cardBg = 'card-bg-accepted';
              break;
            case 'paid':
              cardBg = 'card-bg-paid';
              break;
            case 'rejected':
              cardBg = 'card-bg-rejected';
              break;
            case 'borrowed':
              cardBg = 'card-bg-borrowed';
              break;
            case 'returned':
              cardBg = 'card-bg-returned';
              break;
            case 'completed':
              cardBg = 'card-bg-completed';
              break;
            case 'renegotiation_requested':
              cardBg = 'card-bg-renegotiation';
              break;
            case 'retracted':
              cardBg = 'card-bg-retracted text-muted';
              break;
            default:
              cardBg = 'card-bg-requested';
          }

          // Use text-dark for all cards for readability, except for completed/retracted (muted)
          const cardText = (tx.status === 'completed' || tx.status === 'retracted') ? 'text-muted' : 'text-dark';

          return (
            <Card
              key={tx._id}
              className={`mb-3 ${cardText} ${cardBg}`}
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
                    {/* Action buttons matching ShowTransaction.jsx */}
                    <ActionButtons
                      transaction={tx}
                      user={user}
                      onAction={fetchTransactions} // Refresh transactions after action
                    />
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