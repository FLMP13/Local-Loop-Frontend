// src/pages/Login.jsx
import React, { useState } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const navigate = useNavigate()

  const handleChange = e =>
    setCredentials(c => ({ ...c, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    // TODO: call login API, e.g. POST /api/auth/login
    // if success: navigate('/')
    // if failure: show error (e.g. toast or form error)
    console.log('Logging in with', credentials)
    // example:
    // const ok = await login(credentials)
    // if(ok) navigate('/')
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
