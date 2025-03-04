import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Box
} from '@mui/material';

function Home() {
  return (
    <Container
      maxWidth="lg"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        py: 4,
      }}
    >
      {/* Hero Section */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Manage Your Snapchat Accounts Seamlessly
        </Typography>
        <Typography variant="h6" component="p" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
          Our platform gives you everything you need to run multiple Snapchat accounts:
          send quick adds, check conversations, edit bitmojis, gather statistics, and
          automate tasks with jobs and workflows.
        </Typography>
      </Box>

      {/* Single Subscription Info */}
      <Paper elevation={3} sx={{ p: 4, mb: 5, maxWidth: 700, width: '100%' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          One Subscription, Multiple Spots
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
          We offer a single subscription model: 
          <strong> $30 per spot / month</strong>. Each spot entitles you to keep
          <em> one active, good-standing Snapchat account</em> running with
          unlimited operations. If an account gets locked or banned, you can
          reassign its spot to another account at no extra cost.
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Simplify your workflow by only paying for the accounts you actively use.
          No confusing tiers or hidden fees. 
        </Typography>
      </Paper>

      {/* Features Grid */}
      <Grid container spacing={4} justifyContent="center" sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Quick Adds</Typography>
            <Typography variant="body2" color="text.secondary">
              Send quick adds to grow your Snapchat audience without lifting a finger.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Conversations & Bitmojis</Typography>
            <Typography variant="body2" color="text.secondary">
              Check and manage chats, plus update your bitmoji—all from a single dashboard.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Statistics & Analytics</Typography>
            <Typography variant="body2" color="text.secondary">
              Gain insights on your Snapchat usage with real-time stats and analytics.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Jobs & Workflows</Typography>
            <Typography variant="body2" color="text.secondary">
              Automate repetitive tasks by configuring workflows to run your accounts automatically.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Call to Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="primary">
            I already have an agency
          </Button>
        </Link>
        <Link to="/register-agency" style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="secondary">
            Register new agency
          </Button>
        </Link>
      </Box>
    </Container>
  );
}

export default Home;
