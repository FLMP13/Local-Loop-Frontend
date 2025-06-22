//  Top Level Layout Component including navigation and routes
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import React, { useContext } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Home from './pages/Home.jsx'
import Test from './pages/Test.jsx'
import Login from './pages/Login.jsx'
import CreateProfile from './pages/CreateProfile.jsx'
import MyProfile from './pages/MyProfile.jsx'
import logo from './assets/logo.png'
import { AuthContext } from './context/AuthContext.jsx' 


export default function App() {
  const { user } = useContext(AuthContext)   

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
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/test">Test</Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            <Button
              as={Link}
              to={user ? '/profile' : '/login'}                             // conditional redirect
              variant="dark"
              className="ms-auto"
            >
              {user ? 'My Profile' : 'Log In'}     
            </Button>
          </Nav>
        </Container>
      </Navbar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-profile" element={<CreateProfile />} />
        <Route path="/profile" element={<MyProfile />} />
      </Routes>
    </>
  )
}

