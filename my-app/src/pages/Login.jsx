// src/pages/Login.jsx
import React, { useState } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios' 

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState('') 
  const navigate = useNavigate()

  const handleChange = e =>
    setCredentials(c => ({ ...c, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')                                           // clear previous

    try {
      // call login API
      const res = await axios.post('/api/auth/login', credentials)
      console.log(res.data)

      // store token (e.g. localStorage)
      localStorage.setItem('token', res.data.token)
      // optionally store user info
      localStorage.setItem('user', JSON.stringify(res.data.user))

      // navigate to home (or dashboard)
      navigate('/')
    } catch (err) {
      console.error(err)
      setError(
        err.response?.data?.error ||
        'Login failed. Please check your credentials.'
      )
    }
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <h1 className="mb-4 text-center">Log In</h1>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                required
                placeholder="you@domain.com"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </Form.Group>

            <div className="d-grid mb-2">
              <Button variant="dark" type="submit">
                Log In
              </Button>
            </div>

            <div className="text-center">
              <Link to="/create-profile">Create Profile</Link>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}
