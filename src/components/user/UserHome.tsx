import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../../services/authService';

function UserHome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 text-center">
      <div>
        <h1>User Dashboard</h1>
        <nav>
          <div className="mt-4">
            <Link to="/user/manual-operations" className="btn btn-primary m-2">Manual Operations</Link>
            <Link to="/user/jobs" className="btn btn-primary m-2">Jobs</Link>
            <Link to="/user/executions" className="btn btn-primary m-2">Executions</Link>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default UserHome; 