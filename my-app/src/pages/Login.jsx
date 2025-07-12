// src/pages/Login.jsx
import React, { useState, useContext } from 'react'
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios' 
import { AuthContext } from '../context/AuthContext.jsx'
import PasswordInput from '../components/PasswordInput'

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState('') 
  const navigate = useNavigate()
  const { login } = useContext(AuthContext) 

  const handleChange = e =>
    setCredentials(c => ({ ...c, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')                                           // clear previous

    try {
      // call login API
      const res = await axios.post('/api/auth/login', credentials)
      console.log(res.data)
      // store token and user in context
      login({
        token: res.data.token,
        user: {
          id:         res.data.user.id,
          firstName:  res.data.user.firstName,
          lastName:   res.data.user.lastName,
          nickname:   res.data.user.nickname,
          email:      res.data.user.email,
          profilePic: res.data.user.profilePic
        }
      })
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

          {/* UPDATE: render error alert if present */}
          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}
          
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
              <PasswordInput
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
