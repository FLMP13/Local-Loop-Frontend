//  Top Level Layout Component including navigation and routes
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import React, { useContext, useEffect, useState, createContext } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { BrowserRouter as Router } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Alert from 'react-bootstrap/Alert';
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import CreateProfile from './pages/CreateProfile.jsx'
import MyProfile from './pages/MyProfile.jsx'
import AddItem from './pages/AddItem.jsx'
import ShowItem from './pages/ShowItem.jsx';
import EditItem from './pages/EditItem.jsx';
import MyItems from './pages/MyItems.jsx';
import MyBorrowings from './pages/MyBorrowings.jsx'; 
import MyLendings from './pages/MyLendings.jsx'; 
import Payment from './pages/Payment.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import UserReviews from './pages/UserReview.jsx';
import logo from './assets/logo.png'
import { AuthContext } from './context/AuthContext.jsx' 
import ShowTransaction from './pages/ShowTransaction';
import EditTransaction from './pages/EditTransaction.jsx';
import { Search } from 'react-bootstrap-icons';
import { Prev } from 'react-bootstrap/esm/PageItem.js';
import { 
  getForceNotification, 
  createMessage 
} from './utils/simpleNotifications.js';

export const CounterContext = createContext();
export const NotificationContext = createContext();

function NotificationBubble({ count }) {
  if (!count || count < 1) return null;
  return (
    <span style={{
      background: 'var(--brand)',
      color: 'white',
      borderRadius: '50%',
      width: '1.7em',
      height: '1.7em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75em',
      fontWeight: '600',
      position: 'absolute',
      top: '-10px',
      right: '-12px',
      zIndex: 2,
      border: '2px solid white',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
    }}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function App() {
  const { user, logout } = useContext(AuthContext);
  const [borrowingsCount, setBorrowingsCount] = useState(0);
  const [lendingsCount, setLendingsCount] = useState(0);
  const [hiddenNotifications, setHiddenNotifications] = useState(new Set());
  const [tempNotification, setTempNotification] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Helper function to check if a transaction has active buttons for the user
  const hasActiveButtons = (transaction, user) => {
    if (!user || !transaction) return false;
    
    // Get hidden notifications from localStorage
    const savedHidden = localStorage.getItem('hiddenNotifications');
    const hiddenNotifications = savedHidden ? new Set(JSON.parse(savedHidden)) : new Set();
    
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
    
    // Lender: Inspect and report damage after return
    if (user.id === transaction.lender?._id && transaction.status === 'returned') {
      return true;
    }
    
    // Borrower: New notification available when transaction completed (deposit processed)
    // Only if not hidden
    if (user.id === transaction.borrower?._id && transaction.status === 'completed' && 
        transaction.depositReturned && transaction.depositRefundPercentage !== undefined &&
        !hiddenNotifications.has(transaction._id)) {
      return true;
    }

  
    
    return false;
  };

  // Fetch counters function
  const fetchCounts = async () => {
    if (!user) {
      setBorrowingsCount(0);
      setLendingsCount(0);
      return;
    }
    const token = localStorage.getItem('token');
    const [borrowingsRes, lendingsRes] = await Promise.all([
      fetch('/api/transactions/borrowings', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/transactions/lendings', { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    const borrowings = borrowingsRes.ok ? await borrowingsRes.json() : [];
    const lendings = lendingsRes.ok ? await lendingsRes.json() : [];
    
    // Count transactions with active buttons instead of just open statuses
    setBorrowingsCount(borrowings.filter(t => hasActiveButtons(t, user)).length);
    setLendingsCount(lendings.filter(t => hasActiveButtons(t, user)).length);
  };

  // Check for force notifications when user logs in
  const checkForceActionNotifications = () => {
    if (!user?.email) return;
    
    const notif = getForceNotification(user.email);
    if (notif) {
      const msg = createMessage(notif.type, notif.data);
      setTempNotification({ ...msg, transactionId: notif.id });
      setTimeout(() => setTempNotification(null), 8000);
    }
  };

  // Fetch counters on user change and on every route change
  useEffect(() => {
    fetchCounts();
    // Check for force action notifications when user logs in
    checkForceActionNotifications();
    // eslint-disable-next-line
  }, [user, location.pathname]);

  // Provide fetchCounts to children via context
  return (
    <CounterContext.Provider value={{ fetchCounts }}>
      <>
        <Navbar expand="lg" className="navbar-light bg-white shadow-sm">
          <Container>
            <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
              <img
                src={logo}
                alt="Local Loop"
                style={{ height: '50px' }}
                className="d-inline-block align-top"
              />
            </Navbar.Brand>
            
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Button
                  as={Link}
                  to="/"
                  variant="outline-primary"
                  className="me-3"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Search size={16} />
                  Browse Items
                </Button>
                {user ? (
                  <NavDropdown
                    title={
                      <span style={{ position: 'relative', display: 'inline-block'}}>
                        My Items
                        <span style={{
                          position: 'absolute',
                          top: '-0.3em',
                          right: '-1em',
                          pointerEvents: 'none'
                        }}>
                          <NotificationBubble count={borrowingsCount + lendingsCount} />
                        </span>
                      </span>
                    }
                    id="my-items-dropdown"
                    className="me-3"
                  >
                    <NavDropdown.Item onClick={() => navigate('/my-items')}>
                      My Items
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={() => navigate('/my-borrowings')} style={{ position: 'relative' }}>
                      My Borrowings
                      <NotificationBubble count={borrowingsCount} />
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={() => navigate('/my-lendings')} style={{ position: 'relative' }}>
                      My Lendings
                      <NotificationBubble count={lendingsCount} />
                    </NavDropdown.Item>
                  </NavDropdown>
                ) : (
                  <Button
                    as={Link}
                    to="/my-items"
                    variant="outline-primary"
                    className="me-3"
                    style={{ borderRadius: '8px' }}
                  >
                    My Items
                  </Button>
                )}
                <Button
                  as={Link}
                  to="/add-item"
                  variant="outline-primary"
                  className="me-3"
                  style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Add Item <span aria-hidden="true" style={{ fontSize: '1.2em' }}>+</span>
                </Button>
              </Nav>
              <Nav className="d-flex align-items-center">
                <ButtonGroup>
                  <Button
                    as={Link}
                    to={user ? '/profile' : '/login'}
                    variant="primary"
                    className="me-2"
                    style={{ borderRadius: '8px' }}
                  >
                    {user ? 'My Profile' : 'Log In'}
                  </Button>
                  {user && (
                    <Button
                      variant="outline-secondary"
                      onClick={handleLogout}
                      style={{ borderRadius: '8px' }}
                    >
                      Logout
                    </Button>
                  )}
                </ButtonGroup>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        
        {/* Temporary Force Action Notifications */}
        {tempNotification && (
          <Container className="mt-3">
            <Alert 
              variant={tempNotification.variant}
              dismissible
              onClose={() => setTempNotification(null)}
              className="d-flex align-items-center mb-4"
            >
              <div className="me-3" style={{ fontSize: '1.5rem' }}>
                {tempNotification.variant === 'success' ? '💰' : '�'}
              </div>
              <div className="flex-grow-1">
                <Alert.Heading className="h6 mb-2">{tempNotification.title}</Alert.Heading>
                <div className="small">{tempNotification.text}</div>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  setTempNotification(null);
                  navigate(`/transactions/${tempNotification.transactionId}`);
                }}
                className="ms-3"
              >
                View Transaction
              </Button>
            </Alert>
          </Container>
        )}
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/my-items" element={<MyItems />} />
          <Route path="/my-borrowings" element={<MyBorrowings />} />
          <Route path="/my-lendings" element={<MyLendings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/items/:id" element={<ShowItem />} />
          <Route path="/items/:id/edit" element={<EditItem />} />
          <Route path="/transactions/:id" element={<ShowTransaction />} />
          <Route path="/payment/:id" element={<Payment />} />
          <Route path="/payment-success/:transactionId" element={<PaymentSuccess />} />
          <Route path="/transactions/:id/edit" element={<EditTransaction />} />
          <Route path="/users/:userId/reviews" element={<UserReviews />} />
        </Routes>
      </>
    </CounterContext.Provider>
  );

  function handleLogout() {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/'); // Redirect to home after logout
    }
  }
}