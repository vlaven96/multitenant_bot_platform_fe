import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { registerAgencyOld } from '../services/agencyService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

function RegisterAgency() {
  const [agencyName, setAgencyName] = useState('');
  const [agencyEmail, setAgencyEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

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
      const result = await registerAgencyOld(agencyName, agencyEmail);
      console.log('Agency registered successfully:', result);
      toast.success('A confirmation email was sent to your email address.');
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to register agency. Please try again.';
      toast.error(errorMessage);
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