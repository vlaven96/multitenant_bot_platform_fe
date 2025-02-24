import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminHome from './components/admin/AdminHome';
import UserHome from './components/user/UserHome';
import Home from './components/Home';
import Users from './components/admin/Users';
import Proxies from './components/admin/Proxies';
import Accounts from './components/admin/Accounts';
import ManualOperations from './components/user/ManualOperations';
import Jobs from './components/admin/jobs/Jobs';
import Executions from './components/user/Executions';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Models from './components/admin/Models';
import Chatbots from './components/admin/Chatbots';
import EditSnapchatAccount from './components/admin/EditSnapchatAccount';
import ExecutionDetails from './components/user/ExecutionDetails';
import SnapchatAccountDetails from './components/user/SnapchatAccountDetails';
import Workflows from './components/admin/workflow/Workflows';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Statistics from './components/admin/Statistics';

function App() {
  const isAdmin = JSON.parse(localStorage.getItem('is_admin') || 'false');
  const isAuthenticated = !!localStorage.getItem('access_token');

  return (
    <Router>
      {isAuthenticated && <Header isAdmin={isAdmin} />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<PrivateRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin}><AdminHome /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin}><Users /></PrivateRoute>} />
        <Route path="/admin/proxies" element={<PrivateRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin}><Proxies /></PrivateRoute>} />
        <Route path="/admin/accounts" element={<PrivateRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin}><Accounts /></PrivateRoute>} />
        <Route path="/admin/accounts/edit/:id" element={<EditSnapchatAccount />} />
        <Route path="/admin/models" element={<PrivateRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin}><Models /></PrivateRoute>} />
        <Route path="/admin/chatbots" element={<PrivateRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin}><Chatbots /></PrivateRoute>} />
        <Route path="/admin/jobs" element={<PrivateRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin}><Jobs /></PrivateRoute>} />
        <Route path="/admin/workflows" element={<PrivateRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin}><Workflows /></PrivateRoute>} />
        <Route path="/admin/statistics" element={<PrivateRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin}><Statistics /></PrivateRoute>} />
        <Route path="/user" element={<PrivateRoute isAuthenticated={isAuthenticated}><UserHome /></PrivateRoute>} />
        <Route path="/user/manual-operations" element={<PrivateRoute isAuthenticated={isAuthenticated}><ManualOperations /></PrivateRoute>} />
        <Route path="/user/jobs" element={<PrivateRoute isAuthenticated={isAuthenticated}><Jobs /></PrivateRoute>} />
        <Route path="/user/executions" element={<PrivateRoute isAuthenticated={isAuthenticated}><Executions /></PrivateRoute>} />
        <Route path="/user/executions/:id" element={<PrivateRoute isAuthenticated={isAuthenticated}><ExecutionDetails /></PrivateRoute>} />
        <Route path="/snapchat-account/:accountId" element={<PrivateRoute isAuthenticated={isAuthenticated}><SnapchatAccountDetails /></PrivateRoute>} />
        <Route path="/" element={isAuthenticated ? (isAdmin ? <AdminHome /> : <UserHome />) : <Home />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
