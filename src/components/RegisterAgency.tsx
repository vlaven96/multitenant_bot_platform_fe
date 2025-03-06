
import React from 'react';
import { Container, Typography, Button, Box, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const RegisterAgency: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToMainMenu = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Register New Agency
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        We are not accepting new agency registrations at the moment. For inquiries, please contact{' '}
        <Link href="https://t.me/snepflow" target="_blank" rel="noopener noreferrer">
          SnepFlow
        </Link>{' '}
        on Telegram.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleGoToMainMenu}
      >
        Go to Main Menu
      </Button>
    </Container>
  );
};

export default RegisterAgency; 