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
    <Container fluid className="py-5">
      <h1 className="text-center mb-4">Local Loop</h1>

      {/* Single filter bar in a Card */}
      <Card body className="bg-light mb-4 shadow-sm">
        <Form onSubmit={handleApply}>                    {/* wrap inputs in form */}
          <Row className="gx-3 gy-2 align-items-end">
            {/* Search */}
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><FiSearch /></InputGroup.Text>
                <Form.Control
                  name="search"
                  placeholder="Search title..."
                  value={draft.search}                // ⬅ use draft
                  onChange={handleFilterChange}
                />
              </InputGroup>
            </Col>

            {/* Category */}
            <Col md={2}>
              <Form.Select
                name="category"
                value={draft.category}             
                onChange={handleFilterChange}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c || 'All Categories'}</option>
                ))}
              </Form.Select>
            </Col>

            {/* Price Range */}
            <Col md={1}>
              <Form.Control
                name="minPrice"
                type="number"
                placeholder="Min $"
                value={draft.minPrice}             
                onChange={handleFilterChange}
                min="0"
              />
            </Col>
            <Col md={1}>
              <Form.Control
                name="maxPrice"
                type="number"
                placeholder="Max $"
                value={draft.maxPrice}             
                onChange={handleFilterChange}
                min="0"
              />
            </Col>

            {/* Sort */}
            <Col md={2}>
              <Form.Select
                name="sort"
                value={draft.sort}                 
                onChange={handleFilterChange}
              >
                <option value="">Sort by</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </Form.Select>
            </Col>

            {/* Radius dropdown */}
            <Col md={2}>
              <Form.Select
                name="radius"
                value={draft.radius}
                onChange={handleFilterChange}
              >
                <option value="">Overall in Germany</option>
                <option value="local">My Zipcode Area</option>
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="15">15 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
                <option value="200">200 km</option>
              </Form.Select>
            </Col>

            {/* Actions */}
            <Col md="auto" className="text-end">
              <Button
                variant="outline-secondary"
                onClick={handleReset}
                className="me-2"
                disabled={loading}                            // disable while loading
              >
                Reset
              </Button>
              <Button
                type="submit"                                 // submit the form
                variant="primary"
                disabled={loading}                           
              >
                Apply
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {items.map(item => (
            <Col key={item._id}>
              <Card className="h-100 shadow-sm">
                {item.images?.[0] && (
                  <Card.Img
                    variant="top"
                    src={`/api/items/${item._id}/image/0`}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fs-5">{item.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted small">
                    {item.category}
                  </Card.Subtitle>
                  <Card.Text className="flex-grow-1 text-truncate small">
                    {item.description}
                  </Card.Text>
                  <div className="mt-2 mb-3">
                    <strong className="fs-6">${item.price.toFixed(2)}</strong>
                  </div>
                  <Button
                    as={Link}
                    to={`/items/${item._id}`}
                    variant="primary"
                    className="mt-auto"
                  >
                    View
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {!loading && !items.length && !error && (
        <p className="text-center mt-4">No items found.</p>
      )}
    </Container>
  )
}
