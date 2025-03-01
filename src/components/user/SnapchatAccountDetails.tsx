import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAccountDetails, fetchAccountStatistics, fetchAccountTimelineStatistics } from '../../services/accountsService';
import { fetchExecutionDetailsByAccount, executeOperation } from '../../services/executionService';
import { Table, Modal, ModalHeader, ModalBody, ListGroup, ListGroupItem } from 'reactstrap';
import { toast, ToastContainer } from 'react-toastify';
import grafanaLogo from '../../assets/grafana-logo.png';
import './SnapchatAccountDetails.css';
import Timeline from './Timeline';

interface AccountExecution {
  type: string;
  start_time: string;
}

interface StatusChange {
  new_status: string;
  changed_at: string;
}

interface SnapchatAccountTimelineStatistics {
  creation_date: string;
  ingestion_date: string;
  account_executions: AccountExecution[];
  status_changes: StatusChange[];
}

const SnapchatAccountDetails: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const { agencyId } = useParams<{ agencyId: string }>();
  const [account, setAccount] = useState<any>(null);
  const [executions, setExecutions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalContent, setModalContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [limit] = useState(5);
  const [operationType, setOperationType] = useState('');
  const [startingDelay, setStartingDelay] = useState<number | string>(30);
  const [requests, setRequests] = useState<number | string>(20);
  const [batches, setBatches] = useState<number | string>(1);
  const [batchDelay, setBatchDelay] = useState<number | string>(10);
  const [quickAddPages, setQuickAddPages] = useState<number | string>(10);
  const [username, setUsername] = useState('');
  const [usersSentInRequest, setUsersSentInRequest] = useState<number | string>(1);
  const [argoTokens, setArgoTokens] = useState<boolean>(true);
  const [executionType, setExecutionType] = useState('');
  const [statistics, setStatistics] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [timelineStats, setTimelineStats] = useState<SnapchatAccountTimelineStatistics | null>(null);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  useEffect(() => {
    const loadAccountDetails = async () => {
      if (!accountId) return;
      try {
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const accountData = await fetchAccountDetails(agencyId, accountId);
        setAccount(accountData);
      } catch (error) {
        console.error('Failed to load account details:', error);
      }
    };

    const loadExecutionDetails = async () => {
      if (!accountId) return;
      try {
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const offset = (currentPage - 1) * limit;
        const data = await fetchExecutionDetailsByAccount(agencyId, accountId, limit, offset, executionType);
        setExecutions(data);
      } catch (error) {
        console.error('Failed to load execution details:', error);
      }
    };

    const loadStatistics = async () => {
      if (!accountId) return;
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      try {
        setLoadingStats(true);
        const stats = await fetchAccountStatistics(agencyId, accountId);
        setStatistics(stats);
      } catch (error) {
        console.error('Failed to load account statistics:', error);
        toast.error('Failed to load account statistics');
      } finally {
        setLoadingStats(false);
      }
    };

    const loadTimelineStatistics = async () => {
      if (!accountId) return;
      setLoadingTimeline(true);
      try {
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const data = await fetchAccountTimelineStatistics(agencyId, accountId);
        setTimelineStats(data);
      } catch (error) {
        console.error('Error loading timeline statistics:', error);
      } finally {
        setLoadingTimeline(false);
      }
    };

    loadAccountDetails();
    loadExecutionDetails();
    loadStatistics();
    loadTimelineStatistics();
  }, [accountId, currentPage, executionType]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleJsonClick = (jsonData: any) => {
    setModalContent(JSON.stringify(jsonData, null, 2));
    toggleModal();
  };

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'RECENTLY_INGESTED':
        return 'status-blue';
      case 'GOOD_STANDING':
        return 'status-green';
      case 'TERMINATED':
        return 'status-red';
      default:
        return 'status-yellow';
    }
  };

  const getStatusAccountExecutionClass = (status: string | undefined) => {
    switch (status) {
      case 'DONE':
        return 'status-green';
      case 'FAILURE':
        return 'status-red';
      default:
        return 'status-yellow';
    }
  };
  

  const handleOperationSubmit = async () => {
    if (!accountId) return;

    // Show immediate toast and reset operation type
    toast.info('Operation triggered.', {
      position: "top-right",
      autoClose: 3000,
      className: "toast-info"
    });
    setOperationType(''); // Reset the operation type to 'Select Operation'

    try {
      let params: {
        userIds: number[];
        operationType: string;
        startingDelay?: number;
        requests?: number;
        batches?: number;
        batchDelay?: number;
        usersSentInRequest?: number;
        argoTokens?: boolean;
        quickAddPages?: number;
        username?: string;
      } = {
        userIds: [parseInt(accountId)],
        operationType,
      };

      if (operationType === 'consume_leads') {
        params = {
          ...params,
          startingDelay: Number(startingDelay),
          requests: Number(requests),
          batches: Number(batches),
          batchDelay: Number(batchDelay),
          usersSentInRequest: Number(usersSentInRequest),
          argoTokens: argoTokens,
        };
      } else if (operationType === 'quick_adds') {
        params = {
          ...params,
          requests: Number(requests),
          batches: Number(batches),
          batchDelay: Number(batchDelay),
          quickAddPages: Number(quickAddPages),
          usersSentInRequest: Number(usersSentInRequest),
          argoTokens: argoTokens,
        };
      } else if (operationType === 'send_to_user') {
        params = {
          ...params,
          username: username,
        };
      }

      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      const result = await executeOperation(agencyId, params);
      console.log('Execution result:', result);
      toast.success('Operation executed successfully.', {
        position: "top-right",
        autoClose: 3000,
        className: "toast-success"
      });
    } catch (error) {
      toast.error('Failed to execute operation. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        className: "toast-error"
      });
    }
  };

  const isSubmitDisabled = () => {
    if (!accountId) return true;
    if (operationType === 'quick_adds') {
      return (
        requests === '' ||
        batches === '' ||
        batchDelay === '' ||
        Number(requests) < 1 ||
        Number(batches) < 1 ||
        Number(quickAddPages) < 1
      );
    }
    if (operationType === 'consume_leads') {
      return (
        startingDelay === '' ||
        requests === '' ||
        batches === '' ||
        batchDelay === '' ||
        Number(requests) < 1 ||
        Number(batches) < 1
      );
    }
    if (operationType === 'check_conversations') {
      return false;
    }
    if (operationType === 'compute_statistics') {
      return false;
    }
    if (operationType === 'send_to_user') {
      return username.trim() === '';
    }
    return true;
  };

  return (
    <div className="snapchat-account-details">
      {account && (
        <div className="account-info">
          <div className="header-with-button">
            <h2>Account Details</h2>
            <a
              href={`https://dpabotplatform.grafana.net/d/be82z10zjehoge/dpa-platform-by-account?orgId=1&from=now-6h&to=now&timezone=browser&var-user_account=${account.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="grafana-button"
              title="View in Grafana"
            >
              <img
                src={grafanaLogo}
                alt="Grafana"       
                className="grafana-logo"
              />
            </a>
          </div>

          <div className="account-details-lists">
            <div>
              <ListGroup>
                <ListGroupItem>Username: {account.username}</ListGroupItem>
                <ListGroupItem>
                  Snapchat Link: {account.snapchat_link ? (
                    <a href={account.snapchat_link} target="_blank" rel="noopener noreferrer">
                      {account.snapchat_link}
                    </a>
                  ) : 'Not Available'}
                </ListGroupItem>
                <ListGroupItem>Password: {account.password}</ListGroupItem>
                <ListGroupItem>2FA Secret: {account.two_fa_secret}</ListGroupItem>
                <ListGroupItem>Creation Date: {account.creation_date}</ListGroupItem>
                <ListGroupItem>Added to System Date: {account.added_to_system_date}</ListGroupItem>
                <ListGroupItem>Proxy: {account.proxy ? (
                  <span 
                    onClick={() => handleJsonClick(account.proxy)} 
                    style={{ 
                      color: '#007bff', 
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    View Details
                  </span>
                ) : 'Not Available'}</ListGroupItem>
                {account.workflow?.name && (
                  <ListGroupItem>Workflow: {account.workflow.name}</ListGroupItem>
                )}
              </ListGroup>
            </div>

            <div>
              <ListGroup>
                <ListGroupItem>Device Model: {account.device ? <span onClick={() => handleJsonClick(account.device)}>View Details</span> : 'Not Available'}</ListGroupItem>
                <ListGroupItem>Cookies: {account.cookies ? <span onClick={() => handleJsonClick(account.cookies)}>View Details</span> : 'Not Available'}</ListGroupItem>
                <ListGroupItem>Model: {account.model?.name}</ListGroupItem>
                <ListGroupItem>ChatBot: {account.chat_bot?.type}</ListGroupItem>
                <ListGroupItem>Status: <span className={getStatusClass(account.status)}>{account.status || 'Unknown'}</span></ListGroupItem>
                <ListGroupItem>Tags: {account.tags?.join(', ')}</ListGroupItem>
                <ListGroupItem>Source: {account.account_source}</ListGroupItem>
              </ListGroup>
            </div>
          </div>
        </div>
      )}

      <div className="operation-select mb-3">
        <h3>Trigger Operation</h3>
        <select
          value={operationType}
          onChange={(e) => setOperationType(e.target.value)}
          className="form-control mb-2"
        >
          <option value="">Select Operation</option>
          <option value="quick_adds">QuickAdds</option>
          {/* <option value="consume_leads">Consume Leads</option> */}
          <option value="send_to_user">Send to User</option>
          <option value="check_conversations">Check Conversations</option>
          <option value="compute_statistics">Compute Statistics</option>
        </select>
        {operationType === 'quick_adds' && (
          <div className="quick-adds-container">
            <div className="mb-2 flex-item">
              <label>Number of Quick Adds to Send:</label>
              <input
                type="number"
                value={requests}
                onChange={(e) => setRequests(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                placeholder="Number of requests"
                className="form-control"
                min="1"
              />
            </div>
            {/* <div className="mb-2 flex-item">
              <label>Number of Batches:</label>
              <input
                type="number"
                value={batches}
                onChange={(e) => setBatches(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                placeholder="Number of batches"
                className="form-control"
                min="1"
              />
            </div> */}
            {/* <div className="mb-2 flex-item">
              <label>Batch Delay (seconds):</label>
              <input
                type="number"
                value={batchDelay}
                onChange={(e) => setBatchDelay(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                placeholder="Batch delay"
                className="form-control"
                min="0"
              />
            </div> */}
            {/* <div className="mb-2 flex-item">
              <label>Max Quick Add Pages:</label>
              <input
                type="number"
                value={quickAddPages}
                onChange={(e) => setQuickAddPages(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                placeholder="Max Quick Add Pages"
                className="form-control"
                min="0"
              />
            </div> */}
            {/* <div className="mb-2 flex-item">
              <label>Users Sent in Request:</label>
              <input
                type="number"
                value={usersSentInRequest}
                onChange={(e) => setUsersSentInRequest(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                placeholder="Users Sent in Request"
                className="form-control"
                min="0"
              />
            </div> */}
            {/* <div className="mb-2 flex-item">
              <label>Use Argo Tokens:</label>
              <input
                type="checkbox"
                checked={argoTokens}
                onChange={(e) => setArgoTokens(e.target.checked)}
                className="form-check-input"
              />
            </div> */}
          </div>
        )}
        {operationType === 'consume_leads' && (
          <div className="consume-leads-container">
            <div className="mb-2 flex-item">
              <label>Starting Delay (seconds):</label>
              <input
                type="number"
                value={startingDelay}
                onChange={(e) => setStartingDelay(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                placeholder="Starting delay"
                className="form-control"
                min="0"
              />
            </div>
            <div className="mb-2 flex-item">
              <label>How many accounts should receive add request:</label>
              <input
                type="number"
                value={requests}
                onChange={(e) => setRequests(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                placeholder="Number of requests"
                className="form-control"
                min="1"
              />
            </div>
            <div className="mb-2 flex-item">
              <label>Number of Batches:</label>
              <input
                type="number"
                value={batches}
                onChange={(e) => setBatches(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                placeholder="Number of batches"
                className="form-control"
                min="1"
              />
            </div>
            <div className="mb-2 flex-item">
              <label>Batch Delay (seconds):</label>
              <input
                type="number"
                value={batchDelay}
                onChange={(e) => setBatchDelay(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                placeholder="Batch delay"
                className="form-control"
                min="0"
              />
            </div>
            <div className="mb-2 flex-item">
              <label>Users Sent in Request:</label>
              <input
                type="number"
                value={usersSentInRequest}
                onChange={(e) => setUsersSentInRequest(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                placeholder="Users Sent in Request"
                className="form-control"
                min="0"
              />
            </div>
            <div className="mb-2 flex-item">
              <label>Use Argo Tokens:</label>
              <input
                type="checkbox"
                checked={argoTokens}
                onChange={(e) => setArgoTokens(e.target.checked)}
                className="form-check-input"
              />
            </div>
          </div>
        )}
        {operationType === 'send_to_user' && (
          <>
            <div className="mb-2 flex-item">
              <label>Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="form-control"
              />
            </div>
          </>
        )}
        <button
          onClick={handleOperationSubmit}
          className="btn btn-primary"
          disabled={isSubmitDisabled()}
        >
          Submit
        </button>
      </div>

      <div className="account-statistics mb-4">
        <h2>Account Statistics</h2>
        {loadingStats ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading statistics...</span>
            </div>
          </div>
        ) : statistics ? (
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Platform Statistics</h5>
                  <div className="stats-list">
                    <div className="stat-item">
                      <span className="label">Quick Adds Sent:</span>
                      <span className="value">{statistics.quick_ads_sent}</span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Total Conversations:</span>
                      <span className="value">
                        {statistics.total_conversations}
                        {statistics.quick_ads_sent > 0 && (
                          <small className="text-muted ms-1">
                            ({((statistics.total_conversations / statistics.quick_ads_sent) * 100).toFixed(1)}% of quick adds)
                          </small>
                        )}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Total Executions:</span>
                      <span className="value">{statistics.total_executions}</span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Successful Executions:</span>
                      <span className="value">
                        {statistics.successful_executions}
                        {statistics.total_executions > 0 && (
                          <small className="text-muted ms-1">
                            ({((statistics.successful_executions / statistics.total_executions) * 100).toFixed(1)}% success rate)
                          </small>
                        )}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Rejected Users:</span>
                      <span className="value">
                        {statistics.rejected_total}
                        {statistics.quick_ads_sent + statistics.rejected_total > 0 && (
                          <small className="text-muted ms-1">
                            ({((statistics.rejected_total / (statistics.quick_ads_sent + statistics.rejected_total)) * 100).toFixed(1)}% from {(statistics.quick_ads_sent + statistics.rejected_total)} checks)
                          </small>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Chatbot Statistics</h5>
                  <div className="stats-list">
                    <div className="stat-item">
                      <span className="label">Chatbot Conversations:</span>
                      <span className="value">
                        {statistics.chatbot_conversations}
                        {statistics.total_conversations > 0 && (
                          <small className="text-muted ms-1">
                            ({((statistics.chatbot_conversations / statistics.total_conversations) * 100).toFixed(1)}% of total)
                          </small>
                        )}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Charged Conversations:</span>
                      <span className="value">
                        {statistics.conversations_charged}
                        {statistics.chatbot_conversations > 0 && (
                          <small className="text-muted ms-1">
                            ({((statistics.conversations_charged / statistics.chatbot_conversations) * 100).toFixed(1)}% of chatbot)
                          </small>
                        )}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="label">CTA Conversations:</span>
                      <span className="value">
                        {statistics.cta_conversations}
                        {statistics.conversations_charged > 0 && (
                          <small className="text-muted ms-1">
                            ({((statistics.cta_conversations / statistics.conversations_charged) * 100).toFixed(1)}% of charged)
                          </small>
                        )}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Shared Links:</span>
                      <span className="value">
                        {statistics.cta_shared_links}
                        {statistics.cta_conversations > 0 && (
                          <small className="text-muted ms-1">
                            ({((statistics.cta_shared_links / statistics.cta_conversations) * 100).toFixed(1)}% of CTA conv.)
                          </small>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Conversions</h5>
                  <div className="stats-list">
                    <div className="stat-item">
                      <span className="label">Total Conversions:</span>
                      <span className="value">{statistics.total_conversions}</span>
                    </div>
                    <div className="stat-item">
                      <span className="label">From Quick Adds:</span>
                      <span className="value">
                        {statistics.quick_ads_sent > 0 
                          ? `${((statistics.total_conversions / statistics.quick_ads_sent) * 100).toFixed(1)}%`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="label">From Total Conversations:</span>
                      <span className="value">
                        {statistics.total_conversations > 0 
                          ? `${((statistics.total_conversions / statistics.total_conversations) * 100).toFixed(1)}%`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="label">From Chatbot Conversations:</span>
                      <span className="value">
                        {statistics.chatbot_conversations > 0 
                          ? `${((statistics.total_conversions / statistics.chatbot_conversations) * 100).toFixed(1)}%`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="label">From Charged Conversations:</span>
                      <span className="value">
                        {statistics.conversations_charged > 0 
                          ? `${((statistics.total_conversions / statistics.conversations_charged) * 100).toFixed(1)}%`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="label">From CTA Conversations:</span>
                      <span className="value">
                        {statistics.cta_conversations > 0 
                          ? `${((statistics.total_conversions / statistics.cta_conversations) * 100).toFixed(1)}%`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="label">From Shared Links:</span>
                      <span className="value">
                        {statistics.cta_shared_links > 0 
                          ? `${((statistics.total_conversions / statistics.cta_shared_links) * 100).toFixed(1)}%`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="alert alert-info">No statistics available.</div>
        )}
      </div>

      <div className="mt-4 mb-4">
        <h3 className="mb-3">Account Timeline</h3>
        {loadingTimeline ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading timeline...</span>
            </div>
          </div>
        ) : timelineStats ? (
          <Timeline timelineStats={timelineStats} />
        ) : (
          <div className="alert alert-info">No timeline data available.</div>
        )}
      </div>

      <div className="execution-details">
        <h2>Execution Details</h2>
        <select
          className="form-select mb-2"
          value={executionType}
          onChange={(e) => setExecutionType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="QUICK_ADDS">QUICK_ADDS</option>
          <option value="SEND_TO_USER">SEND_TO_USER</option>
          <option value="CHECK_CONVERSATIONS">CHECK_CONVERSATIONS</option>
          <option value="COMPUTE_STATISTICS">COMPUTE_STATISTICS</option>
        </select>
        <Table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Time</th>
              <th>Triggered By</th>
              <th>Status</th>
              <th>Configuration</th>
              <th style={{ minWidth: '500px' }}>Account Executions</th>
            </tr>
          </thead>
          <tbody>
            {executions && executions.map((execution) => (
              <tr key={execution.id}>
                <td>{execution.id}</td>
                <td>{execution.type}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>
                      <small style={{ color: '#666' }}>Start:</small><br />
                      {new Date(execution.start_time).toLocaleString()}
                    </div>
                    <div>
                      <small style={{ color: '#666' }}>End:</small><br />
                      {execution.end_time ? new Date(execution.end_time).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </td>
                <td>{execution.triggered_by}</td>
                <td><span className={getStatusAccountExecutionClass(execution.status)}>{execution.status}</span></td>
                <td>
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '100%' }}>
                    {JSON.stringify(execution.configuration, null, 2)}
                  </pre>
                </td>
                <td>
                  {execution.account_executions.map((accExec: any) => (
                    <div key={accExec.id} style={{ marginBottom: '10px', minWidth: '500px', maxWidth: '800px', overflowX: 'auto' }}>
                      <strong>ID:</strong> {accExec.id}<br />
                      <strong>Status:</strong> <span className={getStatusAccountExecutionClass(accExec.status)}>{accExec.status}</span><br />
                      <strong>Snapchat Username:</strong> {accExec.snapchat_account_username}<br />
                      <strong>Message:</strong> {accExec.message}<br />
                      <strong>Result:</strong>
                      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '100%' }}>
                        {accExec.result && typeof accExec.result === 'object' && 'added_users' in accExec.result && Array.isArray(accExec.result.added_users) ? (
                          <>
                            {JSON.stringify({ ...accExec.result, added_users: undefined }, null, 2)}
                            {accExec.result.added_users.length > 0 && (
                              <div style={{ marginTop: '8px' }}>
                                <strong>Added Users: </strong>
                                {accExec.result.added_users.map((username: string, index: number) => (
                                  <React.Fragment key={index}>
                                    <a
                                      href={`https://www.snapchat.com/add/${username}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="clickable-cell"
                                    >
                                      {username}
                                    </a>
                                    {index < accExec.result.added_users.length - 1 ? ', ' : ''}
                                  </React.Fragment>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          JSON.stringify(accExec.result, null, 2)
                        )}
                      </pre>
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          <span style={{ margin: '0 10px' }}>Page {currentPage}</span>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={executions.length < limit}>
            Next
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>JSON Details</ModalHeader>
        <ModalBody>
          <pre>{modalContent}</pre>
        </ModalBody>
      </Modal>
      
    </div>
  );
};

export default SnapchatAccountDetails; 