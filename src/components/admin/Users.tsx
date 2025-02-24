import { useEffect, useState } from 'react';
import { fetchUsers, toggleUserActiveStatus } from '../../services/userService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

interface UserResponse {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
}

function Users() {
  const [filteredUsers, setFilteredUsers] = useState<UserResponse[]>([]);
  const [usernameFilter, setUsernameFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null);

  const getUsers = async (isActive?: boolean, username?: string) => {
    try {
      const data = await fetchUsers(isActive, username);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleToggleActiveStatus = async (userId: number, isActive: boolean) => {
    try {
      const response = await toggleUserActiveStatus(userId, isActive);
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
        getUsers(isActiveFilter ?? undefined, usernameFilter); // Refresh the user list
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

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    getUsers(isActiveFilter ?? undefined, usernameFilter);
  }, [isActiveFilter, usernameFilter]);

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        <div className="col d-flex flex-column">
          <ToastContainer />
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1>Users Management</h1>
          </div>
          <div className="filters mb-3">
            <input
              type="text"
              placeholder="Filter by username"
              value={usernameFilter}
              onChange={(e) => setUsernameFilter(e.target.value)}
              className="form-control mb-2"
            />
            <select
              value={isActiveFilter === null ? '' : isActiveFilter ? 'active' : 'inactive'}
              onChange={(e) => setIsActiveFilter(e.target.value === '' ? null : e.target.value === 'active')}
              className="form-control"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="content flex-grow-1 overflow-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Active</th>
                  <th>Admin</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.is_active ? 'Yes' : 'No'}</td>
                    <td>{user.is_admin ? 'Yes' : 'No'}</td>
                    <td>
                      <button
                        onClick={() => handleToggleActiveStatus(user.id, user.is_active)}
                        className={`btn ${user.is_active ? 'btn-warning' : 'btn-success'}`}
                      >
                        {user.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Users; 