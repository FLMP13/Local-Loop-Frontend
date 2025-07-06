// src/pages/MyProfile.jsx
import React, { useState, useEffect, useContext, useRef } from 'react'         // add useRef
import { Container, Form, Button, Alert, Row, Col, Image, Card } from 'react-bootstrap' // import Row, Col, Image, Card
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom' 
import { AuthContext } from '../context/AuthContext.jsx'
import RatingDisplay from '../components/RatingDisplay'

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
    <Container className="py-5">
      <h1 className="mb-4">My Profile</h1>

      {error   && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleProfileSubmit}>
        <Row className="mb-3">
          <Col xs="auto" className="text-center">
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                overflow: 'hidden',
                cursor: 'pointer',
                backgroundColor: '#f0f0f0'
              }}
              onClick={handleAvatarClick}
            >
              {formData.avatarUrl
                ? (
                  // display avatar from either endpoint or preview
                  <Image src={formData.avatarUrl} roundedCircle fluid />
                ) : (
                  <span style={{ lineHeight: '100px' }}>Upload</span>
                )
              }
            </div>
            <Form.Control
              type="file"
              name="avatar" 
              accept="image/*"
              ref={fileInputRef}                                              // attach ref
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </Col>
          <Col>
            <Form.Group className="mb-3" controlId="firstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="lastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                disabled
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3" controlId="nickname">
          <Form.Label>Nickname</Form.Label>
          <Form.Control
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="zipCode">
          <Form.Label>Zip Code</Form.Label>
          <Form.Control
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="bio">
          <Form.Label>Bio</Form.Label>
          <Form.Control
            as="textarea"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
          />
        </Form.Group>

        <div className="d-flex justify-content-between mb-5">
          <Button variant="dark" type="submit">Save Profile</Button>
          <Button variant="outline-secondary" onClick={handleLogout}>Log Out</Button>
        </div>
      </Form>

      {/* Add Ratings Section */}
      <Card className="mt-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">My Ratings</h5>
          {user && (
            <Button 
              as={Link} 
              to={`/users/${user.id}/reviews`} 
              variant="outline-primary"
              size="sm"
            >
              View All Reviews
            </Button>
          )}
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6>As Lender</h6>
              <RatingDisplay 
                rating={formData.lenderRating?.average || 0} 
                count={formData.lenderRating?.count || 0} 
                size="lg"
              />
            </Col>
            <Col md={6}>
              <h6>As Borrower</h6>
              <RatingDisplay 
                rating={formData.borrowerRating?.average || 0} 
                count={formData.borrowerRating?.count || 0} 
                size="lg"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <h2 className="mb-3">Change Password</h2>
      {pwError   && <Alert variant="danger">{pwError}</Alert>}
      {pwSuccess && <Alert variant="success">{pwSuccess}</Alert>}

      <Form onSubmit={handlePasswordSubmit}>
        <Form.Group className="mb-3" controlId="oldPassword">
          <Form.Label>Old Password</Form.Label>
          <Form.Control
            type="password"
            name="oldPassword"
            value={passwords.oldPassword}
            onChange={handlePasswordChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="newPassword">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Confirm New Password</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handlePasswordChange}
            required
          />
        </Form.Group>

        <Button variant="dark" type="submit">Change Password</Button>
      </Form>
    </Container>
  )
}