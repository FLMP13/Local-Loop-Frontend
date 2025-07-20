// List all items in the database in a list format in the frontend application
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { Star } from 'react-bootstrap-icons';
import { AuthContext } from '../context/AuthContext'; 
import { useMyItems } from '../hooks/useMyItems';
import PremiumUpgradeModal from '../components/PremiumUpgradeModal';
import { usePremium } from '../hooks/usePremium';

// MyItems component to display user's items with optional status filter
export default function MyItems({ statusFilter, title = "My Items" }) {
    const { user } = useContext(AuthContext);
    const { isPremium } = usePremium();
    const { items, error, loading } = useMyItems(statusFilter);
    const [showModal, setShowModal] = useState(false);
    
    // Rotate between different upgrade prompts
    const [promptType, setPromptType] = useState(() => 
        Math.random() > 0.5 ? 'priority' : 'analytics'
    );

    if (!user) {
        return (
            <Container fluid className="px-md-5" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
                <div className="hero-section bg-light p-4 p-md-5 mb-4">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-md-8 text-center">
                            <h1 className="display-5 fw-bold mb-3">My Items</h1>
                            <p className="lead text-muted mb-4">
                                Please log in to view and manage your shared items
                            </p>
                            <div className="d-flex gap-3 justify-content-center">
                                <Button 
                                    as={Link} 
                                    to="/login" 
                                    variant="primary" 
                                    size="lg"
                                    className="rounded-pill px-4"
                                >
                                    Log In
                                </Button>
                                <Button 
                                    as={Link} 
                                    to="/create-profile" 
                                    variant="outline-primary" 
                                    size="lg"
                                    className="rounded-pill px-4"
                                >
                                    Create Profile
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-5 px-4">
            <h2 className="text-center mb-5">My Items</h2>
            
            {user && !isPremium && items.length > 0 && (
                <Alert variant={promptType === 'priority' ? 'warning' : 'info'} className="mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <span>
                            {promptType === 'priority' ? (
                                <><Star className="me-1" /><strong>Get Priority Visibility!</strong> Premium listings appear first in search results.</>
                            ) : (
                                <><Star className="me-1" /><strong>Want Analytics?</strong> See detailed view statistics for all your items with Premium!</>
                            )}
                        </span>
                        <Button 
                            variant="warning" 
                            size="sm"
                            onClick={() => setShowModal(true)}
                        >
                            Upgrade Now
                        </Button>
                    </div>
                </Alert>
            )}
            {error && <Alert variant="danger">{error}</Alert>}
            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" style={{ color: 'var(--brand)' }} />
                    <p className="mt-3 text-muted">Loading your items...</p>
                </div>
            ) : items.length === 0 ? (
              <Row className="justify-content-center">
                <Col md={6} className="text-center">
                  <div className="py-5">
                    <h4 className="mb-4 text-muted">No items found</h4>
                    <p className="mb-4 text-muted">
                      You haven't added any items yet. Start by adding your first item to share with the community!
                    </p>
                    <Button
                      as={Link}
                      to="/add-item"
                      variant="primary"
                      size="lg"
                      className="px-4"
                    >
                      Add Your First Item
                    </Button>
                  </div>
                </Col>
              </Row>
            ) : (
              <Row xs={1} sm={2} md={4} className="g-4">
                {items.map(item => (
                    <Col key={item._id}>
                        <Card className="h-100">
                            {item.images?.length > 0 && (
                                <Card.Img
                                    variant="top"
                                    src={`/api/items/${item._id}/image/0`}
                                    style={{ height: '180px', objectFit: 'cover' }}
                                />
                            )}
                            <Card.Body className="d-flex flex-column">
                                <Card.Title className="h5">{item?.title || 'Unknown Item'}</Card.Title>
                                <Card.Subtitle className="mb-2 text-secondary">
                                    {item?.category || 'No Category'}
                                </Card.Subtitle>
                                <Card.Text>
                                    <strong>Status:</strong> {item?.status || 'Unknown'}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Owner:</strong>{' '}
                                    {user?.nickname || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'You'}
                                </Card.Text>
                                <Card.Text className="flex-grow-1">
                                    {item?.description || 'No description available'}
                                </Card.Text>
                                <Card.Text className="fw-bold mb-2">
                                    €{item?.price?.toFixed(2) || '0.00'}/week
                                </Card.Text>
                                
                                {/* Premium Analytics */}
                                {item.isPremiumAnalytics ? (
                                    <Card.Text className="small text-muted mb-3">
                                        <i className="bi bi-eye me-1"></i>
                                        <span className="fw-semibold">{item.viewCount || 0}</span> views
                                        <span className="badge bg-success ms-2 px-2 py-1">
                                            <i className="bi bi-star-fill me-1" style={{fontSize: '0.7rem'}}></i>
                                            Premium Analytics
                                        </span>
                                    </Card.Text>
                                ) : (
                                    <Card.Text className="small text-muted mb-3">
                                        <i className="bi bi-eye-slash me-1"></i>
                                        <span className="text-muted">Analytics available with</span>
                                        <Button 
                                            as={Link} 
                                            to="/profile" 
                                            variant="link" 
                                            size="sm" 
                                            className="p-0 ms-1 text-decoration-none"
                                        >
                                            Premium
                                        </Button>
                                    </Card.Text>
                                )}
                                <Button
                                    as={Link}
                                    to={`/items/${item._id}`}
                                    variant="primary"
                                    className="mt-auto"
                                >
                                    View Item
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
              </Row>
            )}
            
            <PremiumUpgradeModal 
                show={showModal} 
                onHide={() => setShowModal(false)}
                context={promptType === 'priority' ? 'priority-listing' : 'analytics'}
            />
        </Container>
    );
}