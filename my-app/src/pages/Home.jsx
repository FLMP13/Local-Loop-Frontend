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
        <Container>
            <Row className="justify-content-md-center">
                <Col md={8}>
                    <h1>Welcome to the Local Loop Application</h1>
                    <p>Lend stuff etc</p>
                    <Button variant="primary" as={Link} to="/add-item" className="mb-3">
                        Add New Item
                    </Button>
                    {/* Dynamic item list */}
                    <div className="item-list">
                        <h2>Current Items</h2>
                        <ListItem />
                    </div>
                </Col>
            </Row>
        </Container>
    );
} 