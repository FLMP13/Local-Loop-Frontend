import React from 'react';
import TransactionList from '../components/TransactionList';

const STATUS_OPTIONS = [
  'requested',
  'accepted',
  'rejected',
  'borrowed',
  'returned',
  'completed',
  'renegotiation_requested',
];

export default function MyLendings() {
  return (
    <TransactionList
      endpoint="/api/transactions/lendings"
      title="My Lendings"
      statusOptions={STATUS_OPTIONS}
    />
  );
}