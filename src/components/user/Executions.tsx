import React, { useEffect, useState } from 'react';
import { fetchExecutions } from '../../services/executionService';
import { fetchSimplifiedJobs } from '../../services/jobService';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const Executions: React.FC = () => {
  const navigate = useNavigate();
  const { agencyId } = useParams<{ agencyId: string }>();
  const [searchParams] = useSearchParams();
  const [executions, setExecutions] = useState<any[]>([]);
  const [results, setResults] = useState<Record<string, any>[]>([]);
  const [jobName, setJobNames] = useState<any[]>([]);
  const [selectedExecutionId, setSelectedExecutionId] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(10); // Set a limit for pagination
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('');
  const [executionType, setExecutionType] = useState('');
  const [jobs, setJobs] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>();

  const handleUsernameChange = (newUsername: string) => {
    setUsername(newUsername);
    setOffset(0);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setOffset(0);
  };

  const handleExecutionTypeChange = (newType: string) => {
    setExecutionType(newType);
    setOffset(0);
  };

  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId ? Number(jobId) : undefined);
    setOffset(0);
  };

  useEffect(() => {
    const loadJobs = async () => {
      try {
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const jobsData = await fetchSimplifiedJobs(agencyId);
        setJobs(jobsData);
        
        // Get job ID from URL if present
        const jobParam = searchParams.get('job');
        if (jobParam) {
          setSelectedJobId(Number(jobParam));
        }
      } catch (error) {
        console.error('Failed to load jobs:', error);
      }
    };

    loadJobs();
  }, [searchParams]);

  useEffect(() => {
    const loadExecutions = async () => {
      try {
        setLoading(true);
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const data = await fetchExecutions(
          agencyId,
          offset, 
          limit, 
          username, 
          status, 
          executionType,
          selectedJobId
        );
        const extractedExecutions = data.map((item: any) => item.execution);
        const extractedResults = data.map((item: any) => item.results);
        const jobNames = data.map((item: any) => item.job_name);
        setExecutions(extractedExecutions);
        setResults(extractedResults);
        setJobNames(jobNames);
      } catch (error) {
        console.error('Failed to load executions:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only load executions if we have processed the initial job ID from URL
    if (!searchParams.get('job') || selectedJobId !== undefined) {
      loadExecutions();
    }
  }, [offset, limit, username, status, executionType, selectedJobId, searchParams]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'FAILURE':
        return 'text-danger';
      case 'DONE':
        return 'text-success';
      default:
        return 'text-warning';
    }
  };

  const handleViewDetails = (executionId: number) => {
    navigate(`/user/executions/${executionId}`);
  };

  const renderExecutionList = () => (
    <div>
      <ul className="list-group mb-3">
        {executions.map((execution, index) => (
          <li
            key={execution.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>Type:</strong> {execution.type}
              <br />
              <strong>Job Name:</strong> {jobName[index] || 'ManualOperations'}
              <br />
              <strong>Status:</strong>{' '}
              <span className={getStatusClass(execution.status)}>{execution.status}</span>
              <br />
              <strong>Start Time:</strong> {new Date(execution.start_time).toLocaleString()}
              <br />
              <strong>End Time:</strong> {execution.end_time ? new Date(execution.end_time).toLocaleString() : 'N/A'}
              <br />
              <strong>Configuration:</strong>
              <pre className="mb-0">
                {JSON.stringify(execution.configuration, null, 2)}
              </pre>
              <br />
              <strong>Results:</strong>
              <div className="results-container">
                {Object.entries(results[index] || {}).map(([key, value]: [string, any]) => (
                  <span key={key} className="badge bg-info text-dark me-1">
                    <strong>{key}:</strong> {value}
                  </span>
                ))}
              </div>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => window.open(`/agency/${agencyId}/executions/${execution.id}`, '_blank')}
              >
                View Details
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="pagination-controls d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setOffset((prev) => Math.max(prev - limit, 0))}
          disabled={offset === 0}
        >
          Previous
        </button>
        <span>Page {Math.floor(offset / limit) + 1}</span>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setOffset((prev) => prev + limit)}
          disabled={executions.length < limit}
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        <div className="col d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1>Executions</h1>
          </div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Filter by username"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
            />
            <select
              className="form-select mb-2"
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="STARTED">STARTED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
              <option value="FAILURE">FAILURE</option>
            </select>
            <select
              className="form-select mb-2"
              value={executionType}
              onChange={(e) => handleExecutionTypeChange(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="QUICK_ADDS">QUICK_ADDS</option>
              <option value="SEND_TO_USER">SEND_TO_USER</option>
              <option value="CHECK_CONVERSATIONS">CHECK_CONVERSATIONS</option>
              <option value="COMPUTE_STATISTICS">COMPUTE_STATISTICS</option>
              <option value="GENERATE_LEADS">GENERATE_LEADS</option>
              <option value="CONSUME_LEADS">CONSUME_LEADS</option>
            </select>
            <select
              className="form-select mb-2"
              value={selectedJobId || ''}
              onChange={(e) => handleJobChange(e.target.value)}
            >
              <option value="">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.name}
                </option>
              ))}
            </select>
          </div>
          <div className="content flex-grow-1 overflow-auto">
            {loading ? <p>Loading...</p> : renderExecutionList()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Executions; 