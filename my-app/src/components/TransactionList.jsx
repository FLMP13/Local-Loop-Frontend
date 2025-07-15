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
  requested: 'warning',
  accepted: 'success',
  paid: 'info',
  rejected: 'danger',
  borrowed: 'primary',
  returned: 'warning',
  completed: 'success',
  renegotiation_requested: 'warning',
  retracted: 'secondary'
}; // should match the colors in ShowTransaction.jsx

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || 'secondary';
  const label = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  return (
    <Badge 
      bg={color} 
      style={{ 
        fontSize: '0.85rem', 
        padding: '0.5em 1em',
        borderRadius: '25px',
        fontWeight: '600'
      }}
    >
      {label}
    </Badge>
  );
}

// Helper function to check if a transaction has active buttons for the user  
function hasActiveButtons(transaction, user, hiddenNotifications = new Set()) {
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
  
  // Borrower: Generate return code button after payment
  if (user.id === transaction.borrower?._id && transaction.status === 'paid' && !transaction.returnCodeGenerated) {
    return true;
  }
  
  // Lender: Generate pickup code button
  if (user.id === transaction.lender?._id && transaction.status === 'paid' && !transaction.pickupCodeUsed) {
    return true;
  }
  
  // Lender: Enter pickup code button for borrowed items
  if (user.id === transaction.lender?._id && transaction.status === 'borrowed' && !transaction.pickupCodeUsed) {
    return true;
  }
  
  // Lender: Inspect and report damage after return
  if (user.id === transaction.lender?._id && transaction.status === 'returned') {
    return true;
  }
  
  // Borrower: New notification available when transaction completed (deposit processed)
  if (user.id === transaction.borrower?._id && transaction.status === 'completed' && 
      transaction.depositReturned && transaction.depositRefundPercentage !== undefined &&
      !hiddenNotifications.has(transaction._id)) {
    return true;
  }
  
  return false;
}

// Action buttons component matching ShowTransaction.jsx
function ActionButtons({ transaction, user, onAction, hiddenNotifications = new Set(), onHideNotification }) {
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
      <div className="d-flex gap-2 flex-wrap">
        <Button
          variant="success"
          size="sm"
          disabled={updating}
          onClick={e => { e.stopPropagation(); handleAction('accept'); }}
          className="flex-fill rounded-pill"
        >
          ✓ Accept
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={updating}
          onClick={e => { e.stopPropagation(); handleAction('decline'); }}
          className="flex-fill rounded-pill"
        >
          ✗ Decline
        </Button>
        <Button
          variant="warning"
          size="sm"
          disabled={updating}
          onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}`); }}
          className="w-100 mt-2 rounded-pill"
        >
          ⟲ Renegotiate
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
          className="flex-fill rounded-pill"
        >
          ✓ Accept
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={updating}
          onClick={e => { e.stopPropagation(); handleAction('renegotiation/decline'); }}
          className="flex-fill rounded-pill"
        >
          ✗ Decline
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
          variant="primary"
          size="sm"
          onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}/edit`); }}
          className="flex-fill rounded-pill"
        >
          ✏️ Edit
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={updating}
          onClick={e => { e.stopPropagation(); handleDeleteClick(); }}
          className="flex-fill rounded-pill"
        >
          🗑️ Delete
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
        className="w-100 rounded-pill"
      >
        💳 Pay Now
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
        className="w-100 rounded-pill"
      >
        🔑 Enter Pickup Code
      </Button>
    );
  }

  // Lender: Generate Code and Force Return if borrowed
  if (user?.id === transaction.lender?._id && transaction.status === 'borrowed') {
    return (
      <div className="d-flex gap-2 flex-wrap">
        <Button
          variant="info"
          size="sm"
          disabled={updating}
          onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}`); }}
          className="flex-fill rounded-pill"
        >
          🔐 Generate Code
        </Button>
        <Button
          variant="outline-danger"
          size="sm"
          disabled={updating}
          onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}`); }}
          className="flex-fill rounded-pill"
        >
          ⚠️ Force Return
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
        className="w-100 rounded-pill"
      >
        📦 Enter Return Code
      </Button>
    );
  }

  // Borrower: Force Pick Up if paid
  if (user?.id === transaction.borrower?._id && transaction.status === 'paid') {
    return (
      <Button
        variant="outline-danger"
        size="sm"
        onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}`); }}
        className="w-100 rounded-pill"
      >
        ⚠️ Force Pick Up
      </Button>
    );
  }

  // Lender: Inspect and report damage after return
  if (user?.id === transaction.lender?._id && transaction.status === 'returned') {
    return (
      <div className="d-flex gap-2 flex-wrap">
        <Button
          variant="danger"
          size="sm"
          onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}?showDamageReport=1`); }}
          className="flex-fill rounded-pill"
        >
          ⚠️ Report Damage
        </Button>
        <Button
          variant="success"
          size="sm"
          onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}?showNoDamage=1`); }}
          className="flex-fill rounded-pill"
        >
          ✅ No Damage
        </Button>
      </div>
    );
  }

  // Borrower: New Update button for completed transactions with deposit info
  if (user?.id === transaction.borrower?._id && 
      transaction.status === 'completed' && 
      transaction.depositReturned && 
      transaction.depositRefundPercentage !== undefined &&
      !hiddenNotifications.has(transaction._id)) {
    return (
      <Button
        variant="info"
        className="w-100 d-flex align-items-center justify-content-center gap-2 animated-pulse"
        style={{ 
          fontSize: '1rem',
          padding: '0.8em 1.5em',
          borderRadius: '25px',
          fontWeight: '600',
          animation: 'pulse 2s infinite',
          border: 'none'
        }}
        onClick={() => {
          // Hide notification first
          onHideNotification && onHideNotification(transaction._id);
          // Then navigate to transaction
          navigate(`/transactions/${transaction._id}`);
        }}
        title="View transaction details"
      >
        🔔 New Update
      </Button>
    );
  }

  return null;
}

// Helper function to calculate total rental cost based on duration and weekly rate
function computeWeeklyCharge(from, to, weeklyRate) {
  if (!from || !to || !weeklyRate) return 0;
  const days = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;
  const weeks = Math.ceil(days / 7);
  return weeks * weeklyRate;
}

// Helper function to check if there are new notifications for the borrower
function hasNewNotification(transaction, user, hiddenNotifications) {
  if (!user || !transaction) return false;
  
  // Skip if notification is hidden locally
  if (hiddenNotifications.has(transaction._id)) return false;
  
  // Borrower: New inspection result notification when transaction is completed
  if (user.id === transaction.borrower?._id && 
      transaction.status === 'completed' && 
      transaction.depositReturned && 
      transaction.depositRefundPercentage !== undefined) {
    return true;
  }
  
  return false;
}

export default function TransactionList({ endpoint, title, statusOptions, onTransactionChange }) {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [hiddenNotifications, setHiddenNotifications] = useState(() => {
    const saved = localStorage.getItem('hiddenNotifications');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
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

  // Simple handler to hide notification locally and persist to localStorage
  const handleHideNotification = (transactionId) => {
    const newHidden = new Set([...hiddenNotifications, transactionId]);
    setHiddenNotifications(newHidden);
    localStorage.setItem('hiddenNotifications', JSON.stringify([...newHidden]));
  };

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
      // Check for active buttons properly
      const aHasButtons = userId ? hasActiveButtons(a, { id: userId }, hiddenNotifications) : false;
      const bHasButtons = userId ? hasActiveButtons(b, { id: userId }, hiddenNotifications) : false;
      
      // For completed transactions, check if notification is hidden
      const aIsActive = aHasButtons && !(a.status === 'completed' && hiddenNotifications.has(a._id));
      const bIsActive = bHasButtons && !(b.status === 'completed' && hiddenNotifications.has(b._id));
      
      // Transactions with active buttons come first
      if (aIsActive && !bIsActive) return -1;
      if (!aIsActive && bIsActive) return 1;
      
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
    <div className="modern-container">
      <Container fluid className="px-md-5">
        {/* Hero Section */}
        <div className="hero-section bg-light p-4 p-md-5 mb-4">
          <div className="row align-items-center">
            <div className="col">
              <h1 className="display-5 fw-bold mb-3">{title}</h1>
              <p className="lead text-muted mb-0">
                Manage your lending transactions and track item statuses
              </p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-4">
          <SimpleFilter 
            filter={filter} 
            setFilter={setFilter} 
            statusOptions={statusOptions} 
          />
        </div>
        
        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-4">
              <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
            </div>
            <h5 className="text-muted mb-3">No transactions found</h5>
            <p className="text-muted">
              {filter.status || filter.name || filter.maxPrice 
                ? 'Try adjusting your filters to see more results.' 
                : 'You don\'t have any lending transactions yet.'}
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredTransactions.map(tx => {
              const itemTitle = tx.item?.title || 'Unknown Item';
              const borrowerName = tx.borrower?.nickname || tx.borrower?.email || 
                                  `${tx.borrower?.firstName || ''} ${tx.borrower?.lastName || ''}`.trim() || 'Unknown';
              const lenderName = tx.lender?.nickname || tx.lender?.email || 
                                `${tx.lender?.firstName || ''} ${tx.lender?.lastName || ''}`.trim() || 
                                tx.item?.owner?.nickname || tx.item?.owner?.email || 'Unknown';
              const requestDate = tx.requestDate ? new Date(tx.requestDate).toLocaleDateString() : 'Unknown';
              const requestTime = tx.requestDate ? new Date(tx.requestDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

              const isTransactionActive = hasActiveButtons(tx, user, hiddenNotifications) || hasNewNotification(tx, user, hiddenNotifications);
              
              return (
                <div key={tx._id} className="col-lg-6 col-xl-4">
                  <Card 
                    className="modern-card h-100 border-0 shadow-sm"
                    style={{ 
                      cursor: 'pointer',
                      opacity: isTransactionActive ? 1 : 
                        (['completed', 'rejected', 'retracted'].includes(tx.status) ? 0.6 : 1),
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => navigate(`/transactions/${tx._id}`)}
                  >
                    <Card.Body className="p-4">
                      {/* Header with item title and status */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="flex-grow-1 me-3">
                          <h5 className="card-title mb-2 fw-bold">{itemTitle}</h5>
                          <div className="d-flex gap-2 align-items-center">
                            <StatusBadge status={tx.status} />
                            {/* Payment notification for lender - only when status is borrowed (after pickup code) */}
                            {user?.id === tx.lender?._id && tx.status === 'borrowed' && tx.paymentToLenderReleased && (
                              <Badge 
                                bg="success" 
                                className="d-flex align-items-center gap-1"
                                style={{ 
                                  fontSize: '0.75rem',
                                  padding: '0.4em 0.8em',
                                  borderRadius: '15px',
                                  fontWeight: '500'
                                }}
                              >
                                💰 Payment Received
                              </Badge>
                            )}
                          </div>
                        </div>
                        {tx.item?.images && tx.item.images.length > 0 && (
                          <div 
                            className="flex-shrink-0"
                            style={{ width: '60px', height: '60px' }}
                          >
                            <img
                              src={`/api/items/${tx.item._id}/image/0`}
                              alt=""
                              className="rounded"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Transaction details */}
                      <div className="mb-3">
                        <div className="text-muted small mb-2">
                          <div className="d-flex justify-content-between">
                            <span>Borrower:</span>
                            <span className="fw-medium text-dark">{borrowerName}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Lender:</span>
                            <span className="fw-medium text-dark">{lenderName}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Requested:</span>
                            <span className="fw-medium text-dark">{requestDate} {requestTime}</span>
                          </div>
                          {tx.item?.price && (
                            <div className="d-flex justify-content-between">
                              <span>Total Cost:</span>
                              <span className="fw-medium text-dark">
                                €{computeWeeklyCharge(tx.requestedFrom, tx.requestedTo, tx.item.price)}
                              </span>
                            </div>
                          )}
                          {tx.item?.price && (
                            <div className="d-flex justify-content-between">
                              <span className="text-muted small">Weekly Rate:</span>
                              <span className="text-muted small">€{tx.item.price}/week</span>
                            </div>
                          )}
                          
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-auto" onClick={e => e.stopPropagation()}>
                        <ActionButtons
                          transaction={tx}
                          user={user}
                          onAction={fetchTransactions}
                          hiddenNotifications={hiddenNotifications}
                          onHideNotification={handleHideNotification}
                        />
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}