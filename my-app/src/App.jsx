//  Top Level Layout Component including navigation and routes
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import React, { useContext } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { BrowserRouter as Router } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
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
import logo from './assets/logo.png'
import { AuthContext } from './context/AuthContext.jsx' 


export default function App() {
  const { user, logout } = useContext(AuthContext); // <-- get logout from context
  const navigate = useNavigate();

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
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/my-items">My Items</Nav.Link>
            <Nav.Link as={Link} to="/add-item">Add Item</Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            <Button
              as={Link}
              to={user ? '/profile' : '/login'}                             // conditional redirect
              variant="dark"
              className="ms-auto me-2"
            >
              {user ? 'My Profile' : 'Log In'}
            </Button>
            {user && (
              <Button
                variant="outline-secondary"
                className="ms-2"
                onClick={handleLogout} // <-- call logout directly
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
      </Routes>
    </>
  );
}

