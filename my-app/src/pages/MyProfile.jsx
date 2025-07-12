// src/pages/MyProfile.jsx
import React, { useState, useEffect, useContext, useRef } from 'react'         // add useRef
import { Container, Form, Button, Alert, Row, Col, Image, Card } from 'react-bootstrap' // import Row, Col, Image, Card
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom' 
import { AuthContext } from '../context/AuthContext.jsx'
import RatingDisplay from '../components/RatingDisplay'
import PasswordInput from '../components/PasswordInput'

//TODO: Profile pic persistence

export default function MyProfile() {
  const { logout, user } = useContext(AuthContext)
  const navigate = useNavigate()
  const fileInputRef = useRef()                                                 // define ref

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    email: '',
    zipCode: '',
    bio: '',
    avatarUrl: '',
    lenderRating: { average: 0, count: 0 },
    borrowerRating: { average: 0, count: 0 }
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const {
         firstName,
         lastName,
         nickname,
         email,
         zipCode = '',
         bio = '',
         profilePic,
         lenderRating = { average: 0, count: 0 },
         borrowerRating = { average: 0, count: 0 }
       } = res.data
       setFormData({
         firstName,
         lastName,
         nickname,
         email,
         zipCode,
         bio,
         avatarUrl: profilePic
           ? '/api/users/me/avatar'   // stream existing picture
           : '',                      // no pic yet
         lenderRating,
         borrowerRating
       })
      } catch (err) {
        console.error(err)
        setError('Failed to load profile.')
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')                                                          // go home after logout
  }

  const handleChange = e =>
    setFormData(fd => ({ ...fd, [e.target.name]: e.target.value }))

  const handleAvatarClick = () => {
    fileInputRef.current.click()                                               
  }

  const handleAvatarChange = e => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setFormData(fd => ({
        ...fd,
        avatarUrl: URL.createObjectURL(file)
      }))
    }
  }

  const handleProfileSubmit = async e => {
    e.preventDefault()
    setError(''); setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const data = new FormData()                                             
      data.append('nickname', formData.nickname)
      data.append('email',    formData.email)
      data.append('zipCode',  formData.zipCode)
      data.append('bio',      formData.bio)
      if (avatarFile) data.append('avatar', avatarFile)

      await axios.put(
        '/api/users/me',
        data,                                                                   // send FormData not object
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      setSuccess('Profile updated!')
    } catch (err) {
      console.error(err)
      setError('Update failed.')
    }
  }

  const handlePasswordChange = e =>
    setPasswords(pw => ({ ...pw, [e.target.name]: e.target.value }))

  const handlePasswordSubmit = async e => {
    e.preventDefault()
    setPwError(''); setPwSuccess('')

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwError('New passwords do not match.')
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.put(
        '/api/users/me/password',
        {
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setPwSuccess('Password changed!')
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      console.error(err)
      setPwError('Password update failed.')
    }
  }

  return (
    <Container fluid className="px-md-5" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Modern Hero Section */}
      <div className="hero-section bg-light p-4 p-md-5 mb-4">
        <div className="row align-items-center">
          <div className="col">
            <h1 className="display-5 fw-bold mb-3">My Profile</h1>
            <p className="lead text-muted mb-0">
              Manage your account settings and view your community reputation
            </p>
          </div>
          <div className="col-auto">
            <Button 
              variant="danger" 
              size="lg"
              className="rounded-pill px-4"
              onClick={handleLogout}
            >
              🚪 Log Out
            </Button>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert variant="danger" className="rounded-pill mb-4 mx-auto" style={{ maxWidth: '800px' }}>
          <div className="d-flex align-items-center">
            <span className="me-2">⚠️</span>
            {error}
          </div>
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="rounded-pill mb-4 mx-auto" style={{ maxWidth: '800px' }}>
          <div className="d-flex align-items-center">
            <span className="me-2">✅</span>
            {success}
          </div>
        </Alert>
      )}

      {/* Main Content */}
      <Row className="justify-content-center g-4">
        <Col xl={10}>
          <Row className="g-4">
            {/* Profile Information Card */}
            <Col lg={8}>
              <Card className="border-0 shadow-sm modern-card h-100">
                <Card.Body className="p-4 p-md-5">
                  <div className="d-flex align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Profile Information</h4>
                  </div>
                  
                  <Form onSubmit={handleProfileSubmit}>
                    {/* Avatar and Basic Info */}
                    <div className="mb-5">
                      <Row className="align-items-center">
                        <Col xs="auto">
                          <div className="position-relative">
                            <div
                              className="avatar-upload-container"
                              style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                backgroundColor: '#f8f9fa',
                                border: '3px solid #e9ecef',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                position: 'relative'
                              }}
                              onClick={handleAvatarClick}
                              onMouseEnter={(e) => {
                                e.target.style.borderColor = 'var(--brand)';
                                e.target.style.transform = 'scale(1.02)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.borderColor = '#e9ecef';
                                e.target.style.transform = 'scale(1)';
                              }}
                            >
                              {formData.avatarUrl ? (
                                <Image 
                                  src={formData.avatarUrl} 
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover' 
                                  }} 
                                />
                              ) : (
                                <div className="text-center">
                                  <div style={{ fontSize: '2rem', color: '#6c757d' }}>👤</div>
                                  <div style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: '500' }}>
                                    Upload Photo
                                  </div>
                                </div>
                              )}
                              <div 
                                className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '32px', height: '32px', border: '3px solid white' }}
                              >
                                <span style={{ fontSize: '0.75rem', color: 'white' }}>📷</span>
                              </div>
                            </div>
                            <Form.Control
                              type="file"
                              name="avatar" 
                              accept="image/*"
                              ref={fileInputRef}
                              onChange={handleAvatarChange}
                              style={{ display: 'none' }}
                            />
                          </div>
                        </Col>
                        <Col>
                          <Row className="g-3">
                            <Col md={6}>
                              <Form.Group controlId="firstName">
                                <Form.Label className="fw-semibold">First Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="firstName"
                                  value={formData.firstName}
                                  disabled
                                  className="rounded-pill px-4 py-3 bg-light"
                                  style={{ fontSize: '1rem' }}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group controlId="lastName">
                                <Form.Label className="fw-semibold">Last Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="lastName"
                                  value={formData.lastName}
                                  disabled
                                  className="rounded-pill px-4 py-3 bg-light"
                                  style={{ fontSize: '1rem' }}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </div>

                    {/* Editable Fields */}
                    <div className="mb-4">
                      <Row className="g-4">
                        <Col md={6}>
                          <Form.Group controlId="nickname">
                            <Form.Label className="fw-semibold">Nickname *</Form.Label>
                            <Form.Control
                              type="text"
                              name="nickname"
                              value={formData.nickname}
                              onChange={handleChange}
                              required
                              className="rounded-pill px-4 py-3"
                              style={{ fontSize: '1rem' }}
                              placeholder="Your display name"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group controlId="zipCode">
                            <Form.Label className="fw-semibold">Zip Code</Form.Label>
                            <Form.Control
                              type="text"
                              name="zipCode"
                              value={formData.zipCode}
                              onChange={handleChange}
                              className="rounded-pill px-4 py-3"
                              style={{ fontSize: '1rem' }}
                              placeholder="Your area code"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>

                    <Form.Group className="mb-4" controlId="email">
                      <Form.Label className="fw-semibold">Email Address *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="rounded-pill px-4 py-3"
                        style={{ fontSize: '1rem' }}
                        placeholder="your.email@example.com"
                      />
                    </Form.Group>

                    <Form.Group className="mb-5" controlId="bio">
                      <Form.Label className="fw-semibold">Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="rounded-3 px-4 py-3"
                        style={{ fontSize: '1rem', resize: 'none' }}
                        placeholder="Tell the community about yourself, your interests, and what you like to share..."
                      />
                      <Form.Text className="text-muted small">
                        Help others get to know you better
                      </Form.Text>
                    </Form.Group>

                    <div className="d-grid">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        size="lg"
                        className="rounded-pill py-3"
                        style={{ fontSize: '1.1rem', fontWeight: '600' }}
                      >
                        💾 Save Profile Changes
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            {/* Ratings Sidebar */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm modern-card mb-4">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="fw-bold mb-0">Community Ratings</h5>
                    {user && (
                      <Button 
                        as={Link} 
                        to={`/users/${user.id}/reviews`} 
                        variant="outline-primary"
                        size="sm"
                        className="rounded-pill px-3"
                      >
                        📝 Reviews
                      </Button>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <span className="me-2" style={{ fontSize: '1.2rem' }}>🏠</span>
                      <span className="fw-semibold">As Lender</span>
                    </div>
                    <RatingDisplay 
                      rating={formData.lenderRating?.average || 0} 
                      count={formData.lenderRating?.count || 0} 
                      size="lg"
                    />
                    <p className="text-muted small mt-2 mb-0">
                      Based on {formData.lenderRating?.count || 0} review{formData.lenderRating?.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div>
                    <div className="d-flex align-items-center mb-2">
                      <span className="me-2" style={{ fontSize: '1.2rem' }}>🤝</span>
                      <span className="fw-semibold">As Borrower</span>
                    </div>
                    <RatingDisplay 
                      rating={formData.borrowerRating?.average || 0} 
                      count={formData.borrowerRating?.count || 0} 
                      size="lg"
                    />
                    <p className="text-muted small mt-2 mb-0">
                      Based on {formData.borrowerRating?.count || 0} review{formData.borrowerRating?.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Password Change Section */}
          <Card className="border-0 shadow-sm modern-card mt-4">
            <Card.Body className="p-4 p-md-5">
              <div className="d-flex align-items-center mb-4">
                <span className="me-3" style={{ fontSize: '1.5rem' }}>🔒</span>
                <h4 className="fw-bold mb-0">Security Settings</h4>
              </div>

              {pwError && (
                <Alert variant="danger" className="rounded-pill mb-4">
                  <div className="d-flex align-items-center">
                    <span className="me-2">⚠️</span>
                    {pwError}
                  </div>
                </Alert>
              )}
              {pwSuccess && (
                <Alert variant="success" className="rounded-pill mb-4">
                  <div className="d-flex align-items-center">
                    <span className="me-2">✅</span>
                    {pwSuccess}
                  </div>
                </Alert>
              )}

              <Form onSubmit={handlePasswordSubmit}>
                <Row className="g-4">
                  <Col md={4}>
                    <Form.Group controlId="oldPassword">
                      <Form.Label className="fw-semibold">Current Password *</Form.Label>
                      <PasswordInput
                        name="oldPassword"
                        value={passwords.oldPassword}
                        onChange={handlePasswordChange}
                        required
                        className="rounded-pill px-4 py-3"
                        style={{ fontSize: '1rem' }}
                        placeholder="Enter current password"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="newPassword">
                      <Form.Label className="fw-semibold">New Password *</Form.Label>
                      <PasswordInput
                        name="newPassword"
                        value={passwords.newPassword}
                        onChange={handlePasswordChange}
                        required
                        className="rounded-pill px-4 py-3"
                        style={{ fontSize: '1rem' }}
                        placeholder="Enter new password"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="confirmPassword">
                      <Form.Label className="fw-semibold">Confirm Password *</Form.Label>
                      <PasswordInput
                        name="confirmPassword"
                        value={passwords.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        className="rounded-pill px-4 py-3"
                        style={{ fontSize: '1rem' }}
                        placeholder="Confirm new password"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-grid mt-4">
                  <Button 
                    variant="outline-primary" 
                    type="submit" 
                    size="lg"
                    className="rounded-pill py-3"
                    style={{ fontSize: '1.1rem', fontWeight: '600' }}
                  >
                    🔐 Update Password
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}