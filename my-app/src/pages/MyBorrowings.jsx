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
  'retracted'
];

export default function MyBorrowings() {
  return (
    <TransactionList
      endpoint="/api/transactions/borrowings"
      title="My Borrowings"
      statusOptions={STATUS_OPTIONS}
    />
  );
}