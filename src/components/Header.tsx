import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

interface HeaderProps {
  isAdmin: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAdmin }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Home</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {isAdmin ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/jobs">Jobs</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/workflows">Workflows</Link>
                </li>
               <li className="nav-item">
                  <Link className="nav-link" to="/user/manual-operations">Manual Operations</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/user/executions">Executions</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/user">User Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/users">Manage Users</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/proxies">Manage Proxies</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/accounts">Manage Accounts</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/models">Manage Models</Link>
                </li> 
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/chatbots">Manage Chatbots</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/statistics">Statistics</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/user/manual-operations">Manual Operations</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/user/executions">Executions</Link>
                </li>
              </>
            )}
          </ul>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header; 