import React, { useEffect, useState } from 'react';
import { fetchSubscription } from '../../services/subscriptionService';
import { Card, CardContent, Typography, CircularProgress, Link } from '@mui/material';
import './Subscription.css';
import { useParams } from 'react-router-dom';

interface Subscription {
  id: number;
  agency_id: number;
  status: string;
  renewed_at: string;
  days_available: number;
  number_of_sloths: number;
  price: string;
  turned_off_at: string;
}

const Subscription: React.FC = () => {
  const { agencyId } = useParams<{ agencyId: string }>();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const data = await fetchSubscription(agencyId);
        setSubscription(data);
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [agencyId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!subscription) {
    return <Typography variant="h6">No subscription data available.</Typography>;
  }

  const formatDateTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Card className="subscription-card">
      <CardContent>
        <Typography variant="h5" component="div" className="subscription-title">
          Subscription Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Status:</strong> {subscription.status}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Renewed On:</strong> {formatDateTime(subscription.renewed_at)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Days Remaining:</strong> {subscription.days_available} days
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Sloths Included:</strong> {subscription.number_of_sloths}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Subscription Cost:</strong> ${subscription.price}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Deactivation Date:</strong> {formatDateTime(subscription.turned_off_at)}
        </Typography>
        <Typography variant="body2" color="text.secondary" style={{ marginTop: '16px' }}>
          For renewals or modifications, please contact{' '}
          <Link href="https://t.me/snepflow" target="_blank" rel="noopener noreferrer">
            Snep
          </Link> on Telegram.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Subscription; 