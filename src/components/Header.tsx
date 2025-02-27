import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { logout } from '../services/authService';

interface HeaderProps {
  isAdmin: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAdmin }) => {
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
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to={`/agency/${agencyId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            Dashboard
          </Link>
        </Typography>
        <div>
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
            <MenuItem onClick={handleClose}>
              <Link to={`/agency/${agencyId}/jobs`} style={{ textDecoration: 'none', color: 'inherit' }}>Jobs</Link>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Link to={`/agency/${agencyId}/workflows`} style={{ textDecoration: 'none', color: 'inherit' }}>Workflows</Link>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Link to={`/agency/${agencyId}/manual-operations`} style={{ textDecoration: 'none', color: 'inherit' }}>Manual Operations</Link>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Link to={`/agency/${agencyId}/executions`} style={{ textDecoration: 'none', color: 'inherit' }}>Executions</Link>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Link to={`/agency/${agencyId}/admin/users`} style={{ textDecoration: 'none', color: 'inherit' }}>Manage Users</Link>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Link to={`/agency/${agencyId}/proxies`} style={{ textDecoration: 'none', color: 'inherit' }}>Manage Proxies</Link>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Link to={`/agency/${agencyId}/accounts`} style={{ textDecoration: 'none', color: 'inherit' }}>Manage Accounts</Link>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Link to={`/agency/${agencyId}/models`} style={{ textDecoration: 'none', color: 'inherit' }}>Manage Models</Link>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Link to={`/agency/${agencyId}/chatbots`} style={{ textDecoration: 'none', color: 'inherit' }}>Manage Chatbots</Link>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Link to={`/agency/${agencyId}/statistics`} style={{ textDecoration: 'none', color: 'inherit' }}>Statistics</Link>
            </MenuItem>
          </Menu>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 