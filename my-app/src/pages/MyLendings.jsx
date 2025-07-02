import React from 'react';
import TransactionList from '../components/TransactionList';

export default function MyLendings() {
  return <TransactionList endpoint="/api/transactions/lendings" title="My Lendings" />;
}