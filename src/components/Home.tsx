import { Link } from 'react-router-dom';
import { Container, Typography, Button, Card, CardContent, Grid } from '@mui/material';

function Home() {
  return (
    <Container className="d-flex justify-content-center align-items-center vh-100 text-center">
      <div>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Our Platform
        </Typography>
        <Typography variant="h6" component="p" gutterBottom>
          Manage your social media Snapchat accounts with ease and efficiency.
        </Typography>
        <Grid container spacing={4} justifyContent="center" className="mb-4">
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Trial
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enjoy a free trial with limited features to explore our platform.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Basic
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access essential features for managing your Snapchat accounts.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Premium
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unlock all features and get premium support for your agency.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Link to="/login">
          <Button variant="contained" color="primary" className="me-2">
            I already have an agency
          </Button>
        </Link>
        <Link to="/register-agency">
          <Button variant="contained" color="secondary">
            Register new agency
          </Button>
        </Link>
      </div>
    </Container>
  );
}

export default Home; 