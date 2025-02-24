import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../../services/authService';

function AdminHome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 text-center">
      <div style={{ position: 'absolute', top: 10, right: 10 }}>
        {/* <button onClick={handleLogout} className="btn btn-danger">Logout</button> */}
      </div>
      <div>
        <h1>Admin Dashboard</h1>
        <p>Welcome, Admin! Here you can manage the system.</p>
        <div className="mt-4">
          <Link to="/user/manual-operations" className="btn btn-primary m-2">Manual Operations</Link>
          <Link to="/user/executions" className="btn btn-primary m-2">Executions</Link>
          <Link to="/admin/accounts" className="btn btn-primary m-2">Accounts</Link>
          <Link to="/admin/users" className="btn btn-primary m-2">Users</Link>
          <Link to="/admin/proxies" className="btn btn-primary m-2">Proxies</Link>
          <Link to="/admin/models" className="btn btn-primary m-2">Models</Link>
          <Link to="/admin/chatbots" className="btn btn-primary m-2">Chatbots</Link>
          <Link to="/admin/jobs" className="btn btn-primary m-2">Jobs</Link>
          <Link to="/admin/workflows" className="btn btn-primary m-2">Workflows</Link>
          <Link to="/user" className="btn btn-primary m-2">User Dashboard</Link>
          <Link to="/admin/statistics" className="btn btn-primary m-2">Statistics</Link>
        </div>
      </div>
    </div>
  );
}

export default AdminHome; 