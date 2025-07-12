import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CounterContext } from '../App.jsx';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import ReviewModal from '../components/ReviewModal';
import axios from 'axios';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import Modal from 'react-bootstrap/Modal';

const STATUS_COLORS = {
  requested: '#2196F3',
  accepted: 'var(--brand)',
  paid: '#00BCD4',
  rejected: '#F44336',
  borrowed: '#3F51B5',
  returned: '#FFC107',
  completed: '#9E9E9E',
  renegotiation_requested: '#FF9800',
  retracted: '#757575'
};

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#757575';
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
    <Badge 
      style={{ 
        backgroundColor: color,
        color: 'white',
        fontSize: '0.9rem', 
        padding: '8px 16px',
        borderRadius: '8px',
        fontWeight: '500'
      }}
      className="mb-3"
    >
      {label}
    </Badge>
  );
}

export default function ShowTransaction() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { fetchCounts } = useContext(CounterContext);
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [canReview, setCanReview] = useState({ canReview: false, role: null });
  const [renegotiateRange, setRenegotiateRange] = useState();
  const [showRenegotiateForm, setShowRenegotiateForm] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnCode, setReturnCode] = useState('');
  const [lenderCode, setLenderCode] = useState('');
  const [returnError, setReturnError] = useState('');
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [pickupError, setPickupError] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/transactions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch transaction');
        const data = await res.json();
        setTransaction(data);
      } catch (err) {
        setError('Failed to load transaction.');
        setShowError(true);
      }
    };
    fetchTransaction();
  }, [id]);

  useEffect(() => {
    const checkCanReview = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/reviews/can-review/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCanReview(data);
        }
      } catch (err) {
        console.error('Failed to check review status');
      }
    };

    if (transaction) {
      checkCanReview();
    }
  }, [id, transaction]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('showPickup') === '1') setShowPickupModal(true);
    if (params.get('showReturn') === '1') setShowReturnModal(true);
  }, [location.search]);

  const handleAction = async (action) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You must be logged in to perform this action.');
      await fetch(`/api/transactions/${transaction._id}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refetch transaction data
      const res = await fetch(`/api/transactions/${transaction._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTransaction(data);
    } catch (err) {
      setError(err.message || 'An error occurred while updating the transaction.');
      setShowError(true);
    }
    setUpdating(false);
  };

  const handleCompleteTransaction = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You must be logged in to complete the transaction.');
      await fetch(`/api/transactions/${transaction._id}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refetch transaction data
      const res = await fetch(`/api/transactions/${transaction._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTransaction(data);
    } catch (err) {
      setError(err.message || 'Failed to complete transaction.');
      setShowError(true);
    }
    setUpdating(false);
  };

  const handleReviewSubmitted = async () => {
    setCanReview({ canReview: false, role: null });
    setShowReviewModal(false);
    
    // Determine which user was reviewed and their role
    const reviewedUserId = canReview.role === 'borrower' 
      ? transaction.lender._id 
      : transaction.borrower._id;
    const reviewedUserRole = canReview.role === 'borrower' ? 'lender' : 'borrower';
    
    // Navigate to the reviewed user's page with the appropriate tab
    navigate(`/users/${reviewedUserId}/reviews?tab=${reviewedUserRole}`);
  };

  const handleRenegotiate = async ({ from, to, message }, id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You must be logged in to renegotiate.');
      await axios.patch(
        `/api/transactions/${transaction._id}/renegotiate`,
        { from, to, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refetch transaction data to update UI
      const res = await fetch(`/api/transactions/${transaction._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTransaction(data);
      setShowRenegotiateForm(null);
      setRenegotiateRange(undefined);
      setError('');
      setShowError(false);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to send renegotiation proposal.'
      );
      setShowError(true);
    }
  };

  const handleAcceptRenegotiation = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You must be logged in to accept.');
      await axios.patch(`/api/transactions/${id}/renegotiation/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refetch transaction data to update UI
      const res = await fetch(`/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTransaction(data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to accept renegotiation.'
      );
      setShowError(true);
    }
  };

  const handleDeclineRenegotiation = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You must be logged in to decline.');
      await axios.patch(`/api/transactions/${id}/renegotiation/decline`, { message: "Sorry, can't do those dates." }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refetch transaction data to update UI
      const res = await fetch(`/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTransaction(data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to decline renegotiation.'
      );
      setShowError(true);
    }
  };

  const handleDeleteClick = async () => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/transactions/${transaction._id}/retract`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCounts();
      navigate(-1);
    } catch (err) {
      setError('Failed to delete transaction.');
      setShowError(true);
    }
  };

  const handleGetReturnCode = async () => {
    setReturnError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/transactions/${transaction._id}/return-code`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setLenderCode(data.code);
      } else {
        setReturnError(data.error || 'Failed to get code');
      }
    } catch (err) {
      setReturnError('Failed to get code');
    }
  };

  const handleSubmitReturnCode = async () => {
    setReturnError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/transactions/${transaction._id}/return-code`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: returnCode })
      });
      const data = await res.json();
      if (res.ok) {
        // Close the return modal first
        setShowReturnModal(false);
        // Clear the return code input
        setReturnCode('');
        
        // Always refetch the complete transaction data to ensure consistency
        try {
          const refetchRes = await fetch(`/api/transactions/${transaction._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (refetchRes.ok) {
            const fullData = await refetchRes.json();
            setTransaction(fullData);
            
            // Set review permission and role for the borrower
            setCanReview({ canReview: true, role: 'borrower' });
            // Update counters since transaction status changed
            fetchCounts();
            // Show the review modal after ensuring transaction data is updated
            setTimeout(() => {
              setShowReviewModal(true);
            }, 200);
          } else {
            setReturnError('Failed to load updated transaction data');
          }
        } catch (refetchErr) {
          console.error('Failed to refetch transaction:', refetchErr);
          setReturnError('Failed to load updated transaction data');
        }
      } else {
        setReturnError(data.error || 'Incorrect code');
      }
    } catch (err) {
      setReturnError('Failed to submit code');
    }
  };

  const handleForceComplete = async () => {
    setReturnError('');
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/transactions/${transaction._id}/return-complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        // Refetch transaction data to update the UI
        const refetchRes = await fetch(`/api/transactions/${transaction._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (refetchRes.ok) {
          const updatedTransaction = await refetchRes.json();
          setTransaction(updatedTransaction);
          fetchCounts();
          setShowReturnModal(false);
        } else {
          setReturnError('Failed to load updated transaction data');
        }
      } else {
        setReturnError('Failed to complete return');
      }
    } catch (err) {
      setReturnError('Failed to complete return');
    }
    setUpdating(false);
  };

  const handlePickupCodeSubmit = async () => {
    setPickupError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/transactions/${transaction._id}/pickup-code`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: pickupCodeInput })
      });
      const data = await res.json();
      if (res.ok) {
        setTransaction(data);
        setShowPickupModal(false);
        setPickupCodeInput('');
      } else {
        setPickupError(data.error || 'Invalid code');
      }
    } catch (err) {
      setPickupError('Failed to submit code');
    }
  };

  // Image modal functions
  const openImageModal = (index) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextImage = () => {
    if (transaction?.item?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % transaction.item.images.length);
    }
  };

  const prevImage = () => {
    if (transaction?.item?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + transaction.item.images.length) % transaction.item.images.length);
    }
  };

  // Keyboard navigation for image modal
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!showImageModal) return;
      
      if (e.key === 'Escape') {
        closeImageModal();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showImageModal, transaction?.item?.images?.length]);

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!transaction) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" style={{ color: 'var(--brand)' }} />
        <p className="mt-3 text-muted">Loading transaction...</p>
      </div>
    );
  }

  const { item, status, borrower, lender, requestDate } = transaction;

  return (
    <Container className="container-zoomed py-zoomed" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {showError && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setShowError(false)}
          className="mb-4"
        >
          {error}
        </Alert>
      )}
      
      {/* Modern Hero Section */}
      <div className="modern-transaction-hero mb-3">
        <Row className="row-zoomed align-items-center">
          <Col>
            <h1 className="display-5 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Transaction Details
            </h1>
            <p className="lead text-muted mb-0">
              Manage your transaction and track its progress
            </p>
          </Col>
          <Col xs="auto">
            <div className="d-flex gap-2 align-items-center">
              {(() => {
                // Lender: Accept/Decline/Renegotiate if requested
                if (user?.id === transaction.lender?._id && transaction.status === 'requested') {
                  return (
                    <>
                      <Button
                        variant="success"
                        disabled={updating}
                        onClick={() => handleAction('accept')}
                        className="rounded-pill"
                      >
                        ✓ Accept
                      </Button>
                      <Button
                        variant="danger"
                        disabled={updating}
                        onClick={() => handleAction('decline')}
                        className="rounded-pill"
                      >
                        ✗ Decline
                      </Button>
                      <Button
                        variant="warning"
                        disabled={updating}
                        onClick={() => setShowRenegotiateForm(transaction._id)}
                        className="rounded-pill"
                      >
                        ⟲ Renegotiate
                      </Button>
                    </>
                  );
                }
                // Borrower: Accept/Decline if renegotiation_requested
                if (user?.id === transaction.borrower?._id && transaction.status === 'renegotiation_requested') {
                  return (
                    <>
                      <Button
                        variant="success"
                        disabled={updating}
                        onClick={() => handleAcceptRenegotiation(transaction._id)}
                        className="rounded-pill"
                      >
                        ✓ Accept Proposal
                      </Button>
                      <Button
                        variant="danger"
                        disabled={updating}
                        onClick={() => handleDeclineRenegotiation(transaction._id)}
                        className="rounded-pill"
                      >
                        ✗ Decline Proposal
                      </Button>
                    </>
                  );
                }
                // Borrower: Edit/Delete for requested or renegotiation_requested
                if (
                  user?.id === transaction.borrower?._id &&
                  ['requested', 'renegotiation_requested'].includes(transaction.status)
                ) {
                  return (
                    <>
                      <Button 
                        variant="outline-primary" 
                        onClick={() => navigate(`/transactions/${transaction._id}/edit`)}
                        className="rounded-pill"
                      >
                        ✏️ Edit Request
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        onClick={handleDeleteClick}
                        className="rounded-pill"
                      >
                        🗑️ Delete Request
                      </Button>
                    </>
                  );
                }
                // Borrower: Pay button for accepted
                if (
                  user?.id === transaction.borrower?._id &&
                  transaction.status === 'accepted'
                ) {
                  return (
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/payment/${transaction._id}`)}
                      className="rounded-pill px-4"
                      size="lg"
                    >
                      💳 Pay Now
                    </Button>
                  );
                }
                // Lender: Enter pickup code after payment
                if (
                  user?.id === transaction.lender?._id &&
                  transaction.status === 'paid'
                ) {
                  return (
                    <Button
                      variant="success"
                      onClick={() => setShowPickupModal(true)}
                      disabled={updating}
                      className="rounded-pill"
                    >
                      🔑 Enter Pickup Code
                    </Button>
                  );
                }
                // Lender: Generate/View Return Code and Force Return if borrowed
                if (
                  user?.id === transaction.lender?._id &&
                  transaction.status === 'borrowed'
                ) {
                  return (
                    <>
                      <Button
                        variant="info"
                        onClick={handleGetReturnCode}
                        disabled={updating}
                        className="rounded-pill"
                      >
                        🔐 Generate Return Code
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={handleForceComplete}
                        disabled={updating}
                        className="rounded-pill"
                      >
                        ⚠️ Force Return
                      </Button>
                    </>
                  );
                }
                // Borrower: Enter the code after returning the item
                if (
                  user?.id === transaction.borrower?._id &&
                  transaction.status === 'borrowed'
                ) {
                  return (
                    <Button
                      variant="success"
                      onClick={() => setShowReturnModal(true)}
                      disabled={updating}
                      className="rounded-pill"
                    >
                      📦 Return Item
                    </Button>
                  );
                }
                // Borrower: Force Pick Up if paid
                if (
                  user?.id === transaction.borrower?._id &&
                  transaction.status === 'paid'
                ) {
                  return (
                    <Button
                      variant="outline-warning"
                      onClick={async () => {
                        setUpdating(true);
                        setError('');
                        try {
                          const token = localStorage.getItem('token');
                          const res = await fetch(`/api/transactions/${transaction._id}/force-pickup`, {
                            method: 'PATCH',
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          const data = await res.json();
                          if (res.ok) {
                            setTransaction(data);
                          } else {
                            setError(data.error || 'Failed to force pick up');
                            setShowError(true);
                          }
                        } catch (err) {
                          setError('Failed to force pick up');
                          setShowError(true);
                        }
                        setUpdating(false);
                      }}
                      disabled={updating}
                      className="rounded-pill"
                    >
                      ⚠️ Force Pick Up
                    </Button>
                  );
                }
                // Add Review Button if available
                if (canReview.canReview) {
                  return (
                    <Button
                      variant="primary"
                      onClick={() => setShowReviewModal(true)}
                      className="rounded-pill"
                    >
                      ⭐ Leave Review
                    </Button>
                  );
                }
                return null;
              })()}
            </div>
          </Col>
        </Row>
      </div>
      
      {/* Renegotiation Form - shown below hero when active */}
      {showRenegotiateForm === transaction._id && (
        <Card className="card-zoomed">
          <Card.Body>
            <h6>Propose New Dates</h6>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (!renegotiateRange?.from || !renegotiateRange?.to) return;
                handleRenegotiate(
                  {
                    from: renegotiateRange.from,
                    to: renegotiateRange.to,
                    message: e.target.message.value
                  },
                  transaction._id
                );
              }}
            >
              <div className="calendar-container mb-3">
                <DayPicker
                  mode="range"
                  selected={renegotiateRange}
                  onSelect={setRenegotiateRange}
                  disabled={{ before: new Date() }}
                />
              </div>
              <input 
                type="text" 
                name="message" 
                placeholder="Optional message for the borrower" 
                className="form-control mb-3" 
              />
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-warning rounded-pill">Send Proposal</button>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary rounded-pill"
                  onClick={() => setShowRenegotiateForm(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card.Body>
        </Card>
      )}
      
      {/* Alert Cards */}
      {user?.id === transaction.borrower?._id && transaction.pickupCode && !transaction.pickupCodeUsed && (
        <Card className="card-zoomed border-info">
          <Card.Body className="bg-light">
            <div className="d-flex align-items-start">
              <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                🔑
              </div>
              <div>
                <h6 className="fw-bold mb-2">PickUp Code</h6>
                <p className="mb-2">
                  <code className="bg-white px-2 py-1 rounded">{transaction.pickupCode}</code>
                </p>
                <small className="text-muted">
                  Give this code to the lender when picking up the item.
                  {lender?.email && (
                    <>
                      <br />
                      Contact: <a href={`mailto:${lender.email}`}>{lender.email}</a>
                    </>
                  )}
                </small>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
      
      {user?.id === transaction.lender?._id && lenderCode && (
        <Card className="card-zoomed border-success">
          <Card.Body className="bg-light">
            <div className="d-flex align-items-start">
              <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                🔐
              </div>
              <div>
                <h6 className="fw-bold mb-2">Return Code</h6>
                <p className="mb-2">
                  <code className="bg-white px-2 py-1 rounded">{lenderCode}</code>
                </p>
                <small className="text-muted">
                  Give this code to the borrower when they return the item.
                </small>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Modern Two-Column Layout */}
      <Row className="row-zoomed g-3">
        {/* Left Column - Transaction Details */}
        <Col lg={8}>
          {/* Combined Transaction Information and Timeline Card */}
          <Card className="card-zoomed shadow-sm">
            <Card.Header className="bg-white border-bottom-0 pb-0">
              <h5 className="fw-bold mb-0">Transaction Details</h5>
            </Card.Header>
            <Card.Body>
              <Row className="row-zoomed g-4">
                {/* Left Side - Transaction Information */}
                <Col md={6}>
                  <h6 className="fw-bold mb-3 text-muted text-uppercase">Information</h6>
                  <div className="d-flex flex-column gap-3">
                    <div className="border-start border-3 ps-3" style={{ borderColor: 'var(--brand) !important' }}>
                      <small className="text-muted text-uppercase fw-semibold">Borrower</small>
                      <div className="d-flex align-items-center gap-2">
                        <p className="mb-0 fw-semibold">{borrower?.nickname || borrower?.email}</p>
                        {user && user.id === transaction.lender?._id && transaction.borrower?._id && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded-pill px-2 py-1"
                            style={{ fontSize: '0.75rem', lineHeight: '1' }}
                            onClick={() => navigate(`/users/${transaction.borrower._id}/reviews?tab=borrower`)}
                          >
                            👤 Reviews
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-start border-3 ps-3" style={{ borderColor: 'var(--brand-dark) !important' }}>
                      <small className="text-muted text-uppercase fw-semibold">Lender</small>
                      <div className="d-flex align-items-center gap-2">
                        <p className="mb-0 fw-semibold">{lender?.nickname || lender?.email || item?.owner?.nickname || item?.owner?.email}</p>
                        {user && user.id === transaction.borrower?._id && transaction.lender?._id && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded-pill px-2 py-1"
                            style={{ fontSize: '0.75rem', lineHeight: '1' }}
                            onClick={() => navigate(`/users/${transaction.lender._id}/reviews?tab=lender`)}
                          >
                            👤 Reviews
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-start border-3 ps-3" style={{ borderColor: 'var(--text-secondary) !important' }}>
                      <small className="text-muted text-uppercase fw-semibold">Requested Date</small>
                      <p className="mb-0">{new Date(requestDate).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="border-start border-3 ps-3" style={{ borderColor: 'var(--text-secondary) !important' }}>
                      <small className="text-muted text-uppercase fw-semibold">Status</small>
                      <p className="mb-0">
                        <StatusBadge status={status} />
                      </p>
                    </div>
                  </div>
                </Col>

                {/* Right Side - Timeline */}
                {(transaction.requestedFrom && transaction.requestedTo) && (
                  <Col md={6}>
                    <h6 className="fw-bold mb-3 text-muted text-uppercase">Timeline</h6>
                    <div className="h-100">
                      <h6 className="text-muted text-uppercase fw-semibold mb-3">Requested Period</h6>
                      <div className="calendar-container">
                        <DayPicker
                          mode="range"
                          selected={{
                            from: new Date(transaction.requestedFrom),
                            to: new Date(transaction.requestedTo)
                          }}
                          disabled={() => true}
                          showOutsideDays
                        />
                      </div>
                      
                      {/* Renegotiation proposal if exists */}
                      {transaction.status === 'renegotiation_requested' &&
                        transaction.renegotiation?.from && transaction.renegotiation?.to && (
                          <div className="mt-4">
                            <h6 className="text-warning text-uppercase fw-semibold mb-3">Renegotiation Proposal</h6>
                            <div className="calendar-container">
                              <DayPicker
                                mode="range"
                                selected={{
                                  from: new Date(transaction.renegotiation.from),
                                  to: new Date(transaction.renegotiation.to)
                                }}
                                disabled={() => true}
                                showOutsideDays
                              />
                            </div>
                            {transaction.renegotiation.message && (
                              <div className="mt-3 p-3 bg-light rounded">
                                <small className="text-muted fw-semibold">Message:</small>
                                <p className="mb-0 mt-1">{transaction.renegotiation.message}</p>
                              </div>
                            )}
                          </div>
                      )}
                    </div>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>

          {/* Rejection message section */}
          {transaction.status === 'rejected' && (
            <Card className="card-zoomed shadow-sm border-danger">
              <Card.Body>
                <div className="d-flex align-items-start">
                  <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                    ❌
                  </div>
                  <div>
                    <h6 className="fw-bold text-danger mb-2">Request Declined</h6>
                    <p className="mb-0 text-muted">
                      {transaction.lenderMessage ? transaction.lenderMessage : 'The lender has declined your request.'}
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

        </Col>

        {/* Right Column - Item Details */}
        <Col lg={4}>
          <div className="sticky-top sticky-top-zoomed">
            {item && (
              <Card className="card-zoomed shadow-sm">
                {/* Item Images */}
                {item.images && item.images.length > 0 && (
                  <div className="modern-image-gallery">
                    <div className="main-image">
                      <Card.Img
                        variant="top"
                        src={`/api/items/${item._id}/image/0`}
                        alt={item.title}
                        style={{ 
                          height: '250px', 
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                        onClick={() => openImageModal(0)}
                      />
                    </div>
                    {item.images.length > 1 && (
                      <div className="d-flex gap-2 p-3 overflow-auto">
                        {item.images.slice(1).map((_, idx) => (
                          <img
                            key={idx + 1}
                            src={`/api/items/${item._id}/image/${idx + 1}`}
                            alt={`${item.title} ${idx + 2}`}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                            className="border"
                            onClick={() => openImageModal(idx + 1)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <Card.Body>
                  <h4 className="fw-bold mb-3">{item.title}</h4>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Price</span>
                      <span className="h5 fw-bold mb-0" style={{ color: 'var(--brand)' }}>
                        €{item.price}/week
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Category</span>
                      <Badge bg="light" text="dark" className="rounded-pill">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Location</span>
                      <span>{item.owner?.zipCode}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Owner</span>
                      <span>
                        {item.owner?._id ? (
                          <Link 
                            to={`/users/${item.owner._id}/reviews`} 
                            style={{ color: 'var(--brand)', textDecoration: 'none' }}
                          >
                            {item.owner.nickname || item.owner.email}
                          </Link>
                        ) : (
                          item.owner?.nickname || item.owner?.email
                        )}
                      </span>
                    </div>
                  </div>

                  {item.description && (
                    <div className="mb-3">
                      <h6 className="text-muted text-uppercase fw-semibold mb-2">Description</h6>
                      <p className="mb-0">{item.description}</p>
                    </div>
                  )}

                  <Button
                    variant="outline-primary"
                    onClick={() => navigate(`/items/${item._id}`)}
                    className="w-100 rounded-pill"
                  >
                    View Full Item Details
                  </Button>
                </Card.Body>
              </Card>
            )}
          </div>
        </Col>
      </Row>

      {transaction && transaction._id && (transaction.borrower || transaction.lender) && (
        <ReviewModal
          show={showReviewModal}
          onHide={() => setShowReviewModal(false)}
          transaction={transaction}
          userRole={canReview.role}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Return Code Modal */}
      <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Return Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Lender: Generate/View Return Code and Accept Return Without Code */}
          {user?.id === transaction.lender?._id && transaction.status === 'borrowed' && (
            <>
              <p>Give this code to the borrower when they return the item:</p>
              <Button
                onClick={handleGetReturnCode}
                variant="info"
                className="mb-2"
                disabled={updating}
              >
                Generate/View Code
              </Button>
              {lenderCode && (
                <div className="alert alert-success">
                  Return Code: <strong>{lenderCode}</strong>
                </div>
              )}
              <Button
                onClick={handleForceComplete}
                variant="danger"
                className="mt-2"
                disabled={updating}
              >
                Accept Return Without Code
              </Button>
            </>
          )}

          {/* Borrower: Enter Return Code */}
          {user?.id === transaction.borrower?._id && transaction.status === 'borrowed' && (
            <>
              <p>Enter the code you received from the lender to mark the item as returned:</p>
              <input
                type="text"
                value={returnCode}
                onChange={e => setReturnCode(e.target.value)}
                className="form-control mb-2"
              />
              <Button
                onClick={handleSubmitReturnCode}
                variant="success"
                disabled={updating}
              >
                Submit Code
              </Button>
            </>
          )}

          {returnError && (
            <div className="alert alert-danger mt-2">{returnError}</div>
          )}
        </Modal.Body>
      </Modal>

      {/* Pickup Code Modal */}
      <Modal show={showPickupModal} onHide={() => setShowPickupModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enter PickUp Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Enter the code you received from the borrower to mark the item as borrowed:</p>
          <input
            type="text"
            value={pickupCodeInput}
            onChange={e => setPickupCodeInput(e.target.value)}
            className="form-control mb-2"
          />
          <Button
            variant="success"
            onClick={async () => {
              setPickupError('');
              setUpdating(true);
              try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/transactions/${transaction._id}/pickup-code`, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ code: pickupCodeInput })
                });
                const data = await res.json();
                if (res.ok) {
                  setShowPickupModal(false);
                  setPickupCodeInput('');
                  // Refetch transaction data
                  const res2 = await fetch(`/api/transactions/${transaction._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const updated = await res2.json();
                  setTransaction(updated);
                } else {
                  setPickupError(data.error || 'Incorrect code');
                }
              } catch (err) {
                setPickupError('Failed to submit code');
              }
              setUpdating(false);
            }}
          >
            Submit Code
          </Button>
          {pickupError && <div className="alert alert-danger mt-2">{pickupError}</div>}
        </Modal.Body>
      </Modal>

      {/* Image Modal */}
      {showImageModal && transaction?.item?.images && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={`/api/items/${transaction.item._id}/image/${currentImageIndex}`}
              alt={`${transaction.item.title} - Image ${currentImageIndex + 1}`}
            />
            
            {/* Navigation buttons */}
            {transaction.item.images.length > 1 && (
              <>
                <button
                  className="image-modal-nav image-modal-prev"
                  onClick={prevImage}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  className="image-modal-nav image-modal-next"
                  onClick={nextImage}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}
            
            {/* Close button */}
            <button
              className="image-modal-close"
              onClick={closeImageModal}
              aria-label="Close modal"
            >
              ×
            </button>
            
            {/* Image counter */}
            {transaction.item.images.length > 1 && (
              <div className="image-modal-counter">
                {currentImageIndex + 1} / {transaction.item.images.length}
              </div>
            )}
          </div>
        </div>
      )}

    </Container>
  );
}