import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUsers, toggleUserActiveStatus, deleteUser, inviteUser } from '../../services/userService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
}

const Users: React.FC = () => {
  const { agencyId } = useParams<{ agencyId: string }>();
  const [filteredUsers, setFilteredUsers] = useState<UserResponse[]>([]);
  const [usernameFilter, setUsernameFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const getUsers = async (username?: string) => {
    if (!agencyId) {
      console.error('Agency ID is undefined');
      return;
    }
    try {
      const data = await fetchUsers(agencyId, undefined, username);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleToggleActiveStatus = async (userId: number, isActive: boolean) => {
    if (!agencyId) {
      console.error('Agency ID is undefined');
      return;
    }
    try {
      const response = await toggleUserActiveStatus(agencyId, userId, isActive);
      if (response.status === 200) {
        toast.success(`User ${isActive ? 'disabled' : 'enabled'} successfully!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        getUsers(usernameFilter); // Refresh the user list
      }
    } catch (error) {
      toast.error('Error updating user status. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error('Error updating user status:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!agencyId) {
      console.error('Agency ID is undefined');
      return;
    }
    try {
      await deleteUser(agencyId, userId);
      toast.success('User deleted successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      getUsers(usernameFilter); // Refresh the user list
    } catch (error) {
      toast.error('Error deleting user. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error('Error deleting user:', error);
    }
  };

  const handleInviteUser = async () => {
    if (!agencyId) {
      console.error('Agency ID is undefined');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Please enter a valid email address.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    try {
      await inviteUser(agencyId, inviteEmail);
      toast.success('Invitation sent successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setOpen(false);
      setInviteEmail('');
    } catch (error: any) {
      const errorMessage = error.message || 'Error sending invitation. Please try again.';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setOpen(false);
      setInviteEmail('');
      console.error('Error sending invitation:', error);
    }
  };

  useEffect(() => {
    getUsers();
  }, [agencyId]);

  useEffect(() => {
    getUsers(usernameFilter);
  }, [usernameFilter]);

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Users Management
      </Typography>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)} style={{ marginBottom: '20px' }}>
        Invite
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Invite User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To invite a new user, please enter their email address here.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleInviteUser} color="primary">
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>
      <div className="filters mb-3">
        <TextField
          label="Filter by username"
          variant="outlined"
          value={usernameFilter}
          onChange={(e) => setUsernameFilter(e.target.value)}
          fullWidth
          margin="normal"
        />
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {user.role !== 'ADMIN' && (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Users; 