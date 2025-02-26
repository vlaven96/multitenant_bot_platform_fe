import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { registerAgency } from '../services/agencyService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RegisterAgency() {
  const [agencyName, setAgencyName] = useState('');
  const [agencyEmail, setAgencyEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (!validateEmail(agencyEmail)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    try {
      const result = await registerAgency(agencyName, agencyEmail);
      console.log('Agency registered successfully:', result);
      toast.success('A confirmation email was sent to your email address.');
    } catch (error) {
      console.error('Failed to register agency:', error);
      toast.error('Failed to register agency. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm" className="d-flex flex-column align-items-center mt-5">
      <Typography variant="h4" component="h1" gutterBottom>
        Register New Agency
      </Typography>
      <TextField
        label="Agency Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={agencyName}
        onChange={(e) => setAgencyName(e.target.value)}
      />
      <TextField
        label="Agency Email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={agencyEmail}
        onChange={(e) => setAgencyEmail(e.target.value)}
        error={!!emailError}
        helperText={emailError}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleRegister}
        className="mt-3"
      >
        Register
      </Button>
    </Container>
  );
}

export default RegisterAgency; 