// src/pages/Home.jsx
import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import {
  Container, Row, Col, Card, Button, Alert, Form, InputGroup
} from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext.jsx'
import Spinner from 'react-bootstrap/Spinner'
import { FiSearch, FiMapPin } from 'react-icons/fi'     // search + pin icon
import RatingDisplay from '../components/RatingDisplay';

const categories = [
  '', 'Electronics','Furniture','Clothing',
  'Books','Sports','Toys','Tools','Other'
]

export default function Home() {
  const { user } = useContext(AuthContext)

  // draft state for form inputs
  const [draft, setDraft] = useState({
    search: '', category: '', minPrice: '', maxPrice:'', sort:'',
    radius: ''
  })

  // filters only update on Apply
  const [filters, setFilters] = useState(draft)
  const { items, error, loading } = useItems(filters)

  const handleFilterChange = e => {
    const { name, value } = e.target
    setDraft(d => ({ ...d, [name]: value }))
  }

  // only copy draft into filters on Apply
  const handleApply = e => {
    e.preventDefault()
    setFilters(draft)
  }

  const handleReset = () => {
    const clean = {
      search:'', category:'', minPrice:'', maxPrice:'', sort:'',
      radius: ''
    }
    setDraft(clean)
    setFilters(clean)  // reset applied filters too
  }

  return (
    <Container fluid className="py-4" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold" style={{ color: 'var(--brand)', marginBottom: '8px' }}>Local Loop</h1>
        <p className="lead text-muted">Discover and share items in your community</p>
      </div>

      <div className="search-container">
        <Form onSubmit={handleApply}>
          {/* Main Search Bar */}
          <Row className="mb-4">
            <Col>
              <div className="position-relative">
                <InputGroup size="lg">
                  <InputGroup.Text style={{ backgroundColor: 'white', border: '2px solid var(--brand)', borderRight: 'none' }}>
                    <FiSearch size={20} color="var(--brand)" />
                  </InputGroup.Text>
                  <Form.Control
                    name="search"
                    placeholder="What are you looking for?"
                    value={draft.search}
                    onChange={handleFilterChange}
                    style={{ 
                      border: '2px solid var(--brand)', 
                      borderLeft: 'none',
                      fontSize: '1.1rem',
                      padding: '12px 16px'
                    }}
                  />
                </InputGroup>
              </div>
            </Col>
          </Row>

          {/* Filters Row */}
          <Row className="gx-3 gy-3 align-items-end">
            {/* Category */}
            <Col lg={2} md={4} sm={6}>
              <Form.Label className="fw-semibold text-muted small">Category</Form.Label>
              <Form.Select
                name="category"
                value={draft.category}             
                onChange={handleFilterChange}
                style={{ borderColor: 'var(--border-color)' }}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c || 'All Categories'}</option>
                ))}
              </Form.Select>
            </Col>

            {/* Price Range */}
            <Col lg={2} md={4} sm={6}>
              <Form.Label className="fw-semibold text-muted small">Min Price</Form.Label>
              <Form.Control
                name="minPrice"
                type="number"
                placeholder="Min $"
                value={draft.minPrice}             
                onChange={handleFilterChange}
                min="0"
                style={{ borderColor: 'var(--border-color)' }}
              />
            </Col>
            <Col lg={2} md={4} sm={6}>
              <Form.Label className="fw-semibold text-muted small">Max Price</Form.Label>
              <Form.Control
                name="maxPrice"
                type="number"
                placeholder="Max $"
                value={draft.maxPrice}             
                onChange={handleFilterChange}
                min="0"
                style={{ borderColor: 'var(--border-color)' }}
              />
            </Col>

            {/* Sort */}
            <Col lg={2} md={4} sm={6}>
              <Form.Label className="fw-semibold text-muted small">Sort By</Form.Label>
              <Form.Select
                name="sort"
                value={draft.sort}                 
                onChange={handleFilterChange}
                style={{ borderColor: 'var(--border-color)' }}
              >
                <option value="">Most Recent</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </Form.Select>
            </Col>

            {/* Radius */}
            <Col lg={2} md={4} sm={6}>
              <Form.Label className="fw-semibold text-muted small">Distance</Form.Label>
              <Form.Select
                name="radius"
                value={draft.radius}
                onChange={handleFilterChange}
                style={{ borderColor: 'var(--border-color)' }}
              >
                <option value="">All Germany</option>
                <option value="local">My Area</option>
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
              </Form.Select>
            </Col>

            {/* Action Buttons */}
            <Col lg={2} md={4} sm={6}>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  onClick={handleReset}
                  disabled={loading}
                  style={{ borderRadius: '8px', flex: 1 }}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  style={{ borderRadius: '8px', flex: 1 }}
                >
                  Apply
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </div>

      {error && <Alert variant="danger" className="mx-3">{error}</Alert>}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" style={{ color: 'var(--brand)' }} />
          <p className="mt-3 text-muted">Loading items...</p>
        </div>
      ) : (
        <Container>
          <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4">
            {items
              .filter(item => !user || item.owner?._id !== user.id)
              .map(item => (
                <Col key={item._id}>
                  <Card className="h-100 modern-item-card">
                    {item.images?.[0] && (
                      <div style={{ height: '200px', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                        <Card.Img
                          variant="top"
                          src={`/api/items/${item._id}/image/0`}
                          style={{ 
                            height: '100%', 
                            width: '100%',
                            objectFit: 'contain',
                            objectPosition: 'center',
                            backgroundColor: '#f8f9fa'
                          }}
                        />
                      </div>
                    )}
                    <Card.Body className="d-flex flex-column p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title className="h6 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
                          {item.title}
                        </Card.Title>
                        {item.isPremiumListing && (
                          <span className="badge bg-white text-dark ms-2" style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: 'bold',
                            border: '1px solid #ddd',
                            padding: '0.4rem 0.6rem'
                          }}>
                            👑
                          </span>
                        )}
                      </div>
                      <Card.Subtitle className="mb-2 small text-muted">
                        {item.category}
                      </Card.Subtitle>
                      <Card.Text className="flex-grow-1 small text-muted mb-3" style={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.description}
                      </Card.Text>
                      <div className="mb-3">
                        {/* Regular pricing display */}
                        <span className="h5 fw-bold" style={{ color: 'var(--brand)' }}>
                          €{item.price.toFixed(2)}
                        </span>
                        <small className="text-muted">/week</small>
                      </div>
                      <div className="small mb-2">
                        <div className="text-muted mb-1">
                          <strong>Owner:</strong> {item.owner?.nickname || item.owner?.email || 'Unknown'}
                          {item.owner?._id && (
                            <>
                              {' '}
                              <Link to={`/users/${item.owner._id}/reviews`} className="text-decoration-none small">
                                (Reviews)
                              </Link>
                            </>
                          )}
                        </div>
                        <div className="text-muted mb-1">
                          <FiMapPin size={12} className="me-1" />
                          <strong>ZIP:</strong> {item.owner?.zipCode || 'Unknown'}
                        </div>
                        {/* Owner Rating */}
                        {item.owner?.lenderRating && (
                          <div className="mb-2">
                            <RatingDisplay 
                              rating={item.owner.lenderRating.average} 
                              count={item.owner.lenderRating.count} 
                            />
                          </div>
                        )}
                        {user && item.distance !== undefined && item.distance !== null && (
                          <div className="text-muted">
                            <strong>Distance:</strong> {item.distance} km
                          </div>
                        )}
                      </div>
                      <Button
                        as={Link}
                        to={`/items/${item._id}`}
                        variant="primary"
                        size="sm"
                        className="mt-auto"
                        style={{ borderRadius: '8px', fontWeight: '500' }}
                      >
                        View Details
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
        </Container>
      )}

      {!loading && !items.length && !error && (
        <div className="text-center mt-5">
          <p className="lead text-muted">No items found matching your criteria.</p>
          <p className="text-muted">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </Container>
  )
}
