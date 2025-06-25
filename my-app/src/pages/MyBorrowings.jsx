import React from 'react';
import MyItems from './MyItems';

export default function MyBorrowings() {
  return <MyItems statusFilter="borrowed" title="My Borrowings" />;
  // Big Problem: If the user borrows, the item is not owned by him, so it should not be listed here.
  // Better: List of transactions filtered by status

  // Quick: fetch all items with status “borrowed” and filter client-side by some borrower field you add to each item.
  // Proper: Extend  backend schema & API to track a borrower and expose a /api/items/borrowed endpoint.
}