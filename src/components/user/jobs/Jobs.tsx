import React, { useEffect, useState } from 'react';
import {
  fetchJobs,
  createJob,
  deleteJob,
  updateJob,
  updateJobStatus,
  fetchAssociatedUsernames
} from '../../../services/jobService';
import { fetchTags } from '../../../services/tagsService';
import { fetchStatuses, fetchSources } from '../../../services/accountsService';

import Select, { MultiValue, SingleValue } from 'react-select';
import { toast } from 'react-toastify';
import {
  Modal,
  Button as RBButton,  // Distinguish React-Bootstrap's <Button> as RBButton
  OverlayTrigger,
  Popover
} from 'react-bootstrap'; // Keeping React-Bootstrap for modals, popovers

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Keep the bootstrap import if you still need React-Bootstrap styling for modals, popovers, etc.
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Button, Grid } from '@mui/material'; // MUI for layout & styling

interface SelectOption {
  value: string;
  label: string;
}

interface Job {
  name: string;
  statuses: string[];
  tags: string[];
  sources: string[];
  type: string;
  cron_expression: string;
  configuration: Record<string, any>;
  status: string;
}

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const { agencyId } = useParams<{ agencyId: string }>();

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);

  const [tagsOptions, setTagsOptions] = useState<SelectOption[]>([]);
  const [statusesOptions, setStatusesOptions] = useState<SelectOption[]>([]);
  const [sourcesOptions, setSourcesOptions] = useState<SelectOption[]>([]);

  const [newJob, setNewJob] = useState<Job>({
    name: '',
    statuses: [],
    tags: [],
    sources: [],
    type: '',
    cron_expression: '',
    configuration: {},
    status: 'ACTIVE',
  });

  // Additional job config states
  const [startingDelay, setStartingDelay] = useState<number | string>(30);
  const [requests, setRequests] = useState<number | string>(20);
  const [batches, setBatches] = useState<number | string>(1);
  const [batchDelay, setBatchDelay] = useState<number | string>(10);
  const [quickAddPages, setQuickAddPages] = useState<number | string>(10);
  const [username, setUsername] = useState('');
  const [usersSentInRequest, setUsersSentInRequest] = useState<number | string>(1);
  const [argoTokens, setArgoTokens] = useState<boolean>(true);

  const [firstExecutionOption, setFirstExecutionOption] = useState('none');
  const [firstExecutionTime, setFirstExecutionTime] = useState('');

  const [accountsNumber, setAccountsNumber] = useState<number | string>(5);
  const [targetLeadNumber, setTargetLeadNumber] = useState<number | string>(30);
  const [weightRejectingRate, setWeightRejectingRate] = useState<number | string>(0.6);
  const [weightConversationRate, setWeightConversationRate] = useState<number | string>(0.4);
  const [weightConversionRate, setWeightConversionRate] = useState<number | string>(0);
  const [weightError, setWeightError] = useState('');

  // React-Bootstrap modals
  const [showModal, setShowModal] = useState(false);

  // Associated usernames
  const [showUsernamesModal, setShowUsernamesModal] = useState(false);
  const [associatedUsernames, setAssociatedUsernames] = useState<{ username: string; id: number }[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  // Job Type options
  const typeOptions = [
    { value: 'quick_adds', label: 'Quick Adds' },
    { value: 'send_to_user', label: 'Send to User' },
    { value: 'check_conversations', label: 'Check Conversations' },
    { value: 'status_check', label: 'Check Status' },
    { value: 'compute_statistics', label: 'Compute Statistics' },
    // { value: 'generate_leads', label: 'Generate Leads' },
    // { value: 'quick_adds_top_accounts', label: 'Quick Adds Top Accounts' }
  ];

  /***** Input Handlers *****/
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewJob({ ...newJob, [name]: value });
  };

  const handleTagsChange = (selectedOptions: MultiValue<SelectOption>) => {
    setNewJob({ ...newJob, tags: selectedOptions.map((option) => option.value) });
  };

  const handleStatusesChange = (selectedOptions: MultiValue<SelectOption>) => {
    setNewJob({ ...newJob, statuses: selectedOptions.map((option) => option.value) });
  };

  const handleTypeChange = (selectedOption: SingleValue<SelectOption>) => {
    setNewJob({ ...newJob, type: selectedOption ? selectedOption.value : '' });
  };

  const handleSourcesChange = (selectedOptions: MultiValue<SelectOption>) => {
    setNewJob({ ...newJob, sources: selectedOptions.map((option) => option.value) });
  };

  /***** Form Validation *****/
  const validateForm = () => {
    if (!newJob.name.trim()) {
      toast.error('Job name is required');
      return false;
    }
    if (
      newJob.type !== 'generate_leads' &&
      newJob.statuses.length === 0 &&
      (!newJob.tags || newJob.tags.length === 0) &&
      (!newJob.sources || newJob.sources.length === 0)
    ) {
      toast.error('At least one status, tag, or source must be selected');
      return false;
    }
    if (!newJob.type) {
      toast.error('Job type is required');
      return false;
    }
    if (!newJob.cron_expression.trim()) {
      toast.error('Cron expression is required');
      return false;
    }
    if (firstExecutionOption === 'datetime' && !firstExecutionTime) {
      toast.error('Please select a date/time for the first execution');
      return false;
    }
    // Additional checks based on type
    if (newJob.type === 'quick_adds') {
      if (!startingDelay || !requests || !batches || !batchDelay || !quickAddPages || !usersSentInRequest) {
        toast.error('All configuration fields are required for Quick Adds');
        return false;
      }
    } else if (newJob.type === 'send_to_user') {
      if (!startingDelay || !username.trim()) {
        toast.error('All configuration fields are required for Send to User');
        return false;
      }
    } else if (newJob.type === 'check_conversations' || newJob.type === 'status_check') {
      if (!startingDelay) {
        toast.error('Starting delay is required');
        return false;
      }
    }
    return true;
  };

  const getConfiguration = () => {
    switch (newJob.type) {
      case 'quick_adds':
        return {
          starting_delay: Number(startingDelay),
          requests: Number(requests),
          batches: Number(batches),
          batch_delay: Number(batchDelay),
          max_quick_add_pages: Number(quickAddPages),
          users_sent_in_request: Number(usersSentInRequest),
          argo_tokens: argoTokens
        };
      case 'consume_leads':
        return {
          starting_delay: Number(startingDelay),
          requests: Number(requests),
          batches: Number(batches),
          batch_delay: Number(batchDelay),
          users_sent_in_request: Number(usersSentInRequest),
          argo_tokens: argoTokens
        };
      case 'send_to_user':
        return {
          starting_delay: Number(startingDelay),
          username
        };
      case 'check_conversations':
      case 'status_check':
      case 'set_bitmoji':
      case 'change_bitmoji':
        return {
          starting_delay: Number(startingDelay)
        };
      case 'compute_statistics':
        return {};
      case 'generate_leads':
        return {
          accounts_number: Number(accountsNumber),
          target_lead_number: Number(targetLeadNumber),
          weight_rejecting_rate: Number(weightRejectingRate),
          weight_conversation_rate: Number(weightConversationRate),
          weight_conversion_rate: Number(weightConversionRate),
        };
      case 'quick_adds_top_accounts':
        return {
          starting_delay: Number(startingDelay),
          requests: Number(requests),
          batches: Number(batches),
          batch_delay: Number(batchDelay),
          max_quick_add_pages: Number(quickAddPages),
          users_sent_in_request: Number(usersSentInRequest),
          argo_tokens: argoTokens,
          max_rejection_rate: Number(weightRejectingRate),
          min_conversation_rate: Number(weightConversationRate),
          min_conversion_rate: Number(weightConversionRate),
        };
      default:
        return {};
    }
  };

  /***** Modal Helpers *****/
  const handleClose = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingJobId(null);

    // Reset form
    setNewJob({
      name: '',
      statuses: [],
      tags: [],
      sources: [],
      type: '',
      cron_expression: '',
      configuration: {},
      status: 'ACTIVE',
    });
    setStartingDelay(30);
    setRequests(20);
    setBatches(1);
    setBatchDelay(10);
    setQuickAddPages(10);
    setUsername('');
    setUsersSentInRequest(1);
    setArgoTokens(true);
    setFirstExecutionOption('none');
    setFirstExecutionTime('');
  };

  const handleShow = () => {
    setIsEditing(false);
    setEditingJobId(null);
    setShowModal(true);
  };

  const handleEdit = (job: any) => {
    setIsEditing(true);
    setEditingJobId(job.id);
    setNewJob({
      name: job.name,
      statuses: job.statuses,
      tags: job.tags || [],
      sources: job.sources || [],
      type: job.type.toLowerCase(),
      cron_expression: job.cron_expression,
      configuration: job.configuration,
      status: job.status,
    });

    const config = job.configuration || {};
    setStartingDelay(config.starting_delay ?? 30);

    if (job.type === 'QUICK_ADDS') {
      setRequests(config.requests ?? 20);
      setBatches(config.batches ?? 1);
      setBatchDelay(config.batch_delay ?? 10);
      setQuickAddPages(config.max_quick_add_pages ?? 10);
      setUsersSentInRequest(config.users_sent_in_request ?? 1);
      setArgoTokens(config.argo_tokens !== undefined ? config.argo_tokens : true);
    } else if (job.type === 'SEND_TO_USER') {
      setUsername(config.username || '');
    }

    if (job.start_date) {
      setFirstExecutionOption('datetime');
      const date = new Date(job.start_date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      setFirstExecutionTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      setFirstExecutionOption('none');
      setFirstExecutionTime('');
    }

    setShowModal(true);
  };

  const handleCopy = (job: any) => {
    setIsEditing(false);
    setEditingJobId(null);
    setNewJob({
      name: `${job.name} - Copy`,
      statuses: job.statuses,
      tags: job.tags || [],
      sources: job.sources || [],
      type: job.type.toLowerCase(),
      cron_expression: job.cron_expression,
      configuration: job.configuration,
      status: 'ACTIVE',
    });

    const config = job.configuration || {};
    setStartingDelay(config.starting_delay ?? 30);

    if (job.type === 'QUICK_ADDS') {
      setRequests(config.requests ?? 20);
      setBatches(config.batches ?? 1);
      setBatchDelay(config.batch_delay ?? 10);
      setQuickAddPages(config.max_quick_add_pages ?? 10);
      setUsersSentInRequest(config.users_sent_in_request ?? 1);
      setArgoTokens(config.argo_tokens !== undefined ? config.argo_tokens : true);
    } else if (job.type === 'SEND_TO_USER') {
      setUsername(config.username || '');
    }

    setFirstExecutionOption('none');
    setFirstExecutionTime('');
    setShowModal(true);
  };

  const handleCreateOrUpdateJob = async () => {
    if (!validateForm()) return;

    try {
      let firstExecutionTimeUTC = null;
      if (firstExecutionOption === 'datetime' && firstExecutionTime) {
        const localDate = new Date(firstExecutionTime);
        firstExecutionTimeUTC = localDate.toISOString();
      } else if (firstExecutionOption === 'now') {
        firstExecutionTimeUTC = new Date().toISOString();
      }

      const jobData = {
        name: newJob.name,
        statuses: newJob.statuses,
        tags: newJob.tags,
        sources: newJob.sources,
        type: newJob.type.toUpperCase(),
        cron_expression: newJob.cron_expression,
        configuration: getConfiguration(),
        status: 'ACTIVE',
        first_execution_time: firstExecutionTimeUTC
      };
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }

      if (isEditing && editingJobId) {
        await updateJob(agencyId, editingJobId, jobData);
        toast.success('Job updated successfully');
      } else {
        await createJob(agencyId, jobData);
        toast.success('Job created successfully');
      }

      handleClose();
      const data = await fetchJobs(agencyId, ['ACTIVE', 'STOPPED']);
      setJobs(data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'An unknown error occurred';
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} job: ${errorMessage}`);
      console.error(`Error ${isEditing ? 'updating' : 'creating'} job:`, error);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        await deleteJob(agencyId, jobId);
        toast.success('Job deleted successfully');
        const data = await fetchJobs(agencyId, ['ACTIVE', 'STOPPED']);
        setJobs(data);
      } catch (error) {
        toast.error('Failed to delete job. Please try again.');
        console.error('Error deleting job:', error);
      }
    }
  };

  const handleStatusUpdate = async (jobId: number, currentStatus: string) => {
    try {
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      const newStatus = currentStatus === 'ACTIVE' ? 'STOPPED' : 'ACTIVE';
      await updateJobStatus(agencyId, jobId, newStatus);
      toast.success('Job status updated successfully');
      const data = await fetchJobs(agencyId, ['ACTIVE', 'STOPPED']);
      setJobs(data);
    } catch (error) {
      toast.error('Failed to update job status. Please try again.');
      console.error('Error updating job status:', error);
    }
  };

  const handleViewExecutions = (jobId: number) => {
    window.open(`/agency/${agencyId}/executions?job=${jobId}`, '_blank');
  };

  const fetchAssociatedUsernamesHandler = async (jobId: number) => {
    try {
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      const accounts = await fetchAssociatedUsernames(agencyId, jobId);
      setAssociatedUsernames(accounts);
      setSelectedJobId(jobId);
      setShowUsernamesModal(true);
    } catch (error) {
      console.error('Failed to fetch associated usernames:', error);
      toast.error('Failed to load associated usernames');
    }
  };

  // Render job-type-specific fields
  const renderConfigurationOptions = (): JSX.Element | null => {
    switch (newJob.type) {
      case 'quick_adds':
        return (
          <div>
            <div className="mb-2">
              <label>Number of Quick Adds to Send</label>
              <input
                type="number"
                value={requests}
                onChange={(e) => setRequests(e.target.value)}
                className="form-control"
              />
            </div>
          </div>
        );
      case 'send_to_user':
        return (
          <div>
            <div className="mb-2">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-control"
              />
            </div>
          </div>
        );
      case 'generate_leads':
        return (
          <div>
            <div className="mb-2">
              <label>Accounts Number:</label>
              <input
                type="number"
                value={accountsNumber}
                onChange={(e) => setAccountsNumber(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="mb-2">
              <label>Target Lead Number:</label>
              <input
                type="number"
                value={targetLeadNumber}
                onChange={(e) => setTargetLeadNumber(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="mb-2">
              <label>Weight Rejecting Rate:</label>
              <input
                type="number"
                value={weightRejectingRate}
                onChange={(e) => setWeightRejectingRate(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="mb-2">
              <label>Weight Conversation Rate:</label>
              <input
                type="number"
                value={weightConversationRate}
                onChange={(e) => setWeightConversationRate(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="mb-2">
              <label>Weight Conversion Rate:</label>
              <input
                type="number"
                value={weightConversionRate}
                onChange={(e) => setWeightConversionRate(e.target.value)}
                className="form-control"
              />
            </div>
            {weightError && <div className="alert alert-danger">{weightError}</div>}
          </div>
        );
      // More cases if needed...
      default:
        return null;
    }
  };

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const data = await fetchJobs(agencyId, ['ACTIVE', 'STOPPED']);
        setJobs(data);
      } catch (error) {
        console.error('Failed to load jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadTags = async () => {
      try {
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const tags = await fetchTags(agencyId);
        setTagsOptions(tags.map((tag: string) => ({ value: tag, label: tag })));
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };

    const loadStatuses = async () => {
      try {
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const statuses = await fetchStatuses(agencyId);
        setStatusesOptions(statuses.map((status: string) => ({ value: status, label: status })));
      } catch (error) {
        console.error('Failed to load statuses:', error);
      }
    };

    const loadSources = async () => {
      try {
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const sources = await fetchSources(agencyId);
        setSourcesOptions(
          sources.map((source: string) => ({ value: source, label: source }))
        );
      } catch (error) {
        console.error('Failed to load sources:', error);
        toast.error('Failed to load sources');
      }
    };

    loadJobs();
    loadTags();
    loadStatuses();
    loadSources();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', p: 4 }}>
      <ToastContainer />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4">Jobs</Typography>
        <Button variant="contained" color="primary" onClick={handleShow}>
          Create New Job
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Box>
      ) : jobs.length === 0 ? (
        <Box sx={{ border: '1px solid #ccc', p: 2 }}>
          <Typography variant="body1" color="text.secondary">
            No jobs available.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {jobs.map((job) => (
            <Grid item xs={12} sm={6} md={4} key={job.id}>
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 2,
                  height: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    mb: 2,
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 0 }}>
                    {job.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="small"
                      color={job.status === 'ACTIVE' ? 'warning' : 'success'}
                      onClick={() => handleStatusUpdate(job.id, job.status)}
                    >
                      {job.status === 'ACTIVE' ? 'Stop' : 'Activate'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="info"
                      onClick={() => handleViewExecutions(job.id)}
                      title="View Executions"
                    >
                      <i className="bi bi-eye-fill"></i>
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleEdit(job)}
                      title="Edit Job"
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleCopy(job)}
                      title="Copy Job"
                    >
                      <i className="bi bi-files"></i>
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      color="error"
                      onClick={() => handleDeleteJob(job.id)}
                      title="Delete Job"
                    >
                      <i className="bi bi-trash3-fill"></i>
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="secondary"
                      onClick={() => {
                        setSelectedJobId(job.id);
                        fetchAssociatedUsernamesHandler(job.id);
                      }}
                      title="View Associated Usernames"
                    >
                      <i className="bi bi-people-fill"></i>
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box
                    component="span"
                    sx={{
                      backgroundColor: job.status === 'ACTIVE' ? '#198754' : '#6c757d',
                      color: '#fff',
                      p: '2px 6px',
                      borderRadius: '4px',
                      mr: 1,
                    }}
                  >
                    {job.status}
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      backgroundColor: '#0dcaf0',
                      color: '#000',
                      p: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {job.type}
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  <strong>Cron:</strong> {job.cron_expression}
                  {job.start_date && (
                    <>
                      <br />
                      <strong>Start Date:</strong>{' '}
                      {new Date(job.start_date).toLocaleString()}
                    </>
                  )}
                </Typography>

                {/* Statuses */}
                {job.statuses && job.statuses.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Account Statuses:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {job.statuses.map((st: string) => (
                        <Box
                          key={st}
                          sx={{
                            backgroundColor: '#0d6efd',
                            color: '#fff',
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                          }}
                        >
                          {st}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Tags */}
                {job.tags && job.tags.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Tags:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {job.tags.map((tag: string) => (
                        <Box
                          key={tag}
                          sx={{
                            backgroundColor: '#0dcaf0',
                            color: '#000',
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                          }}
                        >
                          {tag}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Sources */}
                {job.sources && job.sources.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Sources:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {job.sources.map((source: string) => (
                        <Box
                          key={source}
                          sx={{
                            backgroundColor: '#6c757d',
                            color: '#fff',
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                          }}
                        >
                          {source}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Configuration snippet example */}
                {job.type === 'QUICK_ADDS' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Configuration:
                    </Typography>
                    <Box sx={{ fontSize: '0.85rem' }}>
                      {Object.entries(job.configuration)
                        .filter(
                          ([key]) =>
                            ![
                              'max_quick_add_pages',
                              'users_sent_in_request',
                              'argo_tokens',
                              'batches',
                              'batch_delay',
                              'starting_delay'
                            ].includes(key)
                        )
                        .map(([key, value]) => (
                          <Box key={key} sx={{ mb: 1 }}>
                            <strong>
                              {key
                                .split('_')
                                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                .join(' ')}
                              :
                            </strong>{' '}
                            {typeof value === 'boolean' ? value.toString() : String(value)}
                          </Box>
                        ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal for creating/updating job */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Job' : 'Create New Job'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Box sx={{ mb: 3 }}>
            <label className="form-label">Job Name</label>
            <input
              type="text"
              name="name"
              placeholder="Job Name"
              value={newJob.name}
              onChange={handleInputChange}
              className="form-control"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <label className="form-label">Statuses</label>
            <Select
              isMulti
              name="statuses"
              options={statusesOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={handleStatusesChange}
              value={statusesOptions.filter((option) => newJob.statuses.includes(option.value))}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <label className="form-label">Tags</label>
            <Select
              isMulti
              name="tags"
              options={tagsOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={handleTagsChange}
              value={tagsOptions.filter((option) => newJob.tags.includes(option.value))}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <label className="form-label">Sources</label>
            <Select
              isMulti
              options={sourcesOptions}
              value={sourcesOptions.filter((opt) => newJob.sources.includes(opt.value))}
              onChange={handleSourcesChange}
              className="basic-multi-select"
              classNamePrefix="select"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <label className="form-label">Cron Expression</label>
            <OverlayTrigger
              trigger="click"
              placement="right"
              overlay={
                <Popover id="cron-popover">
                  <Popover.Body>
                    Use{' '}
                    <a
                      href="https://www.freeformatter.com/cron-expression-generator-quartz.html"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      this tool
                    </a>{' '}
                    to generate a cron expression.
                  </Popover.Body>
                </Popover>
              }
            >
              <span style={{ cursor: 'pointer', marginLeft: '6px' }}>
                <i className="bi bi-info-circle"></i>
              </span>
            </OverlayTrigger>
            <input
              type="text"
              name="cron_expression"
              placeholder="0 0 * * *"
              value={newJob.cron_expression}
              onChange={handleInputChange}
              className="form-control"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <label className="form-label">Type</label>
            <Select
              name="type"
              options={typeOptions}
              className="basic-single"
              classNamePrefix="select"
              onChange={handleTypeChange}
              value={typeOptions.find((option) => option.value === newJob.type)}
            />
          </Box>

          {/* Operation-specific config fields */}
          {newJob.type && (
            <Box sx={{ mb: 3 }}>
              <label className="form-label">Configuration</label>
              <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, mt: 1 }}>
                {/* The same function that returns job-type UI fields */}
                {(() => {
                  switch (newJob.type) {
                    case 'quick_adds':
                      return (
                        <Box>
                          <label>Number of Quick Adds to Send</label>
                          <input
                            type="number"
                            value={requests}
                            onChange={(e) => setRequests(e.target.value)}
                            className="form-control"
                          />
                        </Box>
                      );
                    case 'send_to_user':
                      return (
                        <Box>
                          <label>Username</label>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-control"
                          />
                        </Box>
                      );
                    default:
                      return null;
                  }
                })()}
              </Box>
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <label className="form-label">First Execution</label>
            <Box sx={{ mb: 2 }}>
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  name="firstExecutionOption"
                  id="none"
                  value="none"
                  checked={firstExecutionOption === 'none'}
                  onChange={(e) => setFirstExecutionOption(e.target.value)}
                />
                <label className="form-check-label" htmlFor="none">
                  No specific time (use cron schedule)
                </label>
              </div>
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  name="firstExecutionOption"
                  id="now"
                  value="now"
                  checked={firstExecutionOption === 'now'}
                  onChange={(e) => setFirstExecutionOption(e.target.value)}
                />
                <label className="form-check-label" htmlFor="now">
                  Execute on creation
                </label>
              </div>
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  name="firstExecutionOption"
                  id="datetime"
                  value="datetime"
                  checked={firstExecutionOption === 'datetime'}
                  onChange={(e) => setFirstExecutionOption(e.target.value)}
                />
                <label className="form-check-label" htmlFor="datetime">
                  Select date and time
                </label>
              </div>
            </Box>
            {firstExecutionOption === 'datetime' && (
              <input
                type="datetime-local"
                className="form-control"
                value={firstExecutionTime}
                onChange={(e) => setFirstExecutionTime(e.target.value)}
              />
            )}
          </Box>
        </Modal.Body>
        <Modal.Footer>
          <RBButton variant="secondary" onClick={handleClose}>
            Cancel
          </RBButton>
          <RBButton variant="primary" onClick={handleCreateOrUpdateJob}>
            {isEditing ? 'Update Job' : 'Create Job'}
          </RBButton>
        </Modal.Footer>
      </Modal>

      <Modal show={showUsernamesModal} onHide={() => setShowUsernamesModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Associated Usernames</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {associatedUsernames.length > 0 ? (
            <ul className="list-group">
              {associatedUsernames.map((account, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{account.username}</span>
                  <a
                    href={`/agency/${agencyId}/snapchat-account/${account.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    View Profile
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No associated usernames found.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <RBButton variant="secondary" onClick={() => setShowUsernamesModal(false)}>
            Close
          </RBButton>
        </Modal.Footer>
      </Modal>
    </Box>
  );
};

export default Jobs;
