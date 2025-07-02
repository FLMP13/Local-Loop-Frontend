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
import logo from './assets/logo.png'
import { AuthContext } from './context/AuthContext.jsx' 
import ShowTransaction from './pages/ShowTransaction';


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
            <ButtonGroup>
              <NavDropdown
                title="My Items"
                id="my-items-dropdown"
                as={Button}
                variant="outline-primary"
                className="me-2"
                style={{ borderRadius: '0.375rem', border: '1px solid #0d6efd' }}
              >
                <NavDropdown.Item as={Link} to="/my-items">
                  All My Items
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-borrowings">
                  My Borrowings
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-lendings">
                  My Lendings
                </NavDropdown.Item>
              </NavDropdown>
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
        <Route path="/transactions/:id" element={<ShowTransaction />} />
      </Routes>
    </>
  );
}

