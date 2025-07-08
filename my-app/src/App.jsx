//  Top Level Layout Component including navigation and routes
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import React, { useContext, useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { BrowserRouter as Router } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import NavDropdown from 'react-bootstrap/NavDropdown';
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
import UserReviews from './pages/UserReview.jsx';
import logo from './assets/logo.png'
import { AuthContext } from './context/AuthContext.jsx' 
import ShowTransaction from './pages/ShowTransaction';

function NotificationBubble({ count }) {
  if (!count || count < 1) return null;
  return (
    <span style={{
      background: 'red',
      color: 'white',
      borderRadius: '50%',
      width: '1.7em',
      height: '1.7em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.9em',
      position: 'absolute',
      top: '-10px',
      right: '-18px', // move further right
      zIndex: 2,
      fontWeight: 'bold',
      boxShadow: '0 0 0 2px #fff7dc'
    }}>
      {count}
    </span>
  );
}

export default function App() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Notification counts
  const [borrowingsCount, setBorrowingsCount] = useState(0);
  const [lendingsCount, setLendingsCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setBorrowingsCount(0);
      setLendingsCount(0);
      return;
    }
    const fetchCounts = async () => {
      const token = localStorage.getItem('token');
      // Fetch all borrowings and lendings
      const [borrowingsRes, lendingsRes] = await Promise.all([
        fetch('/api/transactions/borrowings', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/transactions/lendings', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const borrowings = borrowingsRes.ok ? await borrowingsRes.json() : [];
      const lendings = lendingsRes.ok ? await lendingsRes.json() : [];
      // Define open statuses (customize as needed)
      const openStatuses = ['requested', 'accepted', 'renegotiation_requested', 'borrowed', 'returned'];
      setBorrowingsCount(borrowings.filter(t => openStatuses.includes(t.status)).length);
      setLendingsCount(lendings.filter(t => openStatuses.includes(t.status)).length);
    };
    fetchCounts();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home after logout
  };

  return (
    <>
      <Navbar expand="lg" style={{ backgroundColor: '#fff7dc' }}>
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img
              src={logo}
              alt="Logo"
              height="130"
              className="d-inline-block align-top"
            />
          </Navbar.Brand>
          <Button
            as={Link}
            to="/"
            variant="outline-primary"
            className="ms-2 me-2"
            style={{ borderRadius: '0.375rem', border: '1px solid #0d6efd' }}
          >
            Browse Items
          </Button>
          <Nav className="me-auto">
            <ButtonGroup>
              {user ? (
                <NavDropdown
                  title={
                    <span style={{ position: 'relative', display: 'inline-block', paddingRight: '2.7em' }}>
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
                  as={Button}
                  variant="outline-primary"
                  className="me-2"
                  style={{ borderRadius: '0.375rem', border: '1px solid #0d6efd' }}
                >
                  <NavDropdown.Item as={Link} to="/my-items">
                    My Items
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/my-borrowings" style={{ position: 'relative' }}>
                    My Borrowings
                    <NotificationBubble count={borrowingsCount} />
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/my-lendings" style={{ position: 'relative' }}>
                    My Lendings
                    <NotificationBubble count={lendingsCount} />
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Button
                  as={Link}
                  to="/my-items"
                  variant="outline-primary"
                  className="me-2"
                  style={{ borderRadius: '0.375rem', border: '1px solid #0d6efd', height: '100%' }}
                >
                  My Items
                </Button>
              )}
              <Button
                as={Link}
                to="/add-item"
                variant="outline-primary"
                className="ms-2"
                style={{ borderRadius: '0.375rem', border: '1px solid #0d6efd' }}
              >
                Add Item
              </Button>
            </ButtonGroup>
          </Nav>
          <Nav className="ms-auto">
            <Button
              as={Link}
              to={user ? '/profile' : '/login'}
              variant="dark"
              className="ms-auto me-2"
            >
              {user ? 'My Profile' : 'Log In'}
            </Button>
            {user && (
              <Button
                variant="outline-secondary"
                className="ms-2"
                onClick={handleLogout}
              >
                Logout
              </Button>
            )}
          </Nav>
        </Container>
      </Navbar>
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
        <Route path="/users/:userId/reviews" element={<UserReviews />} />
      </Routes>
    </>
  );
}