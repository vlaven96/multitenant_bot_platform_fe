import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const AdminHome: React.FC = () => {
  const agencyId = localStorage.getItem('agency_id');

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Manage Users
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View and manage all users in your agency.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to={`/agency/${agencyId}/admin/users`}>
                Go to Users
              </Button>
            </CardActions>
          </Card>
        </Grid>
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
};

export default AdminHome; 