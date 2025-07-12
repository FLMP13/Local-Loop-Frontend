import React, { useContext, useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { useShowItem } from '../hooks/useShowItem';
import { AuthContext } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, Row, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

export default function ShowItem() {
    const { user } = useContext(AuthContext);
    const { item, loading, error, handleDelete } = useShowItem();
    const navigate = useNavigate();
    const [selectedRange, setSelectedRange] = useState();
    const [unavailableRanges, setUnavailableRanges] = useState([]);
    const [showImageModal, setShowImageModal] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isRequestingBorrow, setIsRequestingBorrow] = useState(false);

    useEffect(() => {
        if (!item || !item._id) return;
        const fetchUnavailable = async () => {
            const res = await fetch(`/api/items/${item._id}/unavailable`);
            if (res.ok) {
                const data = await res.json();
                setUnavailableRanges(data.map(r => ({
                    from: new Date(r.from),
                    to: new Date(r.to)
                })));
            }
        };
        fetchUnavailable();
    }, [item?._id]);

    const handleRequestBorrow = async () => {
        if (!selectedRange?.from || !selectedRange?.to) {
            alert('Please select a valid date range.');
            return;
        }
        
        // Prevent multiple requests
        if (isRequestingBorrow) return;
        
        try {
            setIsRequestingBorrow(true);
            const token = localStorage.getItem('token');
            const response = await axios.post(
                '/api/transactions/request',
                {
                    itemId: item._id,
                    requestedFrom: selectedRange.from.toISOString(),
                    requestedTo: selectedRange.to.toISOString()
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Success - redirect to My Borrowings
            navigate('/my-borrowings');
        } catch (err) {
            console.error('Request error:', err);
            alert(err.response?.data?.error || 'Failed to send request.');
        } finally {
            setIsRequestingBorrow(false);
        }
    };

    // Image modal functions
    const openImageModal = (index) => {
        setCurrentImageIndex(index);
        setShowImageModal(true);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeImageModal = () => {
        setShowImageModal(false);
        document.body.style.overflow = 'unset'; // Restore scrolling
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => 
            prev === item.images.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => 
            prev === 0 ? item.images.length - 1 : prev - 1
        );
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!showImageModal) return;
            
            if (e.key === 'Escape') {
                closeImageModal();
            } else if (e.key === 'ArrowRight') {
                nextImage();
            } else if (e.key === 'ArrowLeft') {
                prevImage();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [showImageModal, item?.images?.length]);

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (loading) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" style={{ color: 'var(--brand)' }} />
                <p className="mt-3 text-muted">Loading item details...</p>
            </div>
        );
    }

    const disabledDays = day =>
        !item.availability?.some(
            ({ from, to }) => day >= new Date(from) && day <= new Date(to)
        );

    return (
        <Container fluid className="container-fluid-zoomed py-zoomed">
            {/* Hero Section with Images */}
            <Row className="row-zoomed mb-4">
                <Col lg={8} className="mx-auto">
                    <div className="position-relative">
                        {item.images?.length > 0 ? (
                            <div className="modern-image-gallery">
                                <div className="main-image mb-3">
                                    <img
                                        src={`/api/items/${item._id}/image/0`}
                                        alt={item.title}
                                        className="w-100 rounded-4 shadow"
                                        style={{ 
                                            height: '400px', 
                                            objectFit: 'cover',
                                            border: '1px solid var(--border-color)',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => openImageModal(0)}
                                    />
                                </div>
                                {item.images.length > 1 && (
                                    <Row className="g-2">
                                        {item.images.slice(1, 4).map((_, index) => (
                                            <Col key={index + 1} xs={4}>
                                                <img
                                                    src={`/api/items/${item._id}/image/${index + 1}`}
                                                    alt={`${item.title} ${index + 2}`}
                                                    className="w-100 rounded-3 shadow-sm"
                                                    style={{ 
                                                        height: '120px', 
                                                        objectFit: 'cover',
                                                        border: '1px solid var(--border-color)',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                                    onClick={() => openImageModal(index + 1)}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                )}
                            </div>
                        ) : (
                            <div 
                                className="d-flex align-items-center justify-content-center bg-light rounded-4 shadow-sm"
                                style={{ height: '400px', border: '1px solid var(--border-color)' }}
                            >
                                <div className="text-center text-muted">
                                    <h5>No images available</h5>
                                    <p>This item doesn't have any photos yet</p>
                                </div>
                            </div>
                        )}
                    </div>
                </Col>
            </Row>

            {/* Main Content */}
            <Row className="row-zoomed">
                <Col lg={8} className="mx-auto">
                    <Row className="row-zoomed g-3">
                        {/* Left Column - Item Details */}
                        <Col lg={7}>
                            <div className="modern-item-details">
                                {/* Header */}
                                <div className="mb-4">
                                    <h1 className="display-5 fw-bold text-primary mb-2">{item.title}</h1>
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <span className="badge bg-primary fs-6 px-3 py-2">{item.category}</span>
                                        <span className="text-success fw-bold fs-4">€{item.price}/week</span>
                                    </div>
                                </div>

                                {/* Description Card */}
                                <Card className="card-zoomed border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                    <Card.Body className="p-4">
                                        <h5 className="card-title mb-3 d-flex align-items-center">
                                            <span className="me-2">📝</span>
                                            Description
                                        </h5>
                                        <p className="card-text fs-6 lh-base text-muted">{item.description}</p>
                                    </Card.Body>
                                </Card>

                                {/* Owner Information Card */}
                                <Card className="card-zoomed border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                    <Card.Body className="p-4">
                                        <h5 className="card-title mb-3 d-flex align-items-center">
                                            <span className="me-2">👤</span>
                                            Owner Information
                                        </h5>
                                        <div className="row align-items-center">
                                            <div className="col">
                                                <h6 className="mb-1">{item.owner?.nickname || item.owner?.email || 'Unknown'}</h6>
                                                <p className="text-muted mb-0">
                                                    <span className="me-1">📍</span>
                                                    Zip Code: {item.owner?.zipCode || 'Unknown'}
                                                </p>
                                            </div>
                                            {item.owner?._id && (
                                                <div className="col-auto">
                                                    <Button 
                                                        as={Link} 
                                                        to={`/users/${item.owner._id}/reviews`}
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="rounded-pill"
                                                    >
                                                        <span className="me-1">⭐</span>
                                                        View Reviews
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                        </Col>

                        {/* Right Column - Booking */}
                        <Col lg={5}>
                            <div className="sticky-top sticky-top-zoomed">
                                <Card className="card-zoomed border-0 shadow" style={{ borderRadius: '20px' }}>
                                    <Card.Body className="p-4">
                                        <h4 className="card-title mb-4 text-center">
                                            <span className="me-2">📅</span>
                                            Book this Item
                                        </h4>
                                        
                                        <div className="mb-4">
                                            <h6 className="mb-3">Select your dates</h6>
                                            <div className="calendar-container p-3 bg-light rounded-3">
                                                <DayPicker
                                                    mode="range"
                                                    selected={selectedRange}
                                                    onSelect={setSelectedRange}
                                                    disabled={[{ before: new Date() }, disabledDays, ...unavailableRanges]}
                                                    className="custom-day-picker"
                                                />
                                            </div>
                                        </div>

                                        {selectedRange?.from && selectedRange?.to && (
                                            <div className="booking-summary mb-4 p-3 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-25">
                                                <h6 className="text-success mb-2">
                                                    <span className="me-2">✅</span>
                                                    Booking Summary
                                                </h6>
                                                <p className="mb-1 small">
                                                    <strong>Dates:</strong> {selectedRange.from.toLocaleDateString()} – {selectedRange.to.toLocaleDateString()}
                                                </p>
                                                <p className="mb-0 text-success fw-bold">
                                                    <strong>Total: €{computeWeeklyCharge(selectedRange, item.price)}</strong>
                                                </p>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="d-grid gap-2">
                                            {user?.id === item.owner?._id ? (
                                                <>
                                                    <Button
                                                        variant="warning"
                                                        as={Link}
                                                        to={`/items/${item._id}/edit`}
                                                        className="rounded-pill py-2"
                                                        size="lg"
                                                    >
                                                        <span className="me-2">✏️</span>
                                                        Edit Item
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        onClick={handleDelete}
                                                        className="rounded-pill py-2"
                                                        size="lg"
                                                    >
                                                        <span className="me-2">🗑️</span>
                                                        Delete Item
                                                    </Button>
                                                </>
                                            ) : (
                                                user && (
                                                    <Button
                                                        variant="primary"
                                                        onClick={handleRequestBorrow}
                                                        className="rounded-pill py-3"
                                                        size="lg"
                                                        disabled={!selectedRange?.from || !selectedRange?.to || isRequestingBorrow}
                                                    >
                                                        {isRequestingBorrow ? (
                                                            <>
                                                                <Spinner
                                                                    animation="border"
                                                                    size="sm"
                                                                    className="me-2"
                                                                    style={{ 
                                                                        width: '16px', 
                                                                        height: '16px',
                                                                        borderWidth: '2px',
                                                                        color: '#ffc107'
                                                                    }}
                                                                />
                                                                Sending Request...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="me-2">📨</span>
                                                                {selectedRange?.from && selectedRange?.to 
                                                                    ? 'Request to Borrow' 
                                                                    : 'Select dates to continue'
                                                                }
                                                            </>
                                                        )}
                                                    </Button>
                                                )
                                            )}
                                            <Button 
                                                variant="outline-secondary" 
                                                onClick={() => window.history.back()}
                                                className="rounded-pill"
                                            >
                                                <span className="me-2">←</span>
                                                Back
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {/* Image Modal */}
            {showImageModal && item.images?.length > 0 && (
                <div className="image-modal" onClick={closeImageModal}>
                    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={`/api/items/${item._id}/image/${currentImageIndex}`}
                            alt={`${item.title} - Image ${currentImageIndex + 1}`}
                        />
                        
                        {/* Navigation Buttons */}
                        {item.images.length > 1 && (
                            <>
                                <button
                                    className="image-modal-nav image-modal-prev"
                                    onClick={prevImage}
                                    aria-label="Previous image"
                                >
                                    ←
                                </button>
                                <button
                                    className="image-modal-nav image-modal-next"
                                    onClick={nextImage}
                                    aria-label="Next image"
                                >
                                    →
                                </button>
                            </>
                        )}
                        
                        {/* Close Button */}
                        <button
                            className="image-modal-close"
                            onClick={closeImageModal}
                            aria-label="Close image modal"
                        >
                            ×
                        </button>
                        
                        {/* Image Counter */}
                        {item.images.length > 1 && (
                            <div className="image-modal-counter">
                                {currentImageIndex + 1} / {item.images.length}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Container>
    );
}

function computeWeeklyCharge({ from, to }, weeklyRate) {
    const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
    const weeks = Math.ceil(days / 7);
    return weeks * weeklyRate;
}