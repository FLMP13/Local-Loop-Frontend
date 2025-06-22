// Make this a welcomning page for the frontend application of our local loop application where all current items are listed and a button to add a new item is provided
import React from 'react';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import ListItem from './ListItem';


export default function Home() {
  return (
    <>
      {/* Full-width hero section with a light background */}
      <Container fluid className="bg-light text-dark text-center py-5">
        <h1 className="display-4">Welcome to the Local Loop</h1>
        <p className="lead mb-4">Share, lend, and discover items in your community</p>
        <Button
          as={Link}
          to="/add-item"
          size="lg"
          variant="primary"        // primary button on light background
        >
          + Add New Item
        </Button>
      </Container>

      {/* Full-width item list */}
      <Container fluid className="py-5 px-3">
        <h2 className="text-center mb-4">Current Items</h2>
        <ListItem />
      </Container>
    </>
  );
}