import React, { useContext, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import TransactionList from '../components/TransactionList';
import PremiumUpgradeModal from '../components/PremiumUpgradeModal';
import { usePremium } from '../hooks/usePremium';
import { Award } from 'react-bootstrap-icons';

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

// MyBorrowings Component
export default function MyBorrowings() {
  const { user } = useContext(AuthContext);
  const { isPremium } = usePremium();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <div>
      {user && !isPremium && (
        <Alert variant="info" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              <Award className="me-1" style={{ color: '#ffc107' }} />
              <strong>Get Priority!</strong> Premium users' requests are seen first by lenders.
            </span>
            <button 
              className="btn btn-warning btn-sm"
              onClick={() => setShowUpgradeModal(true)}
            >
              Upgrade Now
            </button>
          </div>
        </Alert>
      )}
      
      <TransactionList
        context="borrowings"
      />

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal 
        show={showUpgradeModal} 
        onHide={() => setShowUpgradeModal(false)}
        context="priority"
      />
    </div>
  );
}