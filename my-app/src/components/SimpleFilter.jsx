import React from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const statusOptions = [
  'requested', 'accepted', 'paid', 'rejected', 'borrowed',
  'returned', 'completed', 'renegotiation_requested', 'retracted'
];

export default function SimpleFilter({ filter, setFilter }) {
  // Provide safe defaults in case filter is undefined
  const safeFilter = filter || {};
  
  // Helper function to safely update filter with proper fallbacks
  const updateFilter = (field, value) => {
    if (setFilter) {
      setFilter(prevFilter => {
        const currentFilter = prevFilter || { name: '', status: 'all', maxPrice: '', sortBy: 'date_desc' };
        return { ...currentFilter, [field]: value };
      });
    }
  };
  
  return (
    <Form className="mb-3">
      <Row className="g-2">
        <Col md>
          <Form.Control
            placeholder="Name, Description, or Username"
            value={safeFilter.name || ''}
            onChange={e => updateFilter('name', e.target.value)}
          />
        </Col>
        <Col md>
          <Form.Control
            type="number"
            placeholder="Max Price"
            value={safeFilter.maxPrice || ''}
            onChange={e => updateFilter('maxPrice', e.target.value)}
          />
        </Col>
        <Col md>
          <Form.Select
            value={safeFilter.status || 'all'}
            onChange={e => updateFilter('status', e.target.value)}
          >
            <option value="all">All Statuses</option>
            {statusOptions.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md>
          <Form.Select
            value={safeFilter.sortBy || 'date_desc'}
            onChange={e => updateFilter('sortBy', e.target.value)}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
          </Form.Select>
        </Col>
      </Row>
    </Form>
  );
}