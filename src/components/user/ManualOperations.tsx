import React, { useState, useEffect, useMemo } from 'react';
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
  GridRenderCellParams,
  GridSelectionModel,
  GridToolbar,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridFooterContainer,
  GridFooter
} from '@mui/x-data-grid';
import TagCell from '../common/TagCell';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import InfoModal from '../Modal';
import { fetchAccounts, updateAccount } from '../../services/accountsService';
import { executeOperation } from '../../services/executionService';
import { fetchTags } from '../../services/tagsService';
import { useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ManualOperations.css';

// Define the Account interface
interface Account {
  id: string;
  username: string;
  snapchat_link?: string;
  two_fa_secret?: string;
  creation_date?: string;
  added_to_system_date?: string;
  proxy?: { id: number; host: string };
  // device?: { id: number; data: string };
  // cookies?: { data: string };
  // model?: {
  //   id: number;
  //   name: string;
  //   onlyfans_url: string;
  // };
  // chat_bot?: { id: number; type: string };
  status?: string;
  tags?: string[];
  account_source?: string;
  workflow_id?: string;
}

// MUI DataGrid Custom Toolbar (sorting, filtering, density, export)
function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

// Optional custom footer if you want to add row count, etc.
function CustomFooter() {
  return (
    <GridFooterContainer>
      <GridFooter />
      {/* You can add extra elements here, e.g. "Total Rows: X" */}
    </GridFooterContainer>
  );
}

const ManualOperations: React.FC = () => {
  const navigate = useNavigate();
  const { agencyId } = useParams<{ agencyId: string }>();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // For the advanced operation form (quick_adds, etc.)
  const [operationType, setOperationType] = useState('');
  const [startingDelay, setStartingDelay] = useState<number | string>(30);
  const [requests, setRequests] = useState<number | string>(20);
  const [batches, setBatches] = useState<number | string>(1);
  const [batchDelay, setBatchDelay] = useState<number | string>(10);
  const [quickAddPages, setQuickAddPages] = useState<number | string>(10);
  const [username, setUsername] = useState('');
  const [usersSentInRequest, setUsersSentInRequest] = useState<number | string>(1);
  const [argoTokens, setArgoTokens] = useState<boolean>(true);

  // For generate_leads
  const [accountsNumber, setAccountsNumber] = useState<number | string>(5);
  const [targetLeadNumber, setTargetLeadNumber] = useState<number | string>(30);
  const [weightRejectingRate, setWeightRejectingRate] = useState<number | string>(0.6);
  const [weightConversationRate, setWeightConversationRate] = useState<number | string>(0.4);
  const [weightConversionRate, setWeightConversionRate] = useState<number | string>(0);
  const [maxRejectionRate, setMaxRejectionRate] = useState<number | null>(0.6);
  const [minConversationRate, setMinConversationRate] = useState<number | null>(0.6);
  const [minConversionRate, setMinConversionRate] = useState<number | null>(0.1);
  const [weightError, setWeightError] = useState('');

  // For row selection in MUI DataGrid
  const [selectionModel, setSelectionModel] = useState<GridSelectionModel>([]);

  // For Tag editing
  const [existingTags, setExistingTags] = useState<string[]>([]);

  // For column visibility
  const initialColumnVisibility = () => {
    const savedConfig = localStorage.getItem('manualOperationsColumnVisibilityConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    // Default: all columns visible
    return {
      username: true,
      snapchat_link: true,
      two_fa_secret: true,
      creation_date: true,
      added_to_system_date: true,
      proxy: true,
      device: true,
      cookies: true,
      // model: true,
      // chat_bot: true,
      status: true,
      tags: true,
      account_source: true,
      workflow: true,
      actions: true, // for the actions column
    };
  };
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>(
    initialColumnVisibility
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  // Modal logic
  const [modalContent, setModalContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = (content: string) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  // Load data on mount
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const statuses = ['GOOD_STANDING', 'RECENTLY_INGESTED', 'CAPTCHA'];
        const data = await fetchAccounts(
          agencyId,
          navigate,
          undefined,
          undefined,
          undefined,
          true,
          undefined,
          undefined,
          statuses
        );
        setAccounts(data);
      } catch (error) {
        console.error('Failed to load accounts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAccounts();
  }, [navigate]);

  // Load existing tags
  useEffect(() => {
    if (!agencyId) {
      console.error('Agency ID is undefined');
      return;
    }
    const loadTags = async () => {
      try {
        const tags = await fetchTags(agencyId);
        setExistingTags(tags);
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };
    loadTags();
  }, []);

  // Save column visibility to localStorage
  useEffect(() => {
    localStorage.setItem('manualOperationsColumnVisibilityConfig', JSON.stringify(columnVisibilityModel));
  }, [columnVisibilityModel]);

  // Validate weights for generate_leads
  const validateWeights = () => {
    const totalWeight =
      Number(weightRejectingRate) +
      Number(weightConversationRate) +
      Number(weightConversionRate);
    return (
      totalWeight === 1 &&
      Number(weightRejectingRate) >= 0 &&
      Number(weightRejectingRate) <= 1 &&
      Number(weightConversationRate) >= 0 &&
      Number(weightConversationRate) <= 1 &&
      Number(weightConversionRate) >= 0 &&
      Number(weightConversionRate) <= 1
    );
  };

  // Add validation logic for maxRejectionRate, minConversationRate, and minConversionRate
  const validateRates = (value: number) => {
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
  };

  const handleTagsUpdate = async (rowId: string, newTags: string[]) => {
    try {
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      // 1. Call your updateAccount or similar service
      await updateAccount(agencyId, rowId, {
        tags: newTags,
        // Add other fields as needed (model_id, chatbot_id, etc.)
      });
  
      // 2. Merge newly created tags into existingTags
      const newlyCreated = newTags.filter((t) => !existingTags.includes(t));
      if (newlyCreated.length > 0) {
        setExistingTags((prev) => [...prev, ...newlyCreated]);
      }
  
      // 3. Update only the specific row data in accounts
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === rowId ? { ...acc, tags: newTags } : acc))
      );
  
      toast.success('Tags updated successfully!',{
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error('Failed to update tags:', error);
      toast.error('Error updating tags.');
    }
  };

  // Handle operation submission
  const handleOperationSubmit = async () => {
    // If generate_leads
    if (operationType === 'generate_leads') {
      if (
        accountsNumber === '' ||
        targetLeadNumber === '' ||
        Number(accountsNumber) <= 0 ||
        Number(targetLeadNumber) <= 0
      ) {
        toast.error('Please provide valid values for accounts number and target lead number.', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }
      if (!validateWeights()) {
        setWeightError('The sum of weights must equal 1, and each weight between 0 and 1.');
        return;
      }
      setWeightError('');
    }

    // If NOT generate_leads but no selected rows
    if (operationType !== 'generate_leads' && operationType !== 'quick_adds_top_accounts' && selectionModel.length === 0) {
      toast.error('Please select at least one record.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    let params: any = {
      userIds: selectionModel,
      operationType,
    };

    // Add operation-specific parameters
    switch (operationType) {
      case 'quick_adds':
        params = {
          ...params,
          startingDelay: Number(startingDelay),
          requests: Number(requests),
          batches: Number(batches),
          batchDelay: Number(batchDelay),
          quickAddPages: Number(quickAddPages),
          usersSentInRequest: Number(usersSentInRequest),
          argoTokens: argoTokens,
        };
        break;
      case 'quick_adds_top_accounts':
        params = {
          ...params,
          startingDelay: Number(startingDelay),
          requests: Number(requests),
          batches: Number(batches),
          batchDelay: Number(batchDelay),
          quickAddPages: Number(quickAddPages),
          usersSentInRequest: Number(usersSentInRequest),
          argoTokens: argoTokens,
          max_rejection_rate: maxRejectionRate,
          min_conversation_rate: minConversationRate,
          min_conversion_rate: minConversionRate,
        };
        break;
      case 'send_to_user':
        params = {
          ...params,
          startingDelay: Number(startingDelay),
          username: username,
        };
        break;
      case 'check_conversations':
      case 'status_check':
        params = {
          ...params,
          startingDelay: Number(startingDelay),
        };
        break;
      case 'compute_statistics':
        params = { ...params };
        break;
      case 'generate_leads':
        params = {
          ...params,
          accountsNumber: Number(accountsNumber),
          targetLeadNumber: Number(targetLeadNumber),
          weightRejectingRate: Number(weightRejectingRate),
          weightConversationRate: Number(weightConversationRate),
          weightConversionRate: Number(weightConversionRate),
        };
        break;
      case 'consume_leads':
        params = {
          ...params,
          startingDelay: Number(startingDelay),
          requests: Number(requests),
          batches: Number(batches),
          batchDelay: Number(batchDelay),
          usersSentInRequest: Number(usersSentInRequest),
          argoTokens: argoTokens,
        };
        break;
      default:
        break;
    }

    try {
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      const result = await executeOperation(agencyId, params);
      console.log('Execution result:', result);
      toast.success('Operation executed successfully.', {
        position: 'top-right',
        autoClose: 3000,
      });

      // Reset fields
      setOperationType('');
      setStartingDelay(30);
      setRequests(20);
      setBatches(1);
      setBatchDelay(10);
      setQuickAddPages(10);
      setUsername('');
      setSelectionModel([]);
    } catch (error) {
      toast.error('Failed to execute operation. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
      console.error(error);
    }
  };

  // MUI DataGrid columns
  const columns = useMemo<GridColDef<Account>[]>(
    () => [
      // CheckBox selection is handled automatically by MUI if we set `checkboxSelection`.
      {
        field: 'username',
        headerName: 'Username',
        flex: 1,
        sortable: true,
        filterable: true,
        renderCell: (params: GridRenderCellParams<Account>) => {
          const row = params.row;
          return (
            <a
              href={`/agency/${agencyId}/snapchat-account/${row.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline', color: 'blue' }}
            >
              {row.username}
            </a>
          );
        },
      },
      // {
      //   field: 'model',
      //   headerName: 'Model',
      //   flex: 1,
      //   sortable: true,
      //   filterable: true,
      //   valueGetter: (params: GridValueGetterParams<Account, any>) => {
      //     return params?.name || 'Not Available';
      //   },
      // },
      // {
      //   field: 'chat_bot',
      //   headerName: 'ChatBot',
      //   flex: 1,
      //   sortable: true,
      //   filterable: true,
      //   valueGetter: (params: GridValueGetterParams<Account, any>) => {
      //     return params?.type || 'Not Available';
      //   },
      // },
      {
        field: 'snapchat_link',
        headerName: 'Snapchat Link',
        flex: 1.3,
        sortable: true,
        filterable: true,
        renderCell: (params: GridRenderCellParams<Account>) => {
          const link = params.row.snapchat_link;
          if (!link) return 'Not Available';
          return (
            <a href={link} target="_blank" rel="noopener noreferrer" className="snapchat-link">
              {link}
            </a>
          );
        },
      },
      {
        field: 'two_fa_secret',
        headerName: '2FA Secret',
        flex: 1,
        sortable: true,
        filterable: true,
      },
      {
        field: 'creation_date',
        headerName: 'Creation Date',
        flex: 1,
        sortable: true,
        filterable: true,
      },
      {
        field: 'added_to_system_date',
        headerName: 'Added to System Date',
        flex: 1,
        sortable: true,
        filterable: true,
      },
      {
        field: 'proxy',
        headerName: 'Proxy',
        flex: 1,
        renderCell: (params: GridRenderCellParams<Account>) => {
          const proxy = params.row.proxy;
          return (
            <span
              className="clickable-cell"
              onClick={() => openModal(proxy ? JSON.stringify(proxy, null, 2) : 'Not Associated')}
            >
              {proxy ? proxy.host : 'Not Associated'}
            </span>
          );
        },
      },
      // {
      //   field: 'device',
      //   headerName: 'Device Model',
      //   flex: 1,
      //   renderCell: (params: GridRenderCellParams<Account>) => {
      //     const device = params.row.device;
      //     if (!device) return 'Not Associated';
      //     try {
      //       const deviceObj = JSON.parse(device.data);
      //       return (
      //         <span className="clickable-cell" onClick={() => openModal(device.data)}>
      //           {deviceObj.device_model || 'Unknown Model'}
      //         </span>
      //       );
      //     } catch {
      //       return 'Invalid Device Data';
      //     }
      //   },
      // },
      // {
      //   field: 'cookies',
      //   headerName: 'Cookies',
      //   flex: 1,
      //   renderCell: (params: GridRenderCellParams<Account>) => {
      //     const cookies = params.row.cookies;
      //     return (
      //       <span className="clickable-cell" onClick={() => openModal(cookies ? cookies.data : 'Not Associated')}>
      //         {cookies ? 'View Cookies' : 'Not Associated'}
      //       </span>
      //     );
      //   },
      // },
      {
        field: 'tags',
        headerName: 'Tags',
        flex: 1.5,
        sortable: true,
        filterable: true,
        renderCell: (params: GridRenderCellParams<Account>) => {
          return (<TagCell
            row={params.row}
            existingTags={existingTags}
            onTagsUpdate={handleTagsUpdate}
          />);
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 1,
        sortable: true,
        filterable: true,
        renderCell: (params: GridRenderCellParams<Account>) => {
          const status = params.row.status;
          const getStatusClass = (st: string | undefined) => {
            switch (st) {
              case 'RECENTLY_INGESTED':
                return 'status-recently-ingested';
              case 'GOOD_STANDING':
                return 'status-good-standing';
              case 'LOCKED':
                return 'status-locked';
              case 'TERMINATED':
                return 'status-terminated';
              default:
                return 'status-unknown';
            }
          };
          return <span className={getStatusClass(status)}>{status || 'Unknown'}</span>;
        },
      },
      {
        field: 'account_source',
        headerName: 'Source',
        flex: 1,
        renderCell: (params: GridRenderCellParams<Account>) => {
          const value = params.row.account_source;
          return <span className="badge bg-info">{value || 'N/A'}</span>;
        },
      },
      {
        field: 'workflow',
        headerName: 'Workflow',
        flex: 1,
        sortable: true,
        filterable: true,
        valueGetter: (params: GridValueGetterParams<Account, any>) => {
          return params?.name || 'No Workflow';
        },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        flex: 1.3,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<Account>) => {
          const row = params.row;
          return (
            <div className="d-flex gap-2">
              <button
                onClick={() => navigate(`/agency/${agencyId}/snapchat-account/${row.id}`)}
                className="btn btn-sm btn-info"
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                View Details
              </button>
            </div>
          );
        },
      },
    ],
    [navigate, openModal]
  );

  const isSubmitDisabled = () => {

    // If generate_leads
    if (operationType === 'generate_leads') {
      const totalWeight =
        Number(weightRejectingRate) +
        Number(weightConversationRate) +
        Number(weightConversionRate);
      if (
        !(
          totalWeight === 1 &&
          totalWeight <= 1 &&
          Number(accountsNumber) > 0 &&
          Number(targetLeadNumber) > 0
        )
      ) {
        return true;
      }
      return false;
    }
    if (operationType === 'quick_adds_top_accounts') {
      if (maxRejectionRate === null || minConversationRate === null || minConversionRate === null) {
        return true;
      }
      return false;
    }
    if(selectionModel.length === 0) {
      return true;
    }
    if (operationType === 'quick_adds') {
      if (requests === null || requests === undefined || requests === '') {
        return true;
      }
      return false;
    }
    if (operationType === 'send_to_user') {
      if (username === null || username === undefined || username === '') {
        return true;
      }
      return false;
    }
    
    // If not generate_leads and no selected rows
    if (operationType && operationType !== 'generate_leads' && selectionModel.length === 0) {
      return true;
    }
    return false;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <ToastContainer />

      {/* Operation selection & parameters */}
      <div className="operation-select mb-3">
        <h2>Manual Operations</h2>
        <select
          value={operationType}
          onChange={(e) => setOperationType(e.target.value)}
          className="form-control mb-2"
        >
          <option value="">Select Operation</option>
          <option value="quick_adds">Quick Adds</option>
          <option value="send_to_user">Send to User</option>
          <option value="check_conversations">Check Conversations</option>
          <option value="status_check">Check Status</option>
          <option value="compute_statistics">Compute Statistics</option>
          {/* <option value="generate_leads">Generate Leads</option>
          <option value="consume_leads">Consume Leads</option>
          <option value="quick_adds_top_accounts">Quick Adds Top Accounts</option>   */}
          <option value="set_bitmoji">Set Bitmoji</option>
          <option value="change_bitmoji">Change Bitmoji</option>
        </select>

        {/* Your operation-specific UI (similar to your existing code) */}
        {operationType === 'quick_adds' && (
          <div className="configuration-container">
            {/* startingDelay, requests, batches, batchDelay, quickAddPages, usersSentInRequest, argoTokens */}
            {/* <div>
              <label>Max Starting Delay (seconds):</label>
              <input
                type="number"
                value={startingDelay}
                onChange={(e) => setStartingDelay(e.target.value)}
                className="form-control"
              />
            </div> */}
            <div>
              <label>Number of Quick Adds to Send from Each Account:</label>
              <input
                type="number"
                value={requests}
                onChange={(e) => setRequests(e.target.value)}
                className="form-control"
              />
            </div>
            {/* <div>
              <label>Batches:</label>
              <input
                type="number"
                value={batches}
                onChange={(e) => setBatches(e.target.value)}
                className="form-control"
              />
            </div> */}
            {/* <div>
              <label>Batch Delay (seconds):</label>
              <input
                type="number"
                value={batchDelay}
                onChange={(e) => setBatchDelay(e.target.value)}
                className="form-control"
              />
            </div> */}
            {/* <div>
              <label>Max Quick Add Pages:</label>
              <input
                type="number"
                value={quickAddPages}
                onChange={(e) => setQuickAddPages(e.target.value)}
                className="form-control"
              />
            </div> */}
            {/* <div>
              <label>Users Sent in Request:</label>
              <input
                type="number"
                value={usersSentInRequest}
                onChange={(e) => setUsersSentInRequest(e.target.value)}
                className="form-control"
              />
            </div> */}
            {/* <div>
              <label>Use Argo Tokens:</label>
              <input
                type="checkbox"
                checked={argoTokens}
                onChange={(e) => setArgoTokens(e.target.checked)}
              />
            </div> */}
          </div>
        )}
        {operationType === 'send_to_user' && (
          <div className="configuration-container">
            <div>
              <label>Username to Receive Quick Add Requests:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-control"
              />
            </div>
            {/* <div>
              <label>Max Starting Delay (seconds):</label>
              <input
                type="number"
                value={startingDelay}
                onChange={(e) => setStartingDelay(e.target.value)}
                className="form-control"
              />
            </div> */}
          </div>
        )}
        {/* {(operationType === 'check_conversations' || operationType === 'status_check' || operationType === 'set_bitmoji' || operationType === 'change_bitmoji') && (
          <div>
            <label>Max Starting Delay (seconds):</label>
            <input
              type="number"
              value={startingDelay}
              onChange={(e) => setStartingDelay(e.target.value)}
              className="form-control"
            />
          </div>
        )} */}
        {operationType === 'compute_statistics' && (
          <p>Compute statistics will run on all selected accounts.</p>
        )}
        {operationType === 'generate_leads' && (
          <div className="configuration-container">
          <div>
            <label>Accounts Number:</label>
            <input
              type="number"
              value={accountsNumber}
              onChange={(e) => setAccountsNumber(e.target.value)}
              className="form-control"
            />
          </div>
          <div>
            <label>Target Lead Number:</label>
            <input
              type="number"
              value={targetLeadNumber}
              onChange={(e) => setTargetLeadNumber(e.target.value)}
              className="form-control"
            />
          </div>
          <div>
            <label>Weight Rejecting Rate:</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={weightRejectingRate}
              onChange={(e) => setWeightRejectingRate(e.target.value)}
              className="form-control"
            />
          </div>
          <div>
            <label>Weight Conversation Rate:</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={weightConversationRate}
              onChange={(e) => setWeightConversationRate(e.target.value)}
              className="form-control"
            />
          </div>
          <div>
            <label>Weight Conversion Rate:</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={weightConversionRate}
              onChange={(e) => setWeightConversionRate(e.target.value)}
              className="form-control"
            />
            {weightError && <div className="alert alert-danger">{weightError}</div>}
          </div>
          </div>
        )}
        {operationType === 'consume_leads' && (
          <div className="configuration-container">
          <div>
            <label>Max Starting Delay (seconds):</label>
            <input
              type="number"
              value={startingDelay}
              onChange={(e) => setStartingDelay(e.target.value)}
              className="form-control"
            />
          </div>
          <div>
            <label>Requests (# of accounts to receive add request):</label>
            <input
              type="number"
              value={requests}
              onChange={(e) => setRequests(e.target.value)}
              className="form-control"
            />
          </div>
          <div>
            <label>Batches:</label>
            <input
              type="number"
              value={batches}
                onChange={(e) => setBatches(e.target.value)}
                className="form-control"
              />
            </div>
            <div>
              <label>Batch Delay (seconds):</label>
              <input
              type="number"
              value={batchDelay}
              onChange={(e) => setBatchDelay(e.target.value)}
              className="form-control"
            />
            </div>
            <div>
            <label>Users Sent in Request:</label>
            <input
              type="number"
              value={usersSentInRequest}
              onChange={(e) => setUsersSentInRequest(e.target.value)}
              className="form-control"
            />
            </div>
            <div>
            <label>Use Argo Tokens:</label>
            <input
              type="checkbox"
              checked={argoTokens}
              onChange={(e) => setArgoTokens(e.target.checked)}
              />
            </div>
          </div>
        )}
        {operationType === 'quick_adds_top_accounts' && (
          <div className="configuration-container">
            <div>
              <label>Max Starting Delay (seconds):</label>
              <input
                type="number"
                value={startingDelay}
                onChange={(e) => setStartingDelay(e.target.value)}
                className="form-control"
              />
            </div>
            <div>
              <label>Requests (# of accounts to receive add request):</label>
              <input
                type="number"
                value={requests}
                onChange={(e) => setRequests(e.target.value)}
                className="form-control"
              />
            </div>
            <div>
              <label>Batches:</label>
              <input
                type="number"
                value={batches}
                onChange={(e) => setBatches(e.target.value)}
                className="form-control"
              />
            </div>
            <div>
              <label>Batch Delay (seconds):</label>
              <input
                type="number"
                value={batchDelay}
                onChange={(e) => setBatchDelay(e.target.value)}
                className="form-control"
              />
            </div>
            <div>
              <label>Max Quick Add Pages:</label>
              <input
                type="number"
                value={quickAddPages}
                onChange={(e) => setQuickAddPages(e.target.value)}
                className="form-control"
              />
            </div>
            <div>
              <label>Users Sent in Request:</label>
              <input
                type="number"
                value={usersSentInRequest}
                onChange={(e) => setUsersSentInRequest(e.target.value)}
                className="form-control"
              />
            </div>
            <div>
              <label>Use Argo Tokens:</label>
              <input
                type="checkbox"
                checked={argoTokens}
                onChange={(e) => setArgoTokens(e.target.checked)}
              />
            </div>
            <div>
              <label>Max Rejection Rate:</label>
              <input
                type="number"
                step="0.05"
                value={maxRejectionRate}
                onChange={(e) => setMaxRejectionRate(validateRates(Number(e.target.value)))}
                className="form-control"
              />
            </div>
            <div>
              <label>Min Conversation Rate:</label>
              <input
                type="number"
                step="0.05"
                value={minConversationRate}
                onChange={(e) => setMinConversationRate(validateRates(Number(e.target.value)))}
                className="form-control"
              />
            </div>
            <div>
              <label>Min Conversion Rate:</label>
              <input
                type="number"
                step="0.05"
                value={minConversionRate}
                onChange={(e) => setMinConversionRate(validateRates(Number(e.target.value)))}
                className="form-control"
              />
            </div>
          </div>
        )}
        <button
          onClick={handleOperationSubmit}
          className="btn btn-primary mt-2"
          disabled={loading || !operationType || isSubmitDisabled()}
        >
          Submit
        </button>
      </div>

      <div className="table-container flex-grow-1" style={{ width: '100%' }}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <DataGrid
            rows={accounts}
            columns={columns}
            getRowId={(row) => row.id}
            autoHeight={false}
            disableSelectionOnClick
            checkboxSelection
            onRowSelectionModelChange={(newSelection) => {
              setSelectionModel(newSelection);
            }}
            selectionModel={selectionModel}
            components={{
              Toolbar: CustomToolbar,
              Footer: CustomFooter
            }}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
            pagination
            pageSize={20}
            rowsPerPageOptions={[20, 50, 100]}
          />
        )}
      </div>

      <InfoModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        content={modalContent}
      />
    </div>
  );
};

export default ManualOperations;
