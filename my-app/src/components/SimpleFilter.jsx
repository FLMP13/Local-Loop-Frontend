import React from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function SimpleFilter({ filter, setFilter, statusOptions }) {
  return (
    <Form className="mb-3">
      <Row className="g-2">
        <Col md>
          <Form.Control
            placeholder="Name, Description, or Username"
            value={filter.name}
            onChange={e => setFilter(f => ({ ...f, name: e.target.value }))}
          />
        </Col>
        <Col md>
          <Form.Control
            type="number"
            placeholder="Max Price"
            value={filter.maxPrice}
            onChange={e => setFilter(f => ({ ...f, maxPrice: e.target.value }))}
          />
        </Col>
        {statusOptions && (
          <Col md>
            <Form.Select
              value={filter.status}
              onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              {statusOptions.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')}</option>
              ))}
            </Form.Select>
          </Col>
        )}
        <Col md>
          <Form.Select
            value={filter.sortBy || 'date_desc'}
            onChange={e => setFilter(f => ({ ...f, sortBy: e.target.value }))}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
          </Form.Select>
        </Col>
      </Row>
    </Form>
  );
}