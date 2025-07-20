// src/pages/CreateProfile.jsx
import React, { useState, useRef, useContext } from 'react'
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner
} from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios'   
import PasswordInput from '../components/PasswordInput'

// CreateProfile Component
export default function CreateProfile() {
  const { login } = useContext(AuthContext)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    email: '',
    password: '',
    zipCode: '',
    bio: '',
    profilePic: null
  })
  const [error, setError] = useState('')  
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef()
  const navigate = useNavigate()   

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'profilePic') {
      setForm(f => ({ ...f, profilePic: files[0] }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')                                             // clear previous error
    setIsLoading(true)

    // Client-side password validation
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      setIsLoading(false)
      return
    }

    const hasUpperCase = /[A-Z]/.test(form.password)
    const hasLowerCase = /[a-z]/.test(form.password)
    const hasNumbers = /\d/.test(form.password)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number.')
      setIsLoading(false)
      return
    }

    // build FormData including file
    const data = new FormData()
    data.append('firstName', form.firstName)
    data.append('lastName',  form.lastName)
    data.append('nickname',  form.nickname || form.firstName) // Use firstName as fallback for nickname
    data.append('email',     form.email)
    data.append('password',  form.password)
    data.append('zipCode',   form.zipCode)
    data.append('bio',       form.bio)
    if (form.profilePic) {
      data.append('profilePic', form.profilePic)
    }

    try {
      console.log('Submitting form data:', form)
      console.log('FormData entries:')
      for (let [key, value] of data.entries()) {
        console.log(key, value)
      }
      
      // POST to signup endpoint
      const res = await axios.post(
        '/api/auth/signup',
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      console.log('Signup response:', res.data)
      
      // If signup returns token and user data, automatically log in the user
      if (res.data.token && res.data.user) {
        console.log('Auto-logging in user:', res.data.user)
        login({
          token: res.data.token,
          user: res.data.user
        })
        console.log('Navigating to home page...')
        // Navigate to home page after successful signup and login
        navigate('/')
      } else {
        console.log('No token/user in response, redirecting to login')
        // If no token returned, navigate to login page
        navigate('/login')
      }
    } catch (err) {
      console.error('Signup error:', err)
      console.error('Error response:', err.response?.data)
      // show error message
      setError(
        err.response?.data?.error ||
        'Failed to create profile. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Inline styles for the circle uploader
  const circleContainerStyle = {
    width: 100,
    height: 100,
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    margin: '0 auto 1rem'
  }
  const circleImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
  const placeholderStyle = {
    width: '50%',
    height: '50%',
    borderRadius: '50%',
    background: '#ccc'
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <h1 className="mb-4 text-center">Create Profile</h1>
          
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>

            {/* Profile Picture Circle */}
            <div
              style={circleContainerStyle}
              onClick={() => fileInputRef.current.click()}
            >
              {form.profilePic
                ? <img
                    src={URL.createObjectURL(form.profilePic)}
                    alt="Profile Preview"
                    style={circleImageStyle}
                  />
                : <div style={placeholderStyle} />
              }
            </div>
            {/* Hidden file input */}
            <Form.Control
              type="file"
              name="profilePic"
              accept="image/*"
              onChange={handleChange}
              ref={fileInputRef}
              hidden
            />

            {/* Text fields */}
            <Form.Group className="mb-3">
              <Form.Label>First name *</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last name *</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nickname</Form.Label>
              <Form.Control
                type="text"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                placeholder="Nickname (optional)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@domain.com"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password *</Form.Label>
              <PasswordInput
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                minLength={6}
                required
              />
              <Form.Text className="text-muted small">
                Must be at least 6 characters with uppercase, lowercase, and number
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>ZIP Code *</Form.Label>
              <Form.Control
                type="text"
                name="zipCode"
                value={form.zipCode}
                onChange={handleChange}
                placeholder="ZIP Code"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell us a little about yourself"
              />
            </Form.Group>

            <div className="d-grid">
              <Button 
                variant="dark" 
                size="lg" 
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? '#ffc107' : undefined,
                  borderColor: isLoading ? '#ffc107' : undefined
                }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm text-white me-2" role="status"></span>
                    Creating Profile...
                  </>
                ) : (
                  'Create Profile'
                )}
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}
