import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { registerAgency } from '../services/agencyService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from 'react-router-dom';

function RegisterNewAgency() {
  const [agencyName, setAgencyName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleRegister = async () => {
    if (!validatePasswords()) {
      return;
    }
    setEmailError('');
    try {
      if (!token) {
        toast.error('Invalid registration link.');
        return;
      }
      const result = await registerAgency(agencyName, username, password, token);
      console.log('Agency registered successfully:', result);
      toast.success('Agency registered successfully.');
      navigate('/');
    } catch (error: any) {
      console.error('Failed to register agency:', error);
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
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={!!emailError}
        helperText={emailError}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextField
        label="Confirm Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={!!passwordError}
        helperText={passwordError}
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

export default RegisterNewAgency; 