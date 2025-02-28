import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminHome from './components/admin/AdminHome';
import UserHome from './components/user/UserHome';
import Home from './components/Home';
import Users from './components/admin/Users';
import Proxies from './components/user/Proxies';
import Accounts from './components/user/Accounts';
import ManualOperations from './components/user/ManualOperations';
import Jobs from './components/user/jobs/Jobs';
import Executions from './components/user/Executions';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Models from './components/user/Models';
import Chatbots from './components/user/Chatbots';
import EditSnapchatAccount from './components/user/EditSnapchatAccount';
import ExecutionDetails from './components/user/ExecutionDetails';
import SnapchatAccountDetails from './components/user/SnapchatAccountDetails';
import Workflows from './components/user/workflow/Workflows';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Statistics from './components/user/Statistics';
import RegisterAgency from './components/RegisterAgency';
import RegisterUser from './components/RegisterUser';
import Subscription from './components/admin/Subscription';
function App() {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'));
  
  const role = localStorage.getItem('role');
  const isGlobalAdmin = role === 'GLOBAL_ADMIN';
  const isAgencyAdmin = role === 'ADMIN';
  const isAdmin = isGlobalAdmin || isAgencyAdmin;

  const agencyId = localStorage.getItem('agency_id');

  return (
    <Router>
      {isAuthenticated && <Header isAdmin={isAdmin} isAuthenticated = {isAuthenticated}/>}
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* <Route path="/register" element={<Register />} /> */}
        <Route path="agency/:agencyId/admin" element={<PrivateRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin}><AdminHome /></PrivateRoute>} />
        <Route path="agency/:agencyId/admin/users" element={<PrivateRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin}><Users /></PrivateRoute>} />
        <Route path="agency/:agencyId/proxies" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Proxies /></PrivateRoute>} />
        <Route path="agency/:agencyId/accounts" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Accounts /></PrivateRoute>} />
        <Route path="agency/:agencyId/accounts/edit/:id" element={<PrivateRoute isAuthenticated={isAuthenticated} ><EditSnapchatAccount /></PrivateRoute>} />
        <Route path="agency/:agencyId/models" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Models /></PrivateRoute>} />
        <Route path="agency/:agencyId/chatbots" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Chatbots /></PrivateRoute>} />
        <Route path="agency/:agencyId/jobs" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Jobs /></PrivateRoute>} />
        <Route path="agency/:agencyId/workflows" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Workflows /></PrivateRoute>} />
        <Route path="agency/:agencyId/statistics" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Statistics /></PrivateRoute>} />
        <Route path="agency/:agencyId/user" element={<PrivateRoute isAuthenticated={isAuthenticated}><UserHome /></PrivateRoute>} />
        <Route path="agency/:agencyId/manual-operations" element={<PrivateRoute isAuthenticated={isAuthenticated}><ManualOperations /></PrivateRoute>} />
        <Route path="agency/:agencyId/jobs" element={<PrivateRoute isAuthenticated={isAuthenticated}><Jobs /></PrivateRoute>} />
        <Route path="agency/:agencyId/executions" element={<PrivateRoute isAuthenticated={isAuthenticated}><Executions /></PrivateRoute>} />
        <Route path="agency/:agencyId/executions/:id" element={<PrivateRoute isAuthenticated={isAuthenticated}><ExecutionDetails /></PrivateRoute>} />
        <Route path="agency/:agencyId/snapchat-account/:accountId" element={<PrivateRoute isAuthenticated={isAuthenticated}><SnapchatAccountDetails /></PrivateRoute>} />
        <Route path="agency/:agencyId" element={isAuthenticated ? (isAdmin ? <AdminHome /> : <UserHome />) : <Home />} />
        <Route path="agency/:agencyId/subscription" element={<PrivateRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin}><Subscription /></PrivateRoute>} />
        <Route path="/" element={isAuthenticated ? <Navigate to={`agency/${agencyId}`} /> : <Home />} />
        <Route path="/register-agency" element={<RegisterAgency />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
