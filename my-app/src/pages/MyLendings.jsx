import React, { useContext, useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import TransactionList from '../components/TransactionList';
import PremiumUpgradeModal from '../components/PremiumUpgradeModal';
import { usePremium } from '../hooks/usePremium';
import { Star } from 'react-bootstrap-icons';

const STATUS_OPTIONS = [
  'requested',
  'accepted',
  'rejected',
  'borrowed',
  'returned',
  'completed',
  'renegotiation_requested',
  'retracted'
];

export default function MyLendings() {
  const { user } = useContext(AuthContext);
  const { isPremium } = usePremium();
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      {user && !isPremium && (
        <Alert variant="warning" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              <Star className="me-1" style={{ color: '#ffc107' }} />
              <strong>Boost Your Listings!</strong> Premium items appear first in search results, getting more views and requests.
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
      
      <TransactionList
        context="lendings"
      />

      <PremiumUpgradeModal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        context="priority-listing"
      />
    </div>
  );
}