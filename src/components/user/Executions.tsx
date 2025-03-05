import React, { useEffect, useState } from 'react';
import { fetchExecutions } from '../../services/executionService';
import { fetchSimplifiedJobs } from '../../services/jobService';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

// MUI imports for layout & styling
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

interface ExecutionData {
  execution: any;
  results: any;
  job_name: string;
}

const Executions: React.FC = () => {
  const navigate = useNavigate();
  const { agencyId } = useParams<{ agencyId: string }>();

  const [searchParams] = useSearchParams();
  const [executions, setExecutions] = useState<any[]>([]);
  const [results, setResults] = useState<Record<string, any>[]>([]);
  const [jobName, setJobNames] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(10); // pagination limit
  const [loading, setLoading] = useState(true);

  // Filters
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('');
  const [executionType, setExecutionType] = useState('');

  // For job selection
  const [jobs, setJobs] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>();

  // Handle filter changes
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

  // Load job list on mount (and parse job param from URL if present)
  useEffect(() => {
    const loadJobs = async () => {
      try {
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const jobsData = await fetchSimplifiedJobs(agencyId);
        setJobs(jobsData);

        // If there's a job param in URL, set it as selected
        const jobParam = searchParams.get('job');
        if (jobParam) {
          setSelectedJobId(Number(jobParam));
        }
      } catch (error) {
        console.error('Failed to load jobs:', error);
      }
    };
    loadJobs();
  }, [agencyId, searchParams]);

  // Load executions whenever filters, offset, or selectedJobId changes
  useEffect(() => {
    const loadExecutions = async () => {
      try {
        setLoading(true);
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const data: ExecutionData[] = await fetchExecutions(
          agencyId,
          offset,
          limit,
          username,
          status,
          executionType,
          selectedJobId
        );
        const extractedExecutions = data.map((item) => item.execution);
        const extractedResults = data.map((item) => item.results);
        const jobNames = data.map((item) => item.job_name);

        setExecutions(extractedExecutions);
        setResults(extractedResults);
        setJobNames(jobNames);
      } catch (error) {
        console.error('Failed to load executions:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only load if job param is processed or no param is present
    if (!searchParams.get('job') || selectedJobId !== undefined) {
      loadExecutions();
    }
  }, [agencyId, offset, limit, username, status, executionType, selectedJobId, searchParams]);

  // Helper to apply text colors for statuses
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

  // Show details in new tab
  const handleViewDetails = (executionId: number) => {
    navigate(`/user/executions/${executionId}`);
  };

  const renderExecutionList = () => (
    <Box>
      <ul className="list-group mb-3">
        {executions.map((execution, index) => (
          <li
            key={execution.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <Box>
              <strong>Type:</strong> {execution.type}
              <br />
              <strong>Job Name:</strong> {jobName[index] || 'ManualOperations'}
              <br />
              <strong>Status:</strong>{' '}
              <span className={getStatusClass(execution.status)}>{execution.status}</span>
              <br />
              <strong>Start Time:</strong> {new Date(execution.start_time).toLocaleString()}
              <br />
              <strong>End Time:</strong>{' '}
              {execution.end_time ? new Date(execution.end_time).toLocaleString() : 'N/A'}
              <br />
              <strong>Results:</strong>
              <div className="results-container">
                {Object.entries(results[index] || {}).map(([key, value]) => (
                  <span key={key} className="badge bg-info text-dark me-1">
                    <strong>{key}:</strong> {value}
                  </span>
                ))}
              </div>
            </Box>
            <Box className="d-flex gap-2">
              <Button
                variant="contained"
                size="small"
                onClick={() =>
                  window.open(`/agency/${agencyId}/executions/${execution.id}`, '_blank')
                }
              >
                View Details
              </Button>
            </Box>
          </li>
        ))}
      </ul>
      {/* Pagination controls */}
      <Box
        className="pagination-controls d-flex justify-content-between align-items-center mt-3"
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Button
          variant="outlined"
          size="small"
          onClick={() => setOffset((prev) => Math.max(prev - limit, 0))}
          disabled={offset === 0}
        >
          Previous
        </Button>
        <Typography variant="body2">Page {Math.floor(offset / limit) + 1}</Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setOffset((prev) => prev + limit)}
          disabled={executions.length < limit}
        >
          Next
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, display: 'flex' }}>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h4">Executions</Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ mb: 1 }}>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Filter by username"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
              />
            </Box>

            <Box sx={{ mb: 1 }}>
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
            </Box>

            <Box sx={{ mb: 1 }}>
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
            </Box>

            <Box sx={{ mb: 1 }}>
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
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {loading ? <p>Loading...</p> : renderExecutionList()}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Executions;
