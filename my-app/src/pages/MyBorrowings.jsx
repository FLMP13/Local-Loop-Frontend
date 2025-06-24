import React from 'react';
import MyItems from './MyItems';

export default function MyBorrowings() {
  return <MyItems statusFilter="borrowed" title="My Borrowings" />;
  // Big Problem: If the user borrows, the item is not owned by him, so it should not be listed here.
  // Better: List of transactions filtered by status
}