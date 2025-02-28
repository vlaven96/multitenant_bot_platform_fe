import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { logout } from '../services/authService';
import { styled } from '@mui/material/styles';

interface HeaderProps {
  isAdmin: boolean;
  isAuthenticated: boolean;
}

// A styled version of Link that inherits MUI theme colors and styles.
const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.common.white,
  fontWeight: 500,
  '&:hover': {
    color: theme.palette.grey[500],
  },
}));

const Header: React.FC<HeaderProps> = ({ isAdmin, isAuthenticated }) => {
  const navigate = useNavigate();
  const agencyId = localStorage.getItem('agency_id');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        boxShadow: 3,
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 'bold' }}
        >
          <StyledLink to={`/agency/${agencyId}`}>Dashboard</StyledLink>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isAuthenticated && (
            <>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {isAdmin && (
                  <MenuItem
                    component={StyledLink}
                    to={`/agency/${agencyId}/subscription`}
                    onClick={handleClose}
                  >
                    Subscription
                  </MenuItem>
                )}
                <MenuItem
                  component={StyledLink}
                  to={`/agency/${agencyId}/jobs`}
                  onClick={handleClose}
                >
                  Jobs
                </MenuItem>
                <MenuItem
                  component={StyledLink}
                  to={`/agency/${agencyId}/workflows`}
                  onClick={handleClose}
                >
                  Workflows
                </MenuItem>
                <MenuItem
                  component={StyledLink}
                  to={`/agency/${agencyId}/manual-operations`}
                  onClick={handleClose}
                >
                  Manual Operations
                </MenuItem>
                <MenuItem
                  component={StyledLink}
                  to={`/agency/${agencyId}/executions`}
                  onClick={handleClose}
                >
                  Executions
                </MenuItem>
                <MenuItem
                  component={StyledLink}
                  to={`/agency/${agencyId}/admin/users`}
                  onClick={handleClose}
                >
                  Manage Users
                </MenuItem>
                <MenuItem
                  component={StyledLink}
                  to={`/agency/${agencyId}/proxies`}
                  onClick={handleClose}
                >
                  Manage Proxies
                </MenuItem>
                <MenuItem
                  component={StyledLink}
                  to={`/agency/${agencyId}/accounts`}
                  onClick={handleClose}
                >
                  Manage Accounts
                </MenuItem>
                <MenuItem
                  component={StyledLink}
                  to={`/agency/${agencyId}/models`}
                  onClick={handleClose}
                >
                  Manage Models
                </MenuItem>
                <MenuItem
                  component={StyledLink}
                  to={`/agency/${agencyId}/chatbots`}
                  onClick={handleClose}
                >
                  Manage Chatbots
                </MenuItem>
                <MenuItem
                  component={StyledLink}
                  to={`/agency/${agencyId}/statistics`}
                  onClick={handleClose}
                >
                  Statistics
                </MenuItem>
              </Menu>
            </>
          )}
          <Button
            color="inherit"
            onClick={isAuthenticated ? handleLogout : () => navigate('/login')}
            sx={{ ml: 2 }}
          >
            {isAuthenticated ? 'Logout' : 'Login'}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
