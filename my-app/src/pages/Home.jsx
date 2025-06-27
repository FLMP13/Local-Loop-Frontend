import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  Container, Row, Col, Card, Button, Alert, Form
} from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext.jsx'

const categories = [
  '', 'Electronics','Furniture','Clothing',
  'Books','Sports','Toys','Tools','Other'
]

export default function Home() {
  const { user } = useContext(AuthContext)
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: '', category: '', minPrice: '', maxPrice: '', sort: ''
  })

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k,v]) => {
        if (v) params.append(k, v)
      })
      const res = await axios.get(`/api/items?${params.toString()}`)
      setItems(res.data)
    } catch (err) {
      console.error(err)
      setError('Failed to load items.')
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleFilterChange = e => {
    const { name, value } = e.target
    setFilters(f => ({ ...f, [name]: value }))
  }

  const handleApply = e => {
    e.preventDefault()
    fetchItems()
  }

  const handleReset = () => {
    setFilters({ search:'', category:'', minPrice:'', maxPrice:'', sort:'' })
    setError('')
    setTimeout(fetchItems, 0)
  }

  return (
    <Container fluid className="py-5">
      <h1 className="text-center mb-4">Local Loop</h1>

      {/* filter form */}
      <Form className="d-flex justify-content-center mb-4" onSubmit={handleApply}>
        <Form.Control
          name="search"
          type="search"
          placeholder="Search title…"
          value={filters.search}
          onChange={handleFilterChange}
          className="me-2"
        />
        <Form.Select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="me-2"
        >
          {categories.map(c => (
            <option key={c} value={c}>{c || 'All Categories'}</option>
          ))}
        </Form.Select>
        <Form.Control
          name="minPrice"
          type="number"
          placeholder="Min $"
          value={filters.minPrice}
          onChange={handleFilterChange}
          className="me-2"
          min="0"
        />
        <Form.Control
          name="maxPrice"
          type="number"
          placeholder="Max $"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          className="me-2"
          min="0"
        />
        <Form.Select
          name="sort"
          value={filters.sort}
          onChange={handleFilterChange}
          className="me-2"
        >
          <option value="">Sort by</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </Form.Select>
        <Button variant="secondary" onClick={handleReset} className="me-2">Reset</Button>
        
        <Button type="submit" variant="primary">Apply</Button>
      </Form>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {items.map(item => (
          <Col key={item._id}>
            <Card className="h-100">
              {item.images?.[0] && (
                <Card.Img
                  variant="top"
                  src={`/api/items/${item._id}/image/0`}
                  style={{ height: '180px', objectFit: 'cover' }}
                />
              )}
              <Card.Body className="d-flex flex-column">
                <Card.Title>{item.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {item.category}
                </Card.Subtitle>
                <Card.Text className="flex-grow-1">
                  {item.description.substring(0, 60)}…
                </Card.Text>
                <div className="mb-2">
                  <strong>${item.price.toFixed(2)}</strong>
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

      {!items.length && !error && (
        <p className="text-center mt-4">No items found.</p>
      )}
    </Container>
  )
};