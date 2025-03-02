
import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

function UserHome() {
  const agencyId = localStorage.getItem('agency_id');

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        User Dashboard
      </Typography>
        {/* New Info Section */}
        <Box mb={4} sx={{ backgroundColor: '#f5f5f5', padding: 3, borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h6" gutterBottom>
          Getting Started
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Step 1: Proxies</strong> – Begin by adding proxies to the system. We recommend not using too many accounts per proxy as this can lead to account locks.
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Step 2: Accounts</strong> – Once proxies are set up, add your accounts. They will be automatically balanced across the available proxies.
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Step 3: Manual Operations</strong> – With accounts created, use Manual Operations to view all available accounts and trigger actions like sending quick adds and checking conversations.
        </Typography>
        <Typography variant="body1" gutterBottom>
          Additionally, you can use <strong>Jobs</strong> to automate executions and <strong>Workflows</strong> to automatically change account properties.
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Manage Proxies
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure and manage proxy settings.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to={`/agency/${agencyId}/proxies`}>
                Go to Proxies
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Manage Accounts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage all accounts associated with your agency.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to={`/agency/${agencyId}/accounts`}>
                Go to Accounts
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Manual Operations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trigger manual operations on accounts.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to={`/agency/${agencyId}/manual-operations`}>
                Go to Manual Operations
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Executions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View and inspect executions.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to={`/agency/${agencyId}/executions`}>
                Go to Executions
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Manage Models
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and configure models.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to={`/agency/${agencyId}/models`}>
                Go to Models
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Manage Chatbots
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure and manage chatbots.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to={`/agency/${agencyId}/chatbots`}>
                Go to Chatbots
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Jobs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and monitor jobs.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to={`/agency/${agencyId}/jobs`}>
                Go to Jobs
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Workflows
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and configure workflows.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to={`/agency/${agencyId}/workflows`}>
                Go to Workflows
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Statistics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View agency statistics.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to={`/agency/${agencyId}/statistics`}>
                Go to Statistics
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default UserHome; 