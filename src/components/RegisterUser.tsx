import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { completeRegistration } from '../services/authService';

function RegisterUser() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
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
    try {
      if (!token) {
        toast.error('Invalid registration link.');
        return;
      }
      const result = await completeRegistration(token, { username, password });
      console.log('User registered successfully:', result);
      toast.success('User registered successfully.');
      navigate('/'); // Redirect to home page
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to register agency. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <Container maxWidth="sm" className="d-flex flex-column align-items-center mt-5">
      <Typography variant="h4" component="h1" gutterBottom>
        Register
      </Typography>
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
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

export default RegisterUser; 