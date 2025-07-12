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
import ReviewModal from '../components/ReviewModal';
import axios from 'axios';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import Modal from 'react-bootstrap/Modal';

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
};

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || 'secondary';
  const label = {
    requested: 'Requested',
    accepted: 'Accepted',
    rejected: 'Rejected',
    renegotiation_requested: 'Renegotiation',
    completed: 'Completed',
  }[status] || status;
  return (
    <Badge bg={color} className="mb-2" style={{ fontSize: '1rem', padding: '0.5em 1em' }}>
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

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!transaction) return <p>Loading…</p>;

  const { item, status, borrower, lender, requestDate } = transaction;

  return (
    <Container className="py-5">
      {showError && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setShowError(false)}
          className="mb-3"
        >
          {error}
        </Alert>
      )}
      <h2 className="mb-4">Transaction Details</h2>
      {user?.id === transaction.borrower?._id && transaction.pickupCode && !transaction.pickupCodeUsed && (
        <Alert variant="info" className="mt-3">
          <strong>PickUp Code:</strong> {transaction.pickupCode}
          <br />
          Give this code to the lender when picking up the item. You can contact the lender via this email:
          {lender?.email && (
            <>
              <br />
              <strong>Lender Email:</strong>{' '}
              <a href={`mailto:${lender.email}`}>{lender.email}</a>
            </>
          )}
        </Alert>
      )}
      {user?.id === transaction.lender?._id && lenderCode && (
        <Alert variant="info" className="mt-3">
          <strong>Return Code:</strong> {lenderCode}
          <br />
          Give this code to the borrower when they return the item.
        </Alert>
      )}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Transaction Info</Card.Title>
          <StatusBadge status={status} />
          <Card.Text>
            Borrower: {borrower?.nickname || borrower?.email}<br />
            Lender: {lender?.nickname || lender?.email || item?.owner?.nickname || item?.owner?.email}<br />
            Requested: {new Date(requestDate).toLocaleString()}
          </Card.Text>

          {/* === ACTION BUTTONS STRIP === */}
          {(() => {
            // Lender: Accept/Decline/Renegotiate if requested
            if (user?.id === transaction.lender?._id && transaction.status === 'requested') {
              return (
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button
                    variant="success"
                    disabled={updating}
                    onClick={() => handleAction('accept')}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="danger"
                    disabled={updating}
                    onClick={() => handleAction('decline')}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="warning"
                    disabled={updating}
                    onClick={() => setShowRenegotiateForm(transaction._id)}
                  >
                    Renegotiate
                  </Button>
                  {showRenegotiateForm === transaction._id && (
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
                      <DayPicker
                        mode="range"
                        selected={renegotiateRange}
                        onSelect={setRenegotiateRange}
                      />
                      <input type="text" name="message" placeholder="Message" className="form-control my-2" />
                      <button type="submit" className="btn btn-warning">Send Proposal</button>
                    </form>
                  )}
                </div>
              );
            }
            // Borrower: Accept/Decline if renegotiation_requested
            if (user?.id === transaction.borrower?._id && transaction.status === 'renegotiation_requested') {
              return (
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button
                    variant="success"
                    disabled={updating}
                    onClick={() => handleAcceptRenegotiation(transaction._id)}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="danger"
                    disabled={updating}
                    onClick={() => handleDeclineRenegotiation(transaction._id)}
                  >
                    Decline
                  </Button>
                </div>
              );
            }
            // Borrower: Edit/Delete for requested or renegotiation_requested
            if (
              user?.id === transaction.borrower?._id &&
              ['requested', 'renegotiation_requested'].includes(transaction.status)
            ) {
              return (
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button variant="secondary" onClick={() => navigate(`/transactions/${transaction._id}/edit`)}>Edit</Button>
                  <Button variant="danger" onClick={handleDeleteClick}>Delete</Button>
                </div>
              );
            }
            // Borrower: Pay button for accepted
            if (
              user?.id === transaction.borrower?._id &&
              transaction.status === 'accepted'
            ) {
              return (
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/payment/${transaction._id}`)}
                  >
                    Pay
                  </Button>
                </div>
              );
            }
            // Lender: Enter pickup code after payment
            if (
              user?.id === transaction.lender?._id &&
              transaction.status === 'paid'
            ) {
              return (
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button
                    variant="success"
                    onClick={() => setShowPickupModal(true)}
                    disabled={updating}
                  >
                    Enter Code after the Item was picked up
                  </Button>
                </div>
              );
            }
            // Lender: Generate/View Return Code and Force Return if borrowed
            if (
              user?.id === transaction.lender?._id &&
              transaction.status === 'borrowed'
            ) {
              return (
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button
                    variant="info"
                    onClick={handleGetReturnCode}
                    disabled={updating}
                  >
                    Generate Code
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleForceComplete}
                    disabled={updating}
                  >
                    Force Return
                  </Button>
                </div>
              );
            }
            // Borrower: Enter the code after returning the item
            if (
              user?.id === transaction.borrower?._id &&
              transaction.status === 'borrowed'
            ) {
              return (
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button
                    variant="success"
                    onClick={() => setShowReturnModal(true)}
                    disabled={updating}
                  >
                    Enter the Code after returning the Item
                  </Button>
                </div>
              );
            }
            // Borrower: Force Pick Up if paid
            if (
              user?.id === transaction.borrower?._id &&
              transaction.status === 'paid'
            ) {
              return (
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button
                    variant="danger"
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
                  >
                    Force Pick Up
                  </Button>
                </div>
              );
            }
            return null;
          })()}

          {/* Add Review Button */}
          {canReview.canReview && (
            <div className="d-flex justify-content-end mt-3">
              <Button
                variant="primary"
                onClick={() => setShowReviewModal(true)}
              >
                Leave Review
              </Button>
            </div>
          )}

          {/* Show requested and renegotiation time frames side by side */}
          {(transaction.requestedFrom && transaction.requestedTo) && (
            <Row className="mb-3">
              <Col md={6}>
                <strong>Requested Time Frame:</strong>
                <DayPicker
                  mode="range"
                  selected={{
                    from: new Date(transaction.requestedFrom),
                    to: new Date(transaction.requestedTo)
                  }}
                  disabled={() => true}
                  showOutsideDays
                />
              </Col>
              {transaction.status === 'renegotiation_requested' &&
                transaction.renegotiation?.from && transaction.renegotiation?.to && (
                  <Col md={6}>
                    <strong>Renegotiation Proposal:</strong>
                    <DayPicker
                      mode="range"
                      selected={{
                        from: new Date(transaction.renegotiation.from),
                        to: new Date(transaction.renegotiation.to)
                      }}
                      disabled={() => true}
                      showOutsideDays
                    />
                    <div>
                      <strong>Message:</strong> {transaction.renegotiation.message}
                    </div>
                  </Col>
              )}
            </Row>
          )}

          {/* Rejection message section */}
          {transaction.status === 'rejected' && (
            <div>
              <p>Request denied{transaction.lenderMessage && `: ${transaction.lenderMessage}`}</p>
            </div>
          )}
        </Card.Body>
      </Card>
      {item && (
        <Card>
          <Card.Body>
            <Card.Title>{item.title}</Card.Title>
            <Card.Text>
              <strong>Description:</strong> {item.description}<br />
              <strong>Price:</strong> ${item.price}<br />
              <strong>Category:</strong> {item.category}<br />
              <strong>Owner:</strong>{' '}
              {item.owner?._id ? (
                <Link to={`/users/${item.owner._id}/reviews`}>
                  {item.owner.nickname || item.owner.email}
                </Link>
              ) : (
                item.owner?.nickname || item.owner?.email
              )}
              <br />
              <strong>Zip Code:</strong> {item.owner?.zipCode}<br />
            </Card.Text>
            <Row>
              {item.images?.map((_, idx) => (
                <Col key={idx} md={4}>
                  <Card.Img
                    variant="top"
                    src={`/api/items/${item._id}/image/${idx}`}
                    alt={`Item image ${idx + 1}`}
                  />
                </Col>
              ))}
            </Row>
            <Button
              className="mt-3"
              variant="primary"
              onClick={() => navigate(`/items/${item._id}`)}
            >
              View Item
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* View Reviews Buttons */}
      {user && transaction && (
        <div className="d-flex justify-content-end mt-3">
          {user.id === transaction.lender?._id && transaction.borrower?._id && (
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2"
              onClick={() => navigate(`/users/${transaction.borrower._id}/reviews?tab=borrower`)}
            >
              View Borrower Reviews
            </Button>
          )}
          {user.id === transaction.borrower?._id && transaction.lender?._id && (
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2"
              onClick={() => navigate(`/users/${transaction.lender._id}/reviews?tab=lender`)}
            >
              View Lender Reviews
            </Button>
          )}
        </div>
      )}

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

      <Button
        className="mt-3"
        variant="secondary"
        onClick={() => navigate(-1)}
      >
        ← Back
      </Button>
    </Container>
  );
}