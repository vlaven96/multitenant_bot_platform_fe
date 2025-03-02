import React, { useEffect, useState } from 'react';
import { fetchJobs, createJob, deleteJob, updateJobStatus, updateJob, fetchAssociatedUsernames } from '../../../services/jobService';
import { fetchTags } from '../../../services/tagsService';
import { fetchStatuses, fetchSources } from '../../../services/accountsService';
import Select, { MultiValue, SingleValue } from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'react-router-dom';
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
  const [tagsOptions, setTagsOptions] = useState<SelectOption[]>([]);
  const [statusesOptions, setStatusesOptions] = useState<SelectOption[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
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
  const [startingDelay, setStartingDelay] = useState<number | string>(30);
  const [requests, setRequests] = useState<number | string>(20);
  const [batches, setBatches] = useState<number | string>(1);
  const [batchDelay, setBatchDelay] = useState<number | string>(10);
  const [quickAddPages, setQuickAddPages] = useState<number | string>(10);
  const [username, setUsername] = useState('');
  const [usersSentInRequest, setUsersSentInRequest] = useState<number | string>(1);
  const [argoTokens, setArgoTokens] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false);
  const [firstExecutionOption, setFirstExecutionOption] = useState('none');
  const [firstExecutionTime, setFirstExecutionTime] = useState('');
  const [sourcesOptions, setSourcesOptions] = useState<SelectOption[]>([]);
  const [accountsNumber, setAccountsNumber] = useState<number | string>(5);
  const [targetLeadNumber, setTargetLeadNumber] = useState<number | string>(30);
  const [weightRejectingRate, setWeightRejectingRate] = useState<number | string>(0.6);
  const [weightConversationRate, setWeightConversationRate] = useState<number | string>(0.4);
  const [weightConversionRate, setWeightConversionRate] = useState<number | string>(0);
  const [showUsernamesModal, setShowUsernamesModal] = useState(false);
  const [associatedUsernames, setAssociatedUsernames] = useState<{ username: string, id: number }[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const typeOptions = [
    { value: 'quick_adds', label: 'Quick Adds' },
    // { value: 'consume_leads', label: 'Consume Leads' },
    { value: 'send_to_user', label: 'Send to User' },
    { value: 'check_conversations', label: 'Check Conversations' },
    { value: 'status_check', label: 'Check Status' },
    { value: 'compute_statistics', label: 'Compute Statistics' },
    // { value: 'generate_leads', label: 'Generate Leads' },
    // { value: 'quick_adds_top_accounts', label: 'Quick Adds Top Accounts' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewJob({ ...newJob, [name]: value });
  };

  const handleTagsChange = (selectedOptions: MultiValue<SelectOption>) => {
    setNewJob({ ...newJob, tags: selectedOptions.map(option => option.value) });
  };

  const handleStatusesChange = (selectedOptions: MultiValue<SelectOption>) => {
    setNewJob({ ...newJob, statuses: selectedOptions.map(option => option.value) });
  };

  const handleTypeChange = (selectedOption: SingleValue<SelectOption>) => {
    setNewJob({ ...newJob, type: selectedOption ? selectedOption.value : '' });
  };

  const handleSourcesChange = (selectedOptions: MultiValue<SelectOption>) => {
    setNewJob({ ...newJob, sources: selectedOptions.map(option => option.value) });
  };

  const validateForm = () => {
    if (!newJob.name.trim()) {
      toast.error('Job name is required');
      return false;
    }

    if (newJob.type !== 'generate_leads' && newJob.statuses.length === 0 && (!newJob.tags || newJob.tags.length === 0) && (!newJob.sources || newJob.sources.length === 0)) {
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
      toast.error('Please select a date and time for the first execution');
      return false;
    }

    // Validate configuration based on type
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
    } else if (newJob.type === 'compute_statistics') {
      return true;
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

    // Set configuration values based on job type
    const config = job.configuration;
    if (config) {
      setStartingDelay(config.starting_delay || 30);
      if (job.type === 'QUICK_ADDS') {
        setRequests(config.requests || 20);
        setBatches(config.batches || 1);
        setBatchDelay(config.batch_delay || 10);
        setQuickAddPages(config.max_quick_add_pages || 10);
        setUsersSentInRequest(config.users_sent_in_request || 1);
        setArgoTokens(config.argo_tokens !== undefined ? config.argo_tokens : true);
      } else if (job.type === 'SEND_TO_USER') {
        setUsername(config.username || '');
      }
    }

    // Handle start date
    if (job.start_date) {
      setFirstExecutionOption('datetime');
      // Convert UTC date to local datetime-local format
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

    // Set configuration values based on job type
    const config = job.configuration;
    if (config) {
      setStartingDelay(config.starting_delay || 30);
      if (job.type === 'QUICK_ADDS') {
        setRequests(config.requests || 20);
        setBatches(config.batches || 1);
        setBatchDelay(config.batch_delay || 10);
        setQuickAddPages(config.max_quick_add_pages || 10);
        setUsersSentInRequest(config.users_sent_in_request || 1);
        setArgoTokens(config.argo_tokens !== undefined ? config.argo_tokens : true);
      } else if (job.type === 'SEND_TO_USER') {
        setUsername(config.username || '');
      }
    }

    // For copied jobs, default to no specific start time
    setFirstExecutionOption('none');
    setFirstExecutionTime('');

    setShowModal(true);
  };

  const handleCreateOrUpdateJob = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      let firstExecutionTimeUTC = null;
      if (firstExecutionOption === 'datetime' && firstExecutionTime) {
        // Convert local datetime to UTC
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
      // Refresh jobs list  
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
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
        // Refresh jobs list
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
      // Refresh jobs list
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      const data = await fetchJobs(agencyId, ['ACTIVE', 'STOPPED']);
      setJobs(data);
    } catch (error) {
      toast.error('Failed to update job status. Please try again.');
      console.error('Error updating job status:', error);
    }
  };

  const handleViewExecutions = (jobId: number) => {
    // Open in new tab with job pre-selected
    window.open(`/user/executions?job=${jobId}`, '_blank');
  };

  const fetchAssociatedUsernamesHandler = async (jobId: number) => {
    try {
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      const accounts = await fetchAssociatedUsernames(agencyId, jobId);
      setAssociatedUsernames(accounts);
      setShowUsernamesModal(true);
    } catch (error) {
      console.error('Failed to fetch associated usernames:', error);
      toast.error('Failed to load associated usernames');
    }
  };

  const renderConfigurationOptions = () => {
    switch (newJob.type) {
      case 'quick_adds':
        return (
          <div>
            {/* <div className="form-group mb-2">
              <label>Starting Delay (seconds)</label>
              <input type="number" value={startingDelay} onChange={(e) => setStartingDelay(e.target.value)} className="form-control" />
            </div> */}
            <div className="form-group mb-2">
              <label>Number of Quick Adds to Send</label>
              <input type="number" value={requests} onChange={(e) => setRequests(e.target.value)} className="form-control" />
            </div>
            {/* <div className="form-group mb-2">
              <label>Batches</label>
              <input type="number" value={batches} onChange={(e) => setBatches(e.target.value)} className="form-control" />
            </div> */}
            {/* <div className="form-group mb-2">
              <label>Batch Delay (seconds)</label>
              <input type="number" value={batchDelay} onChange={(e) => setBatchDelay(e.target.value)} className="form-control" />
            </div> */}
            {/* <div className="form-group mb-2">
              <label>Quick Add Pages</label>
              <input type="number" value={quickAddPages} onChange={(e) => setQuickAddPages(e.target.value)} className="form-control" />
            </div> */}
            {/* <div className="form-group mb-2">
              <label>Users Sent in Request</label>
              <input
                type="number"
                value={usersSentInRequest}
                onChange={(e) => setUsersSentInRequest(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                className="form-control"
                min="0"
              />
            </div> */}
            {/* <div className="form-check mb-2">
              <input type="checkbox" className="form-check-input" checked={argoTokens} onChange={(e) => setArgoTokens(e.target.checked)} />
              <label className="form-check-label">Use Argo Tokens</label>
            </div> */}
          </div>
        );
      // case 'consume_leads':
      //   return (
      //     <div>
      //       <div className="form-group mb-2">
      //         <label>Starting Delay (seconds)</label>
      //         <input type="number" value={startingDelay} onChange={(e) => setStartingDelay(e.target.value)} className="form-control" />
      //       </div>
      //       <div className="form-group mb-2">
      //         <label>Requests</label>
      //         <input type="number" value={requests} onChange={(e) => setRequests(e.target.value)} className="form-control" />
      //       </div>
      //       <div className="form-group mb-2">
      //         <label>Batches</label>
      //         <input type="number" value={batches} onChange={(e) => setBatches(e.target.value)} className="form-control" />
      //       </div>
      //       <div className="form-group mb-2">
      //         <label>Batch Delay (seconds)</label>
      //         <input type="number" value={batchDelay} onChange={(e) => setBatchDelay(e.target.value)} className="form-control" />
      //       </div>
      //       <div className="form-group mb-2">
      //         <label>Users Sent in Request</label>
      //         <input
      //           type="number"
      //           value={usersSentInRequest}
      //           onChange={(e) => setUsersSentInRequest(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
      //           className="form-control"
      //           min="0"
      //         />
      //       </div>
      //       <div className="form-check mb-2">
      //         <input type="checkbox" className="form-check-input" checked={argoTokens} onChange={(e) => setArgoTokens(e.target.checked)} />
      //         <label className="form-check-label">Use Argo Tokens</label>
      //       </div>
      //     </div>
      //   );
      case 'send_to_user':
        return (
          <div>
            {/* <div className="form-group mb-2">
              <label>Starting Delay (seconds)</label>
              <input type="number" value={startingDelay} onChange={(e) => setStartingDelay(e.target.value)} className="form-control" />
            </div> */}
            <div className="form-group mb-2">
              <label>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="form-control" />
            </div>
          </div>
        );
      // case 'check_conversations':
      // case 'status_check':
      //   return (
      //     <div>
      //       <div className="form-group mb-2">
      //         <label>Starting Delay (seconds)</label>
      //         <input type="number" value={startingDelay} onChange={(e) => setStartingDelay(e.target.value)} className="form-control" />
      //       </div>
      //     </div>
      //   );
      // case 'compute_statistics':
      //   return (
      //     <div className="text-muted">
      //       No configuration needed for statistics computation.
      //     </div>
      //   );
      case 'generate_leads':
        return (
          <div className="generate-leads-container">
            <div className="mb-2 flex-item">
              <label>Accounts Number:</label>
              <input
                type="number"
                value={accountsNumber}
                onChange={(e) => setAccountsNumber(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                placeholder="Accounts Number"
                className="form-control"
                min="0"
              />
            </div>
            <div className="mb-2 flex-item">
              <label>Target Lead Number:</label>
              <input
                type="number"
                value={targetLeadNumber}
                onChange={(e) => setTargetLeadNumber(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                placeholder="Target Lead Number"
                className="form-control"
                min="0"
              />
            </div>
            <div className="mb-2 flex-item">
              <label>Weight Rejecting Rate:</label>
              <input
                type="number"
                value={weightRejectingRate}
                onChange={(e) => setWeightRejectingRate(e.target.value === '' ? '' : Math.max(0, Math.min(1, parseFloat(e.target.value))))}
                className="form-control"
                min="0"
                max="1"
                step="0.01"
              />
            </div>
            <div className="mb-2 flex-item">
              <label>Weight Conversation Rate:</label>
              <input
                type="number"
                value={weightConversationRate}
                onChange={(e) => setWeightConversationRate(e.target.value === '' ? '' : Math.max(0, Math.min(1, parseFloat(e.target.value))))}
                className="form-control"
                min="0"
                max="1"
                step="0.01"
              />
            </div>
            <div className="mb-2 flex-item">
              <label>Weight Conversion Rate:</label>
              <input
                type="number"
                value={weightConversionRate}
                onChange={(e) => setWeightConversionRate(e.target.value === '' ? '' : Math.max(0, Math.min(1, parseFloat(e.target.value))))}
                className="form-control"
                min="0"
                max="1"
                step="0.01"
              />
            </div>
          </div>
        );
      case 'quick_adds_top_accounts':
        return (
          <div>
            <div className="form-group mb-2">
              <label>Starting Delay (seconds)</label>
              <input type="number" value={startingDelay} onChange={(e) => setStartingDelay(e.target.value)} className="form-control" />
            </div>
            <div className="form-group mb-2">
              <label>Requests</label>
              <input type="number" value={requests} onChange={(e) => setRequests(e.target.value)} className="form-control" />
            </div>
            <div className="form-group mb-2">
              <label>Batches</label>
              <input type="number" value={batches} onChange={(e) => setBatches(e.target.value)} className="form-control" />
            </div>
            <div className="form-group mb-2">
              <label>Batch Delay (seconds)</label>
              <input type="number" value={batchDelay} onChange={(e) => setBatchDelay(e.target.value)} className="form-control" />
            </div>
            <div className="form-group mb-2">
              <label>Quick Add Pages</label>
              <input
                type="number"
                value={quickAddPages}
                onChange={(e) => setQuickAddPages(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group mb-2">
              <label>Users Sent in Request</label>
              <input
                type="number"
                value={usersSentInRequest}
                onChange={(e) => setUsersSentInRequest(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                className="form-control"
                min="0"
              />
            </div>
            <div className="form-check mb-2">
              <input type="checkbox" className="form-check-input" checked={argoTokens} onChange={(e) => setArgoTokens(e.target.checked)} />
              <label className="form-check-label">Use Argo Tokens</label>
            </div>
            <div className="form-group mb-2">
              <label>Max Rejection Rate</label>
              <input
                type="number"
                value={weightRejectingRate}
                onChange={(e) => setWeightRejectingRate(e.target.value === '' ? '' : Math.max(0, Math.min(1, parseFloat(e.target.value))))}
                className="form-control"
                min="0"
                max="1"
                step="0.01"
              />
            </div>
            <div className="form-group mb-2">
              <label>Min Conversation Rate</label>
              <input
                type="number"
                value={weightConversationRate}
                onChange={(e) => setWeightConversationRate(e.target.value === '' ? '' : Math.max(0, Math.min(1, parseFloat(e.target.value))))}
                className="form-control"
                min="0"
                max="1"
                step="0.01"
              />
            </div>
            <div className="form-group mb-2">
              <label>Min Conversion Rate</label>
              <input
                type="number"
                value={weightConversionRate}
                onChange={(e) => setWeightConversionRate(e.target.value === '' ? '' : Math.max(0, Math.min(1, parseFloat(e.target.value))))}
                className="form-control"
                min="0"
                max="1"
                step="0.01"
              />
            </div>
          </div>
        );
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
        setSourcesOptions(sources.map((source: string) => ({
          value: source,
          label: source
        })));
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

  const configurationOptions = renderConfigurationOptions();

  return (
    <div className="container-fluid p-4">
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Jobs</h1>
        <Button variant="primary" onClick={handleShow}>
          Create New Job
        </Button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="alert alert-info">No jobs available.</div>
      ) : (
        <div className="row">
          {jobs.map((job) => (
            <div key={job.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                    <h5 className="card-title mb-0">{job.name}</h5>
                    <div className="d-flex gap-2 flex-wrap">
                      <button 
                        className={`btn btn-sm ${job.status === 'ACTIVE' ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleStatusUpdate(job.id, job.status)}
                      >
                        {job.status === 'ACTIVE' ? 'Stop' : 'Activate'}
                      </button>
                      <button 
                        className="btn btn-info btn-sm"
                        onClick={() => handleViewExecutions(job.id)}
                        title="View Executions"
                      >
                        <i className="bi bi-eye-fill"></i>
                      </button>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEdit(job)}
                        title="Edit Job"
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleCopy(job)}
                        title="Copy Job"
                      >
                        <i className="bi bi-files"></i>
                      </button>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => handleDeleteJob(job.id)}
                        title="Delete Job"
                      >
                        <i className="bi bi-trash3-fill"></i>
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedJobId(job.id);
                          fetchAssociatedUsernamesHandler(job.id);
                        }}
                        title="View Associated Usernames"
                      >
                        <i className="bi bi-people-fill"></i>
                      </button>
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className={`badge bg-${job.status === 'ACTIVE' ? 'success' : 'secondary'} me-2`}>
                      {job.status}
                    </span>
                    <span className="badge bg-info">{job.type}</span>
                  </div>
                  <p className="card-text">
                    <small className="text-muted">
                      <strong>Cron:</strong> {job.cron_expression}
                      {job.start_date && (
                        <>
                          <br />
                          <strong>Start Date:</strong> {new Date(job.start_date).toLocaleString()}
                        </>
                      )}
                    </small>
                  </p>
                  
                  {/* Filtering Settings */}
                  {job.statuses && job.statuses.length > 0 && (
                    <div className="mb-2">
                      <strong className="d-block mb-1">Account Statuses:</strong>
                      <div className="d-flex flex-wrap gap-1">
                        {job.statuses.map((status: string) => (
                          <span key={status} className="badge bg-primary">{status}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {job.tags && job.tags.length > 0 && (
                    <div className="mb-2">
                      <strong className="d-block mb-1">Tags:</strong>
                      <div className="d-flex flex-wrap gap-1">
                        {job.tags.map((tag: string) => (
                          <span key={tag} className="badge bg-info">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sources */}
                  {job.sources && job.sources.length > 0 && (
                    <div className="mb-2">
                      <strong className="d-block mb-1">Sources:</strong>
                      <div className="d-flex flex-wrap gap-1">
                        {job.sources.map((source: string) => (
                          <span key={source} className="badge bg-secondary">{source}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Configuration Details */}
                  {job.type !== 'COMPUTE_STATISTICS' && (
                    <div className="mb-2">
                      <strong className="d-block mb-1">Configuration:</strong>
                      <div className="small">
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
                            <div key={key} className="mb-1 text-break">
                              <strong>
                                {key
                                  .split('_')
                                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                  .join(' ')}
                                :
                              </strong>{' '}
                              {typeof value === 'boolean' ? value.toString() : String(value)}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Job' : 'Create New Job'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Job Name</label>
            <input type="text" name="name" placeholder="Job Name" value={newJob.name} onChange={handleInputChange} className="form-control" />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Statuses</label>
            <Select
              isMulti
              name="statuses"
              options={statusesOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={handleStatusesChange}
              value={statusesOptions.filter(option => newJob.statuses.includes(option.value))}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Tags</label>
            <Select
              isMulti
              name="tags"
              options={tagsOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={handleTagsChange}
              value={tagsOptions.filter(option => newJob.tags.includes(option.value))}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Sources</label>
            <Select
              isMulti
              options={sourcesOptions}
              value={sourcesOptions.filter(option => 
                newJob.sources.includes(option.value)
              )}
              onChange={handleSourcesChange}
              className="basic-multi-select"
              classNamePrefix="select"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Cron Expression</label>
            <input type="text" name="cron_expression" placeholder="0 0 * * *" value={newJob.cron_expression} onChange={handleInputChange} className="form-control" />
          </div>

          <div className="mb-3">
            <label className="form-label">Type</label>
            <Select
              name="type"
              options={typeOptions}
              className="basic-single"
              classNamePrefix="select"
              onChange={handleTypeChange}
              value={typeOptions.find(option => option.value === newJob.type)}
            />
          </div>

          {newJob.type && configurationOptions && (
            <div className="mb-3">
              <label className="form-label">Configuration</label>
              <div className="card">
                <div className="card-body">
                  {configurationOptions}
                </div>
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">First Execution</label>
            <div>
              <div className="form-check mb-2">
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
              <div className="form-check mb-2">
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
              <div className="form-check mb-2">
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
              {firstExecutionOption === 'datetime' && (
                <input
                  type="datetime-local"
                  className="form-control mt-2"
                  value={firstExecutionTime}
                  onChange={(e) => setFirstExecutionTime(e.target.value)}
                />
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateOrUpdateJob}>
            {isEditing ? 'Update Job' : 'Create Job'}
          </Button>
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
                    href={`/snapchat-account/${account.id}`}
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
          <Button variant="secondary" onClick={() => setShowUsernamesModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Jobs; 