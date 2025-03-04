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
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { logout } from '../services/authService';

interface HeaderProps {
  isAdmin: boolean;
  isAuthenticated: boolean;
  isGlobalAdmin: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setRole: React.Dispatch<React.SetStateAction<string | null>>;
  agencyIdApp: string; // The agency ID we store in App state
}

// A styled Link for consistency with MUI styles:
const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.common.white,
  fontWeight: 500,
  '&:hover': {
    color: theme.palette.grey[300],
  },
}));

const Header: React.FC<HeaderProps> = ({
  isAdmin,
  isAuthenticated,
  isGlobalAdmin,
  setIsAuthenticated,
  setRole,
  agencyIdApp,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setRole(null);
    navigate('/');
  };

  // Decide where the main brand link points:
  const dashboardLink = !isAuthenticated
    ? '/'
    : isGlobalAdmin && !agencyIdApp
    ? '/agency'
    : `/agency/${agencyIdApp}`;

  return (
    <AppBar
      position="static"
      sx={{
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        boxShadow: 3,
      }}
    >
      <Toolbar>
        {/* Brand Section (Logo + Title) */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Box
            component="img"
            // Point this to your actual logo file or a public URL:
            src="/snep_logo_round.png"
            alt="SnepFlow Logo"
            sx={{ height: 40, mr: 1 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            <StyledLink to={dashboardLink}>
              SnepFlow
            </StyledLink>
          </Typography>
        </Box>

        {/* Right Section: Menu + Logout/Login */}
        {isAuthenticated && (
          <>
            <IconButton
              size="large"
              color="inherit"
              sx={{ mr: 2 }}
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {/* Conditionally show links if agencyIdApp is set */}
              {agencyIdApp && isAdmin && (
                <MenuItem
                  component={StyledLink}
                  to={`/agency/${agencyIdApp}/subscription`}
                  onClick={handleClose}
                >
                  Subscription
                </MenuItem>
              )}
              {agencyIdApp && (
                <>
                  <MenuItem
                    component={StyledLink}
                    to={`/agency/${agencyIdApp}/jobs`}
                    onClick={handleClose}
                  >
                    Jobs
                  </MenuItem>
                  <MenuItem
                    component={StyledLink}
                    to={`/agency/${agencyIdApp}/workflows`}
                    onClick={handleClose}
                  >
                    Workflows
                  </MenuItem>
                  <MenuItem
                    component={StyledLink}
                    to={`/agency/${agencyIdApp}/manual-operations`}
                    onClick={handleClose}
                  >
                    Manual Operations
                  </MenuItem>
                  <MenuItem
                    component={StyledLink}
                    to={`/agency/${agencyIdApp}/executions`}
                    onClick={handleClose}
                  >
                    Executions
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem
                      component={StyledLink}
                      to={`/agency/${agencyIdApp}/admin/users`}
                      onClick={handleClose}
                    >
                      Manage Users
                    </MenuItem>
                  )}
                  <MenuItem
                    component={StyledLink}
                    to={`/agency/${agencyIdApp}/proxies`}
                    onClick={handleClose}
                  >
                    Manage Proxies
                  </MenuItem>
                  <MenuItem
                    component={StyledLink}
                    to={`/agency/${agencyIdApp}/accounts`}
                    onClick={handleClose}
                  >
                    Manage Accounts
                  </MenuItem>
                  <MenuItem
                    component={StyledLink}
                    to={`/agency/${agencyIdApp}/models`}
                    onClick={handleClose}
                  >
                    Manage Models
                  </MenuItem>
                  <MenuItem
                    component={StyledLink}
                    to={`/agency/${agencyIdApp}/chatbots`}
                    onClick={handleClose}
                  >
                    Manage Chatbots
                  </MenuItem>
                  <MenuItem
                    component={StyledLink}
                    to={`/agency/${agencyIdApp}/statistics`}
                    onClick={handleClose}
                  >
                    Statistics
                  </MenuItem>
                </>
              )}
            </Menu>
          </>
        )}
        <Button
          color="inherit"
          onClick={isAuthenticated ? handleLogout : () => navigate('/login')}
        >
          {isAuthenticated ? 'Logout' : 'Login'}
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
