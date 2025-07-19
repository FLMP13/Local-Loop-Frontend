import React, { useState, useEffect, useContext } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { CheckCircle } from 'react-bootstrap-icons';

// Renewal notification component
export default function RenewalNotification() {
  const { token, user } = useContext(AuthContext);
  const [notification, setNotification] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (token && user) {
      // Small delay to ensure page is loaded before showing notification
      setTimeout(() => {
        checkForRenewalNotifications();
      }, 1000);
    }
  }, [token, user]);

  // Check for renewal notifications from the server
  const checkForRenewalNotifications = async () => {
    try {
      const response = await axios.get('/api/subscriptions/me/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.hasNotification) {
        setNotification(response.data.notification);
        setShow(true);
      }
    } catch (error) {
      console.error('Error checking renewal notifications:', error);
      // Silently fail - notifications are not critical
    }
  };

  if (!notification) {
    return null;
  }

  return (
    <ToastContainer 
      position="top-end" 
      className="p-3"
      style={{ zIndex: 9999 }}
    >
      <Toast 
        show={show} 
        onClose={() => setShow(false)} 
        delay={10000}
        autohide
        bg="success"
        className="text-white"
      >
        <Toast.Header className="bg-success text-white">
          <i className="bi bi-check-circle-fill me-2"></i>
          <strong className="me-auto"><CheckCircle className="me-1" />Auto-Renewal Success</strong>
        </Toast.Header>
        <Toast.Body>
          <div className="mb-2">
            <strong>Great news!</strong> {notification.message}
          </div>
          <small className="text-light">
            Your {notification.plan} subscription continues until {new Date(notification.newEndDate).toLocaleDateString()}.
          </small>
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
}
