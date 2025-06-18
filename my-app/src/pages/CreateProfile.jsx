// src/pages/Login.jsx
import React, { useState, useRef } from 'react'
import {
  Container,
  Row,
  Col,
  Form,
  Button
} from 'react-bootstrap'

export default function CreateProfile() {
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
  const fileInputRef = useRef()

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'profilePic') {
      setForm(f => ({ ...f, profilePic: files[0] }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: send `form` (including form.profilePic) to signup API
    console.log(form)
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
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                minLength={6}
                required
              />
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
              <Button variant="dark" size="lg" type="submit">
                Create Profile
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}
