// src/import PremiumUpgradeModal from '../components/PremiumUpgradeModal';es/MyProfile.jsx
import React, { useState, useEffect, useContext, useRef } from 'react'         // add useRef
import { Container, Form, Button, Alert, Row, Col, Image, Card, Badge, Modal, Toast, ToastContainer } from 'react-bootstrap' // import Row, Col, Image, Card, Toast
import axios from 'axios'
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom' 
import { AuthContext } from '../context/AuthContext.jsx'
import RatingDisplay from '../components/RatingDisplay'
import PasswordInput from '../components/PasswordInput'
import { usePremium } from '../hooks/usePremium'
import PremiumUpgradeModal from '../components/PremiumUpgradeModal'
import { 
  ExclamationTriangle, 
  CheckSquare, 
  ChatLeftText, 
  ShieldLock,
  CheckCircle,
  House,
  Award,
  Rocket
} from 'react-bootstrap-icons';

// Main profile page component
export default function MyProfile() {
  const { logout, user } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const fileInputRef = useRef()                                                 // define ref
  
  // Check for upgrade success
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [upgradeDetails, setUpgradeDetails] = useState(null);
  
  // Check URL parameters for upgrade success
  useEffect(() => {
    const upgraded = searchParams.get('upgraded');
    const plan = searchParams.get('plan');
    const price = searchParams.get('price');
    
    if (upgraded === 'true') {
      setUpgradeDetails({
        plan: plan || 'Premium',
        price: price || '3.99'
      });
      setShowSuccessToast(true);
      
      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState(null, '', newUrl);
      
      // Auto-hide after 8 seconds
      setTimeout(() => setShowSuccessToast(false), 8000);
    }
  }, [searchParams]);
  
  // Premium status hook
  const { 
    premiumStatus, 
    subscription,
    isPremium, 
    maxListings, 
    discountRate, 
    upgradeToPremium, 
    cancelPremium,
    loading: premiumLoading 
  } = usePremium();
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

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
  const [avatarBlobUrl, setAvatarBlobUrl] = useState(null)
  const [deleteAvatar, setDeleteAvatar] = useState(false)
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
         avatarUrl: profilePic ? '/api/users/me/avatar' : '',
         lenderRating,
         borrowerRating
       })

       // Fetch avatar with authentication if it exists
       if (profilePic) {
         await fetchAvatarBlob()
       }
      } catch (err) {
        console.error(err)
        setError('Failed to load profile.')
      }
    }
    fetchProfile()
  }, [])

  // Cleanup effect to revoke object URLs
  useEffect(() => {
    return () => {
      if (avatarBlobUrl) {
        URL.revokeObjectURL(avatarBlobUrl)
      }
      if (formData.avatarUrl && formData.avatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.avatarUrl)
      }
    }
  }, [avatarBlobUrl, formData.avatarUrl])

  // Fetch avatar blob URL to display profile picture
  const fetchAvatarBlob = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/users/me/avatar', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })
      const blobUrl = URL.createObjectURL(response.data)
      setAvatarBlobUrl(blobUrl)
    } catch (err) {
      console.error('Failed to fetch avatar:', err)
    }
  }

  // Handle logout
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
      setDeleteAvatar(false) // Reset delete flag when new file is selected
      // Clear the existing blob URL since we have a new file
      if (avatarBlobUrl) {
        URL.revokeObjectURL(avatarBlobUrl)
        setAvatarBlobUrl(null)
      }
      setFormData(fd => ({
        ...fd,
        avatarUrl: URL.createObjectURL(file)
      }))
    }
  }

  // Handle avatar deletion
  const handleDeleteAvatar = () => {
    setDeleteAvatar(true)
    setAvatarFile(null)
    
    // Clear existing URLs
    if (avatarBlobUrl) {
      URL.revokeObjectURL(avatarBlobUrl)
      setAvatarBlobUrl(null)
    }
    if (formData.avatarUrl && formData.avatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(formData.avatarUrl)
    }
    
    setFormData(fd => ({
      ...fd,
      avatarUrl: ''
    }))
  }

  // Handle profile submission when user updates their profile
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
      
      if (deleteAvatar) {
        data.append('deleteAvatar', 'true')
      } else if (avatarFile) {
        data.append('avatar', avatarFile)
      }

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
      setAvatarFile(null) // Clear the file after successful upload
      setDeleteAvatar(false) // Reset delete flag
      
      // If we uploaded a new avatar, refresh the blob URL
      if (avatarFile) {
        // Clear the old blob URL first
        if (avatarBlobUrl) {
          URL.revokeObjectURL(avatarBlobUrl)
        }
        // Fetch the new avatar blob
        await fetchAvatarBlob()
      } else if (deleteAvatar) {
        // Avatar was deleted, clear everything
        if (avatarBlobUrl) {
          URL.revokeObjectURL(avatarBlobUrl)
          setAvatarBlobUrl(null)
        }
      }
    } catch (err) {
      console.error(err)
      setError('Update failed.')
    }
  }

  // Handle password change
  const handlePasswordChange = e =>
    setPasswords(pw => ({ ...pw, [e.target.name]: e.target.value }))

  const handlePasswordSubmit = async e => {
    e.preventDefault()
    setPwError(''); setPwSuccess('')

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwError('New passwords do not match.')
      return
    }

    // Check password strength
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

  //  Handle premium upgrade
  const handlePremiumUpgrade = async (plan) => {
    try {
      await upgradeToPremium(plan);
      setSuccess('Successfully upgraded to premium!');
      setShowUpgradeModal(false);
    } catch (err) {
      setError('Failed to upgrade to premium. Please try again.');
    }
  };

  // Handle premium cancellation
  const handlePremiumCancel = async () => {
    try {
      await cancelPremium();
      setSuccess('Subscription cancelled successfully. Your premium benefits will continue until your current period ends.');
      setShowCancelModal(false);
    } catch (err) {
      setError('Failed to cancel subscription. Please try again.');
    }
  };

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
              Log Out
            </Button>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert variant="danger" className="rounded-pill mb-4 mx-auto" style={{ maxWidth: '800px' }}>
          <div className="d-flex align-items-center">
            <ExclamationTriangle className="me-2" />
            {error}
          </div>
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="rounded-pill mb-4 mx-auto" style={{ maxWidth: '800px' }}>
          <div className="d-flex align-items-center">
            <CheckSquare className="me-2" />
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
                          <div className="d-flex flex-column align-items-center">
                            <div className="position-relative mb-3">
                              <div
                                className="avatar-upload-container"
                                onClick={handleAvatarClick}
                              >
                                {((avatarBlobUrl || formData.avatarUrl) && !deleteAvatar) ? (
                                  <>
                                    <Image 
                                      src={avatarFile ? formData.avatarUrl : avatarBlobUrl} 
                                      className="avatar-image"
                                    />
                                    {/* Overlay for hover effect */}
                                    <div className="avatar-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                        <path d="M12 15.5c1.38 0 2.5-1.12 2.5-2.5S13.38 10.5 12 10.5 9.5 11.62 9.5 13s1.12 2.5 2.5 2.5zm0-1c-.83 0-1.5-.67-1.5-1.5S11.17 11.5 12 11.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                                        <path d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 14H4V7h16v12z"/>
                                      </svg>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center">
                                    <div className="avatar-placeholder-icon mb-2">
                                      <svg width="64" height="64" viewBox="0 0 24 24" fill="#6c757d">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                      </svg>
                                    </div>
                                    <div className="avatar-placeholder-text">
                                      Click to upload<br />
                                      <span className="avatar-placeholder-subtext">your photo</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Form.Control
                                type="file"
                                name="avatar" 
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                className="avatar-file-input"
                              />
                            </div>
                            
                            {/* Modern Action Buttons */}
                            <div className="avatar-action-buttons d-flex gap-2 flex-wrap justify-content-center">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="avatar-action-button d-flex align-items-center gap-1 rounded-pill px-3 py-2"
                                onClick={handleAvatarClick}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                                </svg>
                                {(avatarBlobUrl || formData.avatarUrl) && !deleteAvatar ? 'Change' : 'Upload'}
                              </Button>

                              {((avatarBlobUrl || formData.avatarUrl) && !deleteAvatar) && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="avatar-action-button d-flex align-items-center gap-1 rounded-pill px-3 py-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteAvatar()
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                  </svg>
                                  Remove
                                </Button>
                              )}
                            </div>
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
                        Save Profile Changes
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
                        <ChatLeftText className="me-1" />
                        Reviews
                      </Button>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <House className="me-2" style={{ fontSize: '1.2rem' }} />
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

          {/* Premium Status Section */}
          <Card className="border-0 shadow-sm modern-card mt-4">
            <Card.Body className="p-4 p-md-5">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                  <Award className="me-3" style={{ fontSize: '1.5rem', color: '#ffc107' }} />
                  <h4 className="fw-bold mb-0">Premium Status</h4>
                </div>
                {isPremium && (
                  <Badge bg="success" className="rounded-pill px-3 py-2">
                    <i className="bi bi-check-circle me-1"></i>
                    Premium Active
                  </Badge>
                )}
              </div>

              {!premiumLoading && (
                <Row className="g-4">
                  <Col md={6}>
                    <div className="bg-light rounded-3 p-4">
                      <h6 className="fw-bold mb-3">Current Plan</h6>
                      <div className="mb-2">
                        <span className="text-muted">Status: </span>
                        <span className={`fw-semibold ${isPremium ? 'text-success' : 'text-muted'}`}>
                          {isPremium ? 'Premium' : 'Free'}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Item Listings: </span>
                        <span className="fw-semibold">
                          {isPremium ? 'Unlimited' : `${maxListings} maximum`}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Rental Discount: </span>
                        <span className="fw-semibold">
                          {discountRate > 0 ? `${discountRate}%` : 'None'}
                        </span>
                      </div>
                      {subscription && (
                        <>
                          <div className="mb-2">
                            <span className="text-muted">Plan: </span>
                            <span className="fw-semibold text-capitalize">
                              {subscription.plan}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Expires: </span>
                            <span className="fw-semibold">
                              {new Date(subscription.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Auto-renewal: </span>
                            <span className={`fw-semibold ${subscription.autoRenew ? 'text-success' : 'text-warning'}`}>
                              {subscription.status === 'cancelled' ? 'Cancelled' : subscription.autoRenew ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                          {subscription.status === 'cancelled' && (
                            <div className="mb-2">
                              <span className="text-muted">Cancelled: </span>
                              <span className="fw-semibold text-warning">
                                {new Date(subscription.cancelledAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </Col>
                  
                  <Col md={6}>
                    <div className="bg-light rounded-3 p-4">
                      <h6 className="fw-bold mb-3">Premium Benefits</h6>
                      <ul className="list-unstyled mb-0">
                        <li className="mb-2">
                          <i className={`bi bi-check-circle${isPremium ? '-fill text-success' : ' text-muted'} me-2`}></i>
                          Unlimited item listings
                        </li>
                        <li className="mb-2">
                          <i className={`bi bi-check-circle${isPremium ? '-fill text-success' : ' text-muted'} me-2`}></i>
                          10% discount on all rentals
                        </li>
                        <li className="mb-2">
                          <i className={`bi bi-check-circle${isPremium ? '-fill text-success' : ' text-muted'} me-2`}></i>
                          Priority listing visibility
                        </li>
                        <li className="mb-2">
                          <i className={`bi bi-check-circle${isPremium ? '-fill text-success' : ' text-muted'} me-2`}></i>
                          Priority in rental requests
                        </li>
                        <li>
                          <i className={`bi bi-check-circle${isPremium ? '-fill text-success' : ' text-muted'} me-2`}></i>
                          Item view analytics & statistics
                        </li>
                      </ul>
                    </div>
                  </Col>
                </Row>
              )}

              <div className="d-flex gap-3 mt-4">
                {!isPremium ? (
                  <Button 
                    variant="primary" 
                    size="lg"
                    className="rounded-pill px-4"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    <Award className="me-2" style={{ color: '#ffc107' }} />
                    Upgrade to Premium
                  </Button>
                ) : subscription?.status === 'cancelled' ? (
                  <div className="d-flex flex-column gap-2">
                    <Button 
                      variant="primary" 
                      size="lg"
                      className="rounded-pill px-4"
                      onClick={() => setShowUpgradeModal(true)}
                    >
                      Renew Premium
                    </Button>
                    <small className="text-muted">
                      Your current premium benefits will continue until {subscription && new Date(subscription.endDate).toLocaleDateString()}
                    </small>
                  </div>
                ) : (
                  <Button 
                    variant="outline-danger" 
                    size="lg"
                    className="rounded-pill px-4"
                    onClick={() => setShowCancelModal(true)}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Password Change Section */}
          <Card className="border-0 shadow-sm modern-card mt-4">
            <Card.Body className="p-4 p-md-5">
              <div className="d-flex align-items-center mb-4">
                <ShieldLock className="me-3" style={{ fontSize: '1.5rem' }} />
                <h4 className="fw-bold mb-0">Security Settings</h4>
              </div>

              {pwError && (
                <Alert variant="danger" className="rounded-pill mb-4">
                  <div className="d-flex align-items-center">
                    <ExclamationTriangle className="me-2" />
                    {pwError}
                  </div>
                </Alert>
              )}
              {pwSuccess && (
                <Alert variant="success" className="rounded-pill mb-4">
                  <div className="d-flex align-items-center">
                    <CheckSquare className="me-2" />
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
                    <ShieldLock className="me-2" />
                    Update Password
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        show={showUpgradeModal}
        onHide={() => setShowUpgradeModal(false)}
        currentListings={0} // Not used in profile context
        maxListings={maxListings}
        context="profile"
      />
      
      {/* Cancel Premium Confirmation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Subscription</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <strong>Are you sure you want to cancel subscription?</strong>
            <br /><br />
            Your premium benefits will continue until {subscription?.endDate && new Date(subscription.endDate).toLocaleDateString()}.
            After that, your subscription will not automatically renew and you'll return to the free plan.
            You can always upgrade again later.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Keep Subscription
          </Button>
          <Button variant="danger" onClick={handlePremiumCancel}>
            Cancel Subscription
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Premium Upgrade Success Toast */}
      <ToastContainer 
        position="top-end" 
        className="p-3" 
        style={{ zIndex: 9999 }}
      >
        <Toast 
          show={showSuccessToast} 
          onClose={() => setShowSuccessToast(false)}
          className="border-0 shadow-lg"
          style={{ 
            minWidth: '400px',
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: 'white'
          }}
        >
          <Toast.Header 
            className="border-0 text-white"
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="me-2" style={{ fontSize: '1.5em' }}>
              <CheckCircle className="me-1" />
              <Award style={{ color: '#ffc107' }} />
            </div>
            <strong className="me-auto">Premium Upgrade Successful!</strong>
          </Toast.Header>
          <Toast.Body className="text-white p-3">
            <div className="text-center mb-3">
              <div style={{ fontSize: '2.5em', marginBottom: '8px' }}>
                <Rocket />
              </div>
              <h5 className="mb-1">Welcome to Premium!</h5>
              <div className="mb-2">
                <strong>{upgradeDetails?.plan?.charAt(0).toUpperCase() + upgradeDetails?.plan?.slice(1)} Plan</strong> - €{upgradeDetails?.price}
                {upgradeDetails?.plan === 'yearly' && (
                  <Badge bg="warning" className="ms-2 text-dark">25% Saved!</Badge>
                )}
              </div>
            </div>
            
            <div className="small mb-3">
              <Row>
                <Col xs={6}>
                  <div className="mb-1"><CheckSquare className="me-1" /><strong>Unlimited listings</strong></div>
                  <div className="mb-1"><CheckSquare className="me-1" /><strong>10% discount</strong></div>
                </Col>
                <Col xs={6}>
                  <div className="mb-1"><CheckSquare className="me-1" /><strong>Priority features</strong></div>
                  <div className="mb-1"><CheckSquare className="me-1" /><strong>Analytics access</strong></div>
                </Col>
              </Row>
            </div>
            
            <div className="text-center">
              <small style={{ opacity: 0.9 }}>
                Start enjoying your premium benefits immediately!
              </small>
            </div>
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  )
}