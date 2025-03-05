import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ExecutionDetails.css';
import { fetchExecutionDetails } from '../../services/executionService';

// Keep Bootstrap for your table classes
import 'bootstrap/dist/css/bootstrap.min.css';

// MUI imports for layout & styling
import { Box, Typography, Button } from '@mui/material';

interface AccountExecution {
  id: number;
  type: string;
  snap_account_id: number;
  status: string;
  result?: Record<string, any> | null;
  message?: string | null;
  snapchat_account_username: string;
  start_time: string;
  end_time?: string | null;
}

interface Execution {
  id: number;
  type: string;
  start_time: string;
  end_time: string;
  triggered_by: string;
  configuration: {
    batch_delay: number;
    batches: number;
    starting_delay: number;
    requests: number;
    max_quick_add_pages: number;
    users_sent_in_request: number;
    argo_tokens: boolean;
  };
  status: string;
  account_executions: AccountExecution[];
}

interface AccountExecutionResult {
  added_users?: string[];
  quick_add_pages_requested?: number;
  total_sent_requests?: number;
  rejected_count?: number;
  conversations?: any;
  latest_events?: string[];
}

const ExecutionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { agencyId } = useParams<{ agencyId: string }>();
  const navigate = useNavigate();

  const [execution, setExecution] = useState<Execution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExecutionDetails = async () => {
      try {
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const data = await fetchExecutionDetails(agencyId, id!);
        setExecution(data);
      } catch (error) {
        toast.error('Failed to fetch execution details');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExecutionDetails();
  }, [agencyId, id]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'FAILURE':
        return 'status-failure'; // defined in your .css for red styling
      case 'DONE':
        return 'status-success'; // green
      default:
        return 'status-pending'; // yellow or pending
    }
  };

  if (loading) {
    return <Box p={2}>Loading...</Box>;
  }

  if (!execution) {
    return <Box p={2}>Execution not found</Box>;
  }

  return (
    <Box className="execution-details-container" sx={{ p: 2 }}>
      <Box
        className="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2
        }}
      >
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate(`/agency/${agencyId}/executions`)}
        >
          Back to Executions
        </Button>
        <Typography variant="h5">
          Execution Details #{execution.id}
        </Typography>
      </Box>

      <Box className="main-execution-details" sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Main Execution
        </Typography>
        <Box className="details-grid" sx={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: 2 }}>
          <Box className="detail-item">
            <span className="label">Type:</span>
            <span className="value">{execution.type}</span>
          </Box>
          <Box className="detail-item">
            <span className="label">Status:</span>
            <span className={`value ${getStatusClass(execution.status)}`}>
              {execution.status}
            </span>
          </Box>
          <Box className="detail-item">
            <span className="label">Start Time:</span>
            <span className="value">{new Date(execution.start_time).toLocaleString()}</span>
          </Box>
          <Box className="detail-item">
            <span className="label">End Time:</span>
            <span className="value">{new Date(execution.end_time).toLocaleString()}</span>
          </Box>
          <Box className="detail-item">
            <span className="label">Triggered By:</span>
            <span className="value">{execution.triggered_by}</span>
          </Box>
          {/* If you want to show configuration:
          <Box className="detail-item">
            <span className="label">Configuration:</span>
            <pre className="value parameters">
              {JSON.stringify(execution.configuration, null, 2)}
            </pre>
          </Box>
          */}
        </Box>
      </Box>

      <Box className="account-executions">
        <Typography variant="h6" sx={{ mb: 2 }}>
          Account Executions
        </Typography>
        <Box className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Status</th>
                <th>Start Time</th>
                <th>End Time</th>
                {execution.type === 'QUICK_ADDS' && (
                  <>
                    <th>Total Sent Requests</th>
                    <th>Rejected Count</th>
                    <th>Quick Add Pages Requested</th>
                    <th>Added Users</th>
                  </>
                )}
                {execution.type === 'CHECK_CONVERSATIONS' && (
                  <>
                    <th>Conversations</th>
                    <th>Latest Events</th>
                  </>
                )}
                {execution.type === 'GENERATE_LEADS' && (
                  <>
                    <th>Generated Leads</th>
                    <th>Quick Add Pages Requested</th>
                    <th>Added Users</th>
                  </>
                )}
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {execution.account_executions.map((accountExec) => (
                <tr key={accountExec.id}>
                  <td>
                    <span
                      className="clickable-cell"
                      onClick={() =>
                        window.open(`/snapchat-account/${accountExec.snap_account_id}`, '_blank')
                      }
                    >
                      {accountExec.snapchat_account_username || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusClass(accountExec.status)}>
                      {accountExec.status || 'N/A'}
                    </span>
                  </td>
                  <td>{new Date(accountExec.start_time).toLocaleString()}</td>
                  <td>
                    {accountExec.end_time
                      ? new Date(accountExec.end_time).toLocaleString()
                      : '-'}
                  </td>
                  {execution.type === 'QUICK_ADDS' && (
                    <>
                      <td>
                        {accountExec.result
                          ? accountExec.result.total_sent_requests ?? 'N/A'
                          : 'N/A'}
                      </td>
                      <td>
                        {accountExec.result
                          ? accountExec.result.rejected_count ?? 'N/A'
                          : 'N/A'}
                      </td>
                      <td>
                        {accountExec.result
                          ? accountExec.result.quick_add_pages_requested ?? 'N/A'
                          : 'N/A'}
                      </td>
                      <td>
                        {accountExec.result &&
                        typeof accountExec.result === 'object' &&
                        'added_users' in accountExec.result &&
                        Array.isArray(accountExec.result.added_users) &&
                        accountExec.result.added_users.length > 0 ? (
                          accountExec.result.added_users.map(
                            (username: string, index: number) => (
                              <React.Fragment key={index}>
                                <a
                                  href={`https://www.snapchat.com/add/${username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="clickable-cell"
                                >
                                  {username}
                                </a>
                                {index < accountExec.result.added_users.length - 1 ? ', ' : ''}
                              </React.Fragment>
                            )
                          )
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </>
                  )}
                  {execution.type === 'CHECK_CONVERSATIONS' && (
                    <>
                      <td>
                        {accountExec.result
                          ? accountExec.result.conversations ?? 'N/A'
                          : 'N/A'}
                      </td>
                      <td>
                        {accountExec.result &&
                        accountExec.result.latest_events &&
                        accountExec.result.latest_events.length > 0 ? (
                          <span className="badge bg-secondary me-1">
                            {accountExec.result.latest_events[0]}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </>
                  )}
                  {execution.type === 'GENERATE_LEADS' && (
                    <>
                      <td>
                        {accountExec.result
                          ? accountExec.result.generated_leads ?? 'N/A'
                          : 'N/A'}
                      </td>
                      <td>
                        {accountExec.result
                          ? accountExec.result.quick_add_pages_requested ?? 'N/A'
                          : 'N/A'}
                      </td>
                      <td>
                        {accountExec.result &&
                        typeof accountExec.result === 'object' &&
                        'added_users' in accountExec.result &&
                        Array.isArray(accountExec.result.added_users) &&
                        accountExec.result.added_users.length > 0 ? (
                          accountExec.result.added_users.map((username: string, index: number) => (
                            <React.Fragment key={index}>
                              <a
                                href={`https://www.snapchat.com/add/${username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="clickable-cell"
                              >
                                {username}
                              </a>
                              {index < accountExec.result.added_users.length - 1 ? ', ' : ''}
                            </React.Fragment>
                          ))
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </>
                  )}
                  <td>{accountExec.message || 'No message available'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
      <ToastContainer />
    </Box>
  );
};

export default ExecutionDetails;
