import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export function usePremium() {
  const { token, user, updateUser } = useContext(AuthContext);
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPremiumStatus = async () => {
    if (!token) {
      setPremiumStatus(null);
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch premium status
      const premiumResponse = await axios.get('/api/users/me/premium', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPremiumStatus(premiumResponse.data);

      // Fetch subscription details
      try {
        const subscriptionResponse = await axios.get('/api/subscriptions/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSubscription(subscriptionResponse.data.hasSubscription ? subscriptionResponse.data.subscription : null);
      } catch (subError) {
        // Subscription endpoint might not exist for non-premium users
        setSubscription(null);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching premium status:', err);
      setError('Failed to fetch premium status');
      setPremiumStatus(null);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const upgradeToPremium = async (plan) => {
    try {
      const response = await axios.post('/api/users/me/premium/upgrade', { plan }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh premium status after upgrade
      await fetchPremiumStatus();
      
      // Update user in AuthContext with premium status
      if (updateUser && response.data.user) {
        updateUser(response.data.user);
      } else if (updateUser) {
        updateUser({ premiumStatus: 'active' });
      }
      
      return response.data;
    } catch (err) {
      console.error('Error upgrading to premium:', err);
      throw new Error('Failed to upgrade to premium');
    }
  };

  const cancelPremium = async (reason = '') => {
    try {
      const response = await axios.post('/api/subscriptions/me/cancel', { reason }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh premium status after cancellation
      await fetchPremiumStatus();
      
      // Update user in AuthContext with premium status
      if (updateUser && response.data.user) {
        updateUser(response.data.user);
      } else if (updateUser) {
        updateUser({ premiumStatus: 'cancelled' });
      }
      
      return response.data;
    } catch (err) {
      console.error('Error cancelling premium:', err);
      throw new Error('Failed to cancel premium');
    }
  };

  useEffect(() => {
    fetchPremiumStatus();
  }, [token, user]);

  return {
    premiumStatus,
    subscription,
    loading,
    error,
    isPremium: premiumStatus?.isPremium || false,
    maxListings: premiumStatus?.maxListings || 3,
    discountRate: premiumStatus?.discountRate || 0,
    upgradeToPremium,
    cancelPremium,
    refreshStatus: fetchPremiumStatus
  };
}
