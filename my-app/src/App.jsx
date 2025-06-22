//  Top Level Layout Component including navigation and routes
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { BrowserRouter as Router } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import AddItem from './pages/AddItem.jsx'
import ListItem from './pages/ListItem.jsx';
import ShowItem from './pages/ShowItem.jsx';
import EditItem from './pages/EditItem.jsx';
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
            <Nav.Link as={Link} to="/add-item">Add Item</Nav.Link>
            <Nav.Link as={Link} to="/list-item">List Items</Nav.Link>
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
        <Route path="/add-item" element={<AddItem />} />
        <Route path="/list-item" element={<ListItem />} />
        <Route path="/login" element={<Login />} />
        <Route path="/items/:id" element={<ShowItem />} />
        <Route path="/items/:id/edit" element={<EditItem />} />
        {/* Add more routes as needed */}
      </Routes>
    </>
  )
}

