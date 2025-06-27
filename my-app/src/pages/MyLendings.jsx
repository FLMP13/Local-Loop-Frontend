import React from 'react';
import MyItems from './MyItems';

export default function MyLendings() {
  return <MyItems statusFilter="lent" title="My Lendings" />;
  // Better: List of transactions filtered by status
}