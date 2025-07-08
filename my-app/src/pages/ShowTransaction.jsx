import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  rejected: 'danger',
  borrowed: 'info',
  returned: 'primary',
  completed: 'dark',
  renegotiation_requested: 'warning',
  retracted: 'secondary'
}; // should match the colors in TransactionList.jsx

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
  const navigate = useNavigate();

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

  const handleReviewSubmitted = () => {
    setCanReview({ canReview: false, role: null });
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
      fetchCounts(); // <-- update counters after retract
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
        // Redirect to the other user's review page
        const otherUserId = user.id === transaction.lender._id
          ? transaction.borrower._id
          : transaction.lender._id;
        navigate(`/users/${otherUserId}/reviews`);
      } else {
        setReturnError(data.error || 'Incorrect code');
      }
    } catch (err) {
      setReturnError('Failed to submit code');
    }
  };

  const handleForceComplete = async () => {
    setReturnError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/transactions/${transaction._id}/return-complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        // Redirect to the other user's review page
        const otherUserId = user.id === transaction.lender._id
          ? transaction.borrower._id
          : transaction.lender._id;
        navigate(`/users/${otherUserId}/reviews`);
      } else {
        setReturnError('Failed to complete return');
      }
    } catch (err) {
      setReturnError('Failed to complete return');
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
                    onClick={() => alert('Payment coming soon!')}
                  >
                    Pay
                  </Button>
                </div>
              );
            }
            // Lender: Mark as Returned if borrowed
            if (
              (user?.id === transaction.lender?._id || user?.id === transaction.borrower?._id) &&
              transaction.status === 'borrowed'
            ) {
              return (
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button
                    variant="success"
                    onClick={() => setShowReturnModal(true)}
                    disabled={updating}
                  >
                    Mark as Returned
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
            <Button as={Link} to={`/items/${item._id}`} className="mt-3" variant="primary">
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
              as={Link}
              to={`/users/${transaction.borrower._id}/reviews`}
              variant="outline-primary"
              size="sm"
              className="me-2"
            >
              View Borrower Reviews
            </Button>
          )}
          {user.id === transaction.borrower?._id && transaction.lender?._id && (
            <Button
              as={Link}
              to={`/users/${transaction.lender._id}/reviews`}
              variant="outline-primary"
              size="sm"
              className="me-2"
            >
              View Lender Reviews
            </Button>
          )}
        </div>
      )}

      <ReviewModal
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        transaction={transaction}
        userRole={canReview.role}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Return Code Modal */}
      <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Mark as Returned</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {user?.id === transaction.lender?._id && (
            <>
              <p>Give this code to the borrower:</p>
              <Button onClick={handleGetReturnCode} variant="info" className="mb-2">Generate/View Code</Button>
              {lenderCode && <div className="alert alert-success">Return Code: <strong>{lenderCode}</strong></div>}
              <Button onClick={handleForceComplete} variant="danger" className="mt-2">Accept Return Without Code</Button>
            </>
          )}
          {user?.id === transaction.borrower?._id && (
            <>
              <p>Enter the code you received from the lender:</p>
              <input
                type="text"
                value={returnCode}
                onChange={e => setReturnCode(e.target.value)}
                className="form-control mb-2"
              />
              <Button onClick={handleSubmitReturnCode} variant="success">Submit Code</Button>
            </>
          )}
          {returnError && <div className="alert alert-danger mt-2">{returnError}</div>}
        </Modal.Body>
      </Modal>
    </Container>
  );
}