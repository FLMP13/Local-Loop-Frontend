import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { Link, useNavigate } from 'react-router-dom';
import SimpleFilter from './SimpleFilter';
import Badge from 'react-bootstrap/Badge';
import { 
  CheckCircle, 
  XCircle, 
  PencilSquare, 
  Trash, 
  CreditCard, 
  Key, 
  ShieldCheck, 
  ExclamationTriangle, 
  CheckSquare,
  CurrencyDollar,
  ArrowRepeat
} from 'react-bootstrap-icons';

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
};

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || 'secondary';
  const label = {
    requested: 'Requested',
    accepted: 'Accepted',
    rejected: 'Rejected',
    renegotiation_requested: 'Renegotiation',
    completed: 'Completed',
    borrowed: 'Borrowed',
    paid: 'Paid',
    returned: 'Returned',
    retracted: 'Retracted'
  }[status] || status;
  
  return (
    <Badge bg={color} className="text-capitalize">
      {label}
    </Badge>
  );
}

export default function TransactionList({ context = 'all' }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasErrorOccurred, setHasErrorOccurred] = useState(false);
  
  // Initialize filter with all required properties to prevent undefined access
  const [filter, setFilter] = useState({
    name: '',
    status: 'all',
    maxPrice: '',
    sortBy: 'date_desc'
  });

  // Error boundary effect to catch and handle the specific error
  useEffect(() => {
    const handleError = (event) => {
      if (event.error && event.error.message && 
          event.error.message.includes("Cannot read properties of undefined (reading 'name')")) {
        console.log('Detected filter initialization error, reloading page...');
        if (!hasErrorOccurred) {
          setHasErrorOccurred(true);
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [hasErrorOccurred]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    // Only call handleFilter when we have the filter state properly initialized
    if (filter && transactions) {
      handleFilter(filter);
    }
  }, [filter, transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = '/api/transactions';
      if (context === 'borrowings') {
        url = '/api/transactions/borrowings';
      } else if (context === 'lendings') {
        url = '/api/transactions/lendings';
      }
      
      console.log('Fetching transactions from:', url);
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      console.log('Received transaction data:', data);
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filterParam) => {
    try {
      // Ensure we have a valid filter object with all required properties
      const safeFilter = {
        name: '',
        status: 'all',
        maxPrice: '',
        sortBy: 'date_desc',
        ...(filterParam || filter || {})
      };
      
      // Defensive check to ensure transactions array exists
      if (!Array.isArray(transactions)) {
        setFilteredTransactions([]);
        return;
      }
      
      let filtered = [...transactions]; // Create a copy to avoid mutation
      
      if (safeFilter.name) {
        filtered = filtered.filter(t => 
          t?.item?.title?.toLowerCase().includes(safeFilter.name.toLowerCase())
        );
      }
      
      if (safeFilter.status && safeFilter.status !== 'all') {
        filtered = filtered.filter(t => t?.status === safeFilter.status);
      }
      
      if (safeFilter.maxPrice) {
        filtered = filtered.filter(t => {
          const price = t?.pricing?.finalPrice || t?.totalPrice || t?.finalLendingFee || 0;
          return price <= parseFloat(safeFilter.maxPrice);
        });
      }
      
      // Apply sorting
      if (safeFilter.sortBy) {
        filtered = filtered.sort((a, b) => {
          const dateA = new Date(a?.requestDate || a?.createdAt || 0);
          const dateB = new Date(b?.requestDate || b?.createdAt || 0);
          
          if (safeFilter.sortBy === 'date_desc') {
            return dateB - dateA; // Newest first
          } else if (safeFilter.sortBy === 'date_asc') {
            return dateA - dateB; // Oldest first
          }
          return 0;
        });
      }
      
      setFilteredTransactions(filtered);
    } catch (error) {
      console.error('Error in handleFilter:', error);
      if (error.message && error.message.includes("Cannot read properties of undefined (reading 'name')")) {
        console.log('Triggering page reload due to filter error...');
        if (!hasErrorOccurred) {
          setHasErrorOccurred(true);
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      }
    }
  };

  const handleAccept = async (transactionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/transactions/${transactionId}/accept`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchTransactions(); // Refresh the list
      }
    } catch (err) {
      console.error('Failed to accept transaction:', err);
    }
  };

  const handleReject = async (transactionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/transactions/${transactionId}/decline`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchTransactions(); // Refresh the list
      }
    } catch (err) {
      console.error('Failed to reject transaction:', err);
    }
  };

  const renderActionButtons = (transaction) => {
    const isLender = user?.id === transaction.lender?._id;
    const isBorrower = user?.id === transaction.borrower?._id;

    // Lender actions for requested transactions
    if (isLender && transaction.status === 'requested') {
      return (
        <div className="d-flex gap-2 flex-wrap">
          <Button
            variant="success"
            size="sm"
            onClick={e => { e.stopPropagation(); handleAccept(transaction._id); }}
            className="rounded-pill"
          >
            <CheckCircle className="me-1" />
            Accept
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={e => { e.stopPropagation(); handleReject(transaction._id); }}
            className="rounded-pill"
          >
            <XCircle className="me-1" />
            Reject
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}`); }}
            className="rounded-pill"
          >
            <PencilSquare className="me-1" />
            Renegotiate
          </Button>
        </div>
      );
    }

    // Borrower actions for accepted transactions (need to pay)
    if (isBorrower && transaction.status === 'accepted') {
      return (
        <div className="d-flex gap-2">
          <Button
            variant="success"
            size="sm"
            onClick={e => { e.stopPropagation(); navigate(`/payment/${transaction._id}`); }}
            className="rounded-pill"
          >
            <CheckCircle className="me-1" />
            Pay Now
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={e => { e.stopPropagation(); handleReject(transaction._id); }}
            className="rounded-pill"
          >
            <XCircle className="me-1" />
            Decline
          </Button>
        </div>
      );
    }

    // Edit/Delete for pending transactions
    if ((isLender || isBorrower) && ['requested', 'renegotiation_requested'].includes(transaction.status)) {
      return (
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            as={Link}
            to={`/transactions/${transaction._id}/edit`}
            className="rounded-pill"
          >
            <PencilSquare className="me-1" />
            Edit
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={e => { e.stopPropagation(); /* Add delete handler */ }}
            className="rounded-pill"
          >
            <Trash className="me-1" />
            Delete
          </Button>
        </div>
      );
    }

    // Payment button for paid transactions that need action
    if (transaction.status === 'paid') {
      return (
        <Button
          variant="primary"
          size="sm"
          as={Link}
          to={`/payment/${transaction._id}`}
          className="rounded-pill"
        >
          <CreditCard className="me-1" />
          View Payment
        </Button>
      );
    }

    // Pickup code for borrowed items
    if (transaction.status === 'borrowed' && isLender) {
      return (
        <Button
          variant="info"
          size="sm"
          as={Link}
          to={`/transactions/${transaction._id}`}
          className="rounded-pill"
        >
          <Key className="me-1" />
          Pickup Code
        </Button>
      );
    }

    // Return actions for borrowed items
    if (transaction.status === 'borrowed') {
      if (isBorrower) {
        return (
          <Button
            variant="success"
            size="sm"
            onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}?showReturn=1`); }}
            className="rounded-pill"
          >
            <ShieldCheck className="me-1" />
            Confirm Return
          </Button>
        );
      }
      // For lenders, don't show anything here - they get "Report Issue" and "Mark Complete" after status is 'returned'
    }

    // Return code entry for returned items (only if not already entered)
    if (transaction.status === 'returned' && isBorrower && !transaction.returnCodeUsed) {
      return (
        <Button
          variant="success"
          size="sm"
          onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}?showReturn=1`); }}
          className="w-100 rounded-pill"
        >
          Enter Return Code
        </Button>
      );
    }

    // Damage resolution for returned items with issues
    if (transaction.status === 'returned' && transaction.damageReported) {
      return (
        <Button
          variant="warning"
          size="sm"
          onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}`); }}
          className="w-100 rounded-pill"
        >
          <ExclamationTriangle className="me-1" />
          Resolve Damage
        </Button>
      );
    }

    // Completion actions - ONLY FOR LENDERS
    if (transaction.status === 'returned' && !transaction.damageReported && isLender) {
      return (
        <div className="d-flex gap-2 flex-wrap">
          <Button
            variant="warning"
            size="sm"
            onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}?showDamage=1`); }}
            className="w-100 rounded-pill"
          >
            <ExclamationTriangle className="me-1" />
            Report Issue
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={e => { e.stopPropagation(); navigate(`/transactions/${transaction._id}?complete=1`); }}
            className="w-100 rounded-pill"
          >
            <CheckSquare className="me-1" />
            Mark Complete
          </Button>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="text-muted">Loading transactions...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <ExclamationTriangle className="me-2" />
        {error}
      </Alert>
    );
  }

  return (
    <Container fluid className="p-0">
      {/* Only render SimpleFilter when filter state is properly initialized */}
      {filter && filter.hasOwnProperty('sortBy') ? (
        <SimpleFilter filter={filter} setFilter={setFilter} onFilter={handleFilter} />
      ) : (
        <div className="mb-3" style={{ height: '56px' }}>
          <div className="text-muted text-center">Initializing filters...</div>
        </div>
      )}
      
      {filteredTransactions.length === 0 ? (
        <Alert variant="info" className="text-center">
          <div>No transactions found</div>
          {context === 'all' && (
            <div className="mt-2">
              <Button as={Link} to="/items" variant="primary" className="rounded-pill">
                Browse Items to Rent
              </Button>
            </div>
          )}
        </Alert>
      ) : (
        <div className="row g-3">
          {filteredTransactions.map(transaction => (
            <div key={transaction._id} className="col-12">
              <Card 
                className="border-0 shadow-sm transaction-card" 
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/transactions/${transaction._id}`)}
              >
                <Card.Body>
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <div className="d-flex align-items-start gap-3">
                        {transaction.item?.images?.length > 0 && (
                          <img
                            src={`/api/items/${transaction.item._id}/image/0`}
                            alt={transaction.item?.title || 'Item'}
                            className="rounded"
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        <div className="flex-grow-1">
                          <h5 className="mb-1">{transaction.item?.title || 'Unknown Item'}</h5>
                          <StatusBadge status={transaction.status} />
                          <div className="text-muted small mt-1">
                            {context === 'borrowings' ? 'Lender' : context === 'lendings' ? 'Borrower' : 'With'}: {' '}
                            <strong>
                              {context === 'borrowings' 
                                ? transaction.lender?.nickname 
                                : context === 'lendings'
                                ? transaction.borrower?.nickname
                                : user?.id === transaction.lender?._id 
                                  ? transaction.borrower?.nickname 
                                  : transaction.lender?.nickname}
                            </strong>
                          </div>
                          <div className="text-muted small">
                            Duration: {(() => {
                              if (transaction.requestedFrom && transaction.requestedTo) {
                                const days = Math.ceil((new Date(transaction.requestedTo) - new Date(transaction.requestedFrom)) / (1000 * 60 * 60 * 24)) + 1;
                                return `${days} days`;
                              }
                              return 'Unknown duration';
                            })()} • Total: €{(() => {
                              const price = transaction.pricing?.finalPrice || transaction.totalPrice || transaction.finalLendingFee || 0;
                              return price.toFixed(2);
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex flex-column gap-2 align-items-end">
                        {renderActionButtons(transaction)}
                        <small className="text-muted">
                          {transaction.requestDate ? new Date(transaction.requestDate).toLocaleDateString() : 'Unknown date'}
                        </small>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
