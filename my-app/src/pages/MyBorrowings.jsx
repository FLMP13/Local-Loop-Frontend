import React from 'react';
import TransactionList from '../components/TransactionList';

export default function MyBorrowings() {
  return <TransactionList endpoint="/api/transactions/borrowings" title="My Borrowings" />;
}