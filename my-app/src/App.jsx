//  Top Level Layout Component including navigation and routes
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Home from './pages/Home.jsx'
import Test from './pages/Test.jsx'
import Login from './pages/Login.jsx'
import logo from './assets/logo.png'

export default function App() {
  return (
    <>
      <Navbar expand="lg" style={{ backgroundColor: '#FFF7D1' }}>
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
            <Button variant="outline-dark" as={Link} to="/login">
              Log In
            </Button>
          </Nav>
        </Container>
      </Navbar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  )
}

