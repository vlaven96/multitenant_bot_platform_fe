import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState } from 'react';

// --- Your existing imports ---
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
import RegisterNewAgency from './components/RegisterNewAgency';
import RegisterUser from './components/RegisterUser';
import Subscription from './components/admin/Subscription';
import GlobalAdminHome from './components/global_admin/GlobalAdminHome';

// --- NEW: import the wrapper component that captures :agencyId and updates state ---
import AgencyIdCapture from './components/AgencyIdCapture';

// Create a PublicRoute component
const PublicRoute = ({ children, isAuthenticated }: { children: JSX.Element, isAuthenticated: boolean }) => {
  return isAuthenticated ? <Navigate to="/" /> : children;
};

function App() {
  // Track auth in React state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    Boolean(localStorage.getItem('access_token'))
  );
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));

  // Compute derived role flags
  const isGlobalAdmin = role === 'GLOBAL_ADMIN';
  const isAgencyAdmin = role === 'ADMIN';
  const isAdmin = isGlobalAdmin || isAgencyAdmin;

  // The "currently selected" agency in App-level state
  const [agencyIdApp, setAgencyIdApp] = useState(
    localStorage.getItem('agency_id') || ''
  );

  // This logic is used in the root route to decide where to redirect if the user is authenticated
  const agencyId = localStorage.getItem('agency_id') || '';

  return (
    <Router>
      {/*
        Always render <Header> outside <Routes>.
        Pass the current agencyIdApp and the setIsAuthenticated/setRole to handle logout, etc.
      */}
      <Header
        isAdmin={isAdmin}
        isAuthenticated={isAuthenticated}
        isGlobalAdmin={isGlobalAdmin}
        setIsAuthenticated={setIsAuthenticated}
        setRole={setRole}
        agencyIdApp={agencyIdApp}
      />

      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute isAuthenticated={isAuthenticated}>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register-agency"
          element={
            <PublicRoute isAuthenticated={isAuthenticated}>
              <RegisterAgency />
            </PublicRoute>
          }
        />
        {/* <Route
          path="/register-new-agency"
          element={
            <PublicRoute isAuthenticated={isAuthenticated}>
              <RegisterNewAgency />
            </PublicRoute>
          }
        /> */}
        <Route
          path="/register"
          element={
            <PublicRoute isAuthenticated={isAuthenticated}>
              <RegisterUser />
            </PublicRoute>
          }
        />

        {/* 
          For each route that includes /agency/:agencyId,
          wrap the element with <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>, 
          which updates the app-level agencyIdApp whenever the user navigates here.
        */}

        <Route
          path="agency/:agencyId/admin"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin}>
              <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>
                <AdminHome />
              </AgencyIdCapture>
            </PrivateRoute>
          }
        />
        <Route
          path="agency/:agencyId/admin/users"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin}>
              <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>
                <Users />
              </AgencyIdCapture>
            </PrivateRoute>
          }
        />
        <Route
          path="agency/:agencyId/proxies"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>
                <Proxies />
              </AgencyIdCapture>
            </PrivateRoute>
          }
        />
        <Route
          path="agency/:agencyId/accounts"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>
                <Accounts />
              </AgencyIdCapture>
            </PrivateRoute>
          }
        />
        <Route
          path="agency/:agencyId/accounts/edit/:id"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>
                <EditSnapchatAccount />
              </AgencyIdCapture>
            </PrivateRoute>
          }
        />
        <Route
          path="agency/:agencyId/models"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>
                <Models />
              </AgencyIdCapture>
            </PrivateRoute>
          }
        />
        <Route
          path="agency/:agencyId/chatbots"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>
                <Chatbots />
              </AgencyIdCapture>
            </PrivateRoute>
          }
        />
        <Route
          path="agency/:agencyId/jobs"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>
                <Jobs />
              </AgencyIdCapture>
            </PrivateRoute>
          }
        />
        <Route
          path="agency/:agencyId/workflows"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>
                <Workflows />
              </AgencyIdCapture>
            </PrivateRoute>
          }
        />
        <Route
          path="agency/:agencyId/statistics"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>
                <Statistics />
              </AgencyIdCapture>
            </PrivateRoute>
          }
        />
        <Route
          path="agency/:agencyId/user"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>
                <UserHome />
              </AgencyIdCapture>
            </PrivateRoute>
          }
        />
        <Route
          path="agency/:agencyId/manual-operations"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>
                <ManualOperations />
              </AgencyIdCapture>
            </PrivateRoute>
          }
        />
        <Route
          path="agency/:agencyId/jobs"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>
                <Jobs />
              </AgencyIdCapture>
            </PrivateRoute>
          }
        />
        <Route
          path="agency/:agencyId/executions"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>
                <Executions />
              </AgencyIdCapture>
            </PrivateRoute>
          }
        />
        <Route
          path="agency/:agencyId/executions/:id"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>
                <ExecutionDetails />
              </AgencyIdCapture>
            </PrivateRoute>
          }
        />
        <Route
          path="agency/:agencyId/snapchat-account/:accountId"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>
                <SnapchatAccountDetails />
              </AgencyIdCapture>
            </PrivateRoute>
          }
        />
        <Route
          path="agency/:agencyId/subscription"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin}>
              <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>
                <Subscription />
              </AgencyIdCapture>
            </PrivateRoute>
          }
        />

        {/* This route: if isAuthenticated, show AdminHome or UserHome based on role;
           otherwise show Home. We also wrap it with AgencyIdCapture. */}
        <Route
          path="agency/:agencyId"
          element={
            isAuthenticated ? (
              <AgencyIdCapture setAgencyIdApp={setAgencyIdApp}>
                {isAdmin ? <AdminHome /> : <UserHome />}
              </AgencyIdCapture>
            ) : (
              <Home />
            )
          }
        />

        {/* Global admin route with no :agencyId */}
        <Route
          path="agency"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} isAdmin={isGlobalAdmin}>
              <GlobalAdminHome />
            </PrivateRoute>
          }
        />

        {/* Root route */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              isGlobalAdmin ? (
                <Navigate to="/agency" />
              ) : (
                <Navigate to={`agency/${agencyId}`} />
              )
            ) : (
              <Home />
            )
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ToastContainer />
    </Router>
  );
}

export default App;
