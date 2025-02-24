import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 text-center">
      <div>
        <h1 className="mb-4">Welcome</h1>
        <p className="mb-4">Please choose an option:</p>
        <Link to="/login">
          <button className="btn btn-primary me-2">Login</button>
        </Link>
        <Link to="/register">
          <button className="btn btn-success">Register</button>
        </Link>
      </div>
    </div>
  );
}

export default Home; 