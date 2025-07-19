import React from 'react';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
import { ExclamationTriangle, Rocket, X } from 'react-bootstrap-icons';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useAddItem } from '../hooks/useAddItem';
import PremiumUpgradeModal from '../components/PremiumUpgradeModal';

const categories = [
  'Electronics', 
  'Furniture',
  'Clothing', 
  'Books',
  'Sports', 
  'Toys',
  'Tools',
  'Other'
];

// AddItem Component
export default function AddItem() {
    const {
        user,
        title,
        description,
        price,
        category,
        images,
        imagePreviews,
        error,
        availability,
        showUpgradeModal,
        limitError,
        handleTitleChange,
        handleDescriptionChange,
        handlePriceChange,
        handleCategoryChange,
        handleImageChange,
        handleImageRemove,
        handleAvailabilityChange,
        handleSubmit,
        handleUpgrade,
        setShowUpgradeModal
    } = useAddItem();
 
    if (!user) {
        return (
            <Container fluid className="px-md-5" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
                <div className="hero-section bg-light p-4 p-md-5 mb-4">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-md-8 text-center">
                            <h1 className="display-5 fw-bold mb-3">Add New Item</h1>
                            <p className="lead text-muted mb-4">
                                Please log in to start sharing your items with the community
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
        <Container fluid className="px-md-5" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
            {/* Modern Hero Section */}
            <div className="hero-section bg-light p-4 p-md-5 mb-4">
                <div className="row align-items-center">
                    <div className="col">
                        <h1 className="display-5 fw-bold mb-3">Add New Item</h1>
                        <p className="lead text-muted mb-0">
                            Share your items with the community and start earning
                        </p>
                    </div>
                </div>
            </div>

            {/* Modern Form Layout */}
            <Row className="justify-content-center g-4">
                <Col lg={8} xl={6}>
                    <Card className="border-0 shadow-sm modern-card">
                        <Card.Body className="p-4 p-md-5">
                            {error && (
                                <Alert variant="danger" className="rounded-pill mb-4">
                                    <div className="d-flex align-items-center">
                                        <ExclamationTriangle className="me-2" />
                                        {error}
                                    </div>
                                </Alert>
                            )}
                            
                            <Form onSubmit={handleSubmit}>
                                {/* Item Details Section */}
                                <div className="mb-5">
                                    <h5 className="fw-bold mb-3 text-muted text-uppercase">Item Details</h5>
                                    
                                    <Form.Group controlId="formTitle" className="mb-4">
                                        <Form.Label className="fw-semibold">Item Title *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="What are you sharing?"
                                            value={title}
                                            onChange={handleTitleChange}
                                            required
                                            className="rounded-pill px-4 py-3"
                                            style={{ fontSize: '1rem' }}
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="formDescription" className="mb-4">
                                        <Form.Label className="fw-semibold">Description *</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            placeholder="Describe your item, its condition, and any special instructions..."
                                            value={description}
                                            onChange={handleDescriptionChange}
                                            required
                                            className="rounded-3 px-4 py-3"
                                            style={{ fontSize: '1rem', resize: 'none' }}
                                        />
                                    </Form.Group>

                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group controlId="formCategory">
                                                <Form.Label className="fw-semibold">Category *</Form.Label>
                                                <Form.Select
                                                    value={category}
                                                    onChange={handleCategoryChange}
                                                    required
                                                    className="rounded-pill px-4 py-3"
                                                    style={{ fontSize: '1rem' }}
                                                >
                                                    <option value="">Choose category</option>
                                                    {categories.map((cat, idx) => (
                                                        <option key={idx} value={cat}>{cat}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group controlId="formPrice">
                                                <Form.Label className="fw-semibold">Weekly Price *</Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0 rounded-start-pill px-4">€</span>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={price}
                                                        onChange={handlePriceChange}
                                                        required
                                                        className="border-start-0 rounded-end-pill px-4 py-3"
                                                        style={{ fontSize: '1rem' }}
                                                    />
                                                </div>
                                                <Form.Text className="text-muted small">
                                                    Set your weekly rental price
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </div>

                                {/* Images Section */}
                                <div className="mb-5">
                                    <h5 className="fw-bold mb-3 text-muted text-uppercase">Photos</h5>
                                    
                                    <Form.Group controlId="formImages">
                                        <Form.Label className="fw-semibold">Item Photos *</Form.Label>
                                        <div className="upload-area border border-2 border-dashed rounded-3 p-4 text-center bg-light">
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageChange}
                                                required
                                                className="d-none"
                                                id="imageUpload"
                                            />
                                            <label htmlFor="imageUpload" className="cursor-pointer">
                                                <div className="mb-3">
                                                    <i className="bi bi-cloud-upload" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                                                </div>
                                                <p className="mb-2 fw-semibold">Click to upload photos</p>
                                                <p className="text-muted small mb-0">
                                                    Upload up to 3 images (JPG, PNG, GIF)
                                                </p>
                                            </label>
                                        </div>
                                        
                                        {images.length > 0 && (
                                            <div className="mt-3">
                                                <div className="d-flex align-items-center mb-2">
                                                    <span className="badge bg-primary rounded-pill me-2">
                                                        {images.length} photo{images.length !== 1 ? 's' : ''} selected
                                                    </span>
                                                    {images.length === 3 && (
                                                        <span className="text-muted small">Maximum reached</span>
                                                    )}
                                                </div>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {imagePreviews.map((src, idx) => (
                                                        <div className="position-relative d-inline-block" key={idx}>
                                                            <Image 
                                                                src={src} 
                                                                className="rounded-3 border"
                                                                style={{ 
                                                                    maxWidth: '100%',
                                                                    maxHeight: '250px',
                                                                    height: 'auto',
                                                                    width: 'auto',
                                                                    display: 'block'
                                                                }} 
                                                                alt={`Preview ${idx + 1}`} 
                                                            />
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                className="position-absolute top-0 end-0 m-2 rounded-circle p-1"
                                                                style={{ 
                                                                    width: '28px', 
                                                                    height: '28px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '14px',
                                                                    lineHeight: '1',
                                                                    backgroundColor: 'rgba(108, 117, 125, 0.5)',
                                                                    borderColor: 'rgba(108, 117, 125, 0.5)',
                                                                    color: 'white'
                                                                }}
                                                                onClick={() => handleImageRemove(idx)}
                                                                title="Remove image"
                                                            >
                                                                <X />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </Form.Group>
                                </div>

                                {/* Availability Section */}
                                <div className="mb-5">
                                    <h5 className="fw-bold mb-3 text-muted text-uppercase">Availability</h5>
                                    
                                    <Form.Group controlId="formAvailability">
                                        <Form.Label className="fw-semibold">When is your item available?</Form.Label>
                                        <p className="text-muted small mb-3">
                                            Select the date range when your item will be available for borrowing
                                        </p>
                                        <div className="calendar-container bg-white border rounded-3 shadow-sm">
                                            <DayPicker
                                                mode="range"
                                                selected={availability}
                                                onSelect={handleAvailabilityChange}
                                                disabled={{ before: new Date() }}
                                            />
                                        </div>
                                    </Form.Group>
                                </div>

                                {/* Submit Section */}
                                <div className="d-grid gap-3">
                                    <Button 
                                        variant="primary" 
                                        type="submit" 
                                        size="lg"
                                        className="rounded-pill py-3"
                                        style={{ fontSize: '1.1rem', fontWeight: '600' }}
                                    >
                                        <Rocket className="me-2" />
                                        Add Item to Community
                                    </Button>
                                    <Button 
                                        as={Link}
                                        to="/my-items"
                                        variant="outline-secondary" 
                                        size="lg"
                                        className="rounded-pill py-3"
                                    >
                                        Cancel
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
                currentListings={limitError?.currentListings}
                maxListings={limitError?.maxListings}
                onUpgrade={handleUpgrade}
            />
        </Container>
    );
}