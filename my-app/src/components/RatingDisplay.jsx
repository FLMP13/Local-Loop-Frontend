import React from 'react';
import { StarFill, Star } from 'react-bootstrap-icons';

// Rating display component which shows the average rating and number of reviews
export default function RatingDisplay({ rating, count, size = 'sm' }) {
  if (count === 0) {
    return <span className="text-muted">No ratings yet</span>;
  }

  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<StarFill key={i} style={{ color: '#ffc107' }} />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<StarFill key={i} style={{ color: '#ffc107' }} />);
    } else {
      stars.push(<Star key={i} style={{ color: '#dee2e6' }} />);
    }
  }

  return (
    <span className={`rating-display ${size === 'lg' ? 'fs-5' : ''}`}>
      {stars} {rating.toFixed(1)} ({count} review{count !== 1 ? 's' : ''})
    </span>
  );
}