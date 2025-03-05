import React, { useState, useEffect, useMemo } from 'react';
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
  GridRenderCellParams,
  GridSelectionModel,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridFooterContainer,
  GridFooter
} from '@mui/x-data-grid';

import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'; // Keeping Reactstrap dropdown
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// If you still want to keep Reactstrap styling for the dropdown, leave this import.
// Otherwise, remove if you plan to migrate that too.
import 'bootstrap/dist/css/bootstrap.min.css';

import './ManualOperations.css';

import InfoModal from '../Modal';
import TagCell from '../common/TagCell';
import { fetchAccounts, updateAccount } from '../../services/accountsService';
import { executeOperation } from '../../services/executionService';
import { fetchTags } from '../../services/tagsService';

import { Box, Button, Typography } from '@mui/material'; // MUI for layout & styling

// Define the Account interface
interface Account {
  id: string;
  username: string;
  snapchat_link?: string;
  two_fa_secret?: string;
  email?: string;
  email_password?: string;
  creation_date?: string;
  added_to_system_date?: string;
  proxy?: { id: number; host: string; port: string };
  status?: string;
  tags?: string[];
  account_source?: string;
  workflow_id?: string;
}

// MUI DataGrid Custom Toolbar
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

// Optional custom footer
function CustomFooter() {
  return (
    <GridFooterContainer>
      <GridFooter />
      {/* Additional info or row counts can go here */}
    </GridFooterContainer>
  );
}

const ManualOperations: React.FC = () => {
  const navigate = useNavigate();
  const { agencyId } = useParams<{ agencyId: string }>();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Operation-related states
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
      email: true,
      email_password: true,
      creation_date: true,
      added_to_system_date: true,
      proxy: true,
      status: true,
      tags: true,
      account_source: true,
      workflow: true,
      actions: true,
    };
  };
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<Record<string, boolean>>(initialColumnVisibility);

  // Reactstrap dropdown usage
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  // Modal logic
  const [modalContent, setModalContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = (content: string) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  // Load accounts on mount
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
  }, [agencyId, navigate]);

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
  }, [agencyId]);

  // Save column visibility
  useEffect(() => {
    localStorage.setItem(
      'manualOperationsColumnVisibilityConfig',
      JSON.stringify(columnVisibilityModel)
    );
  }, [columnVisibilityModel]);

  // Validate weights for generate_leads
  const validateWeights = () => {
    const totalWeight =
      Number(weightRejectingRate) + Number(weightConversationRate) + Number(weightConversionRate);
    return (
      totalWeight === 1 &&
      Number(weightRejectingRate) >= 0 && Number(weightRejectingRate) <= 1 &&
      Number(weightConversationRate) >= 0 && Number(weightConversationRate) <= 1 &&
      Number(weightConversionRate) >= 0 && Number(weightConversionRate) <= 1
    );
  };

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
      await updateAccount(agencyId, rowId, { tags: newTags });

      // Merge newly created tags
      const newlyCreated = newTags.filter((t) => !existingTags.includes(t));
      if (newlyCreated.length > 0) {
        setExistingTags((prev) => [...prev, ...newlyCreated]);
      }

      // Update state
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === rowId ? { ...acc, tags: newTags } : acc))
      );

      toast.success('Tags updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Failed to update tags:', error);
      toast.error('Error updating tags.');
    }
  };

  // Operation submission
  const handleOperationSubmit = async () => {
    // If generate_leads
    if (operationType === 'generate_leads') {
      if (
        accountsNumber === '' ||
        targetLeadNumber === '' ||
        Number(accountsNumber) <= 0 ||
        Number(targetLeadNumber) <= 0
      ) {
        toast.error('Provide valid values for accounts number and target lead number.', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }
      if (!validateWeights()) {
        setWeightError('The sum of weights must be 1, each weight 0–1.');
        return;
      }
      setWeightError('');
    }

    // If not generate_leads & not quick_adds_top_accounts, but no rows selected
    if (
      operationType !== 'generate_leads' &&
      operationType !== 'quick_adds_top_accounts' &&
      selectionModel.length === 0
    ) {
      toast.error('Select at least one record.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    let params: any = {
      userIds: selectionModel,
      operationType,
    };

    // Operation-specific parameters
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
          username,
        };
        break;
      case 'check_conversations':
      case 'status_check':
      case 'set_bitmoji':
      case 'change_bitmoji':
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

      if (result.errorDetail) {
        toast.error(`Payment Required: ${result.errorDetail}`, {
          position: 'top-right',
          autoClose: 5000,
        });
      } else {
        toast.success('Operation executed successfully!', {
          position: 'top-right',
          autoClose: 5000,
        });
      }

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
      console.error('Error executing operation:', error);
      toast.error('An error occurred. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  const columns = useMemo<GridColDef<Account>[]>(() => [
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
          <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'teal' }}>
            {link}
          </a>
        );
      },
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      sortable: true,
      filterable: true,
    },
    {
      field: 'email_password',
      headerName: 'Email Password',
      flex: 1,
      sortable: true,
      filterable: true,
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
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Account>) => {
        const proxy = params.row.proxy;
        return (
          <span
            style={{ color: 'blue', cursor: 'pointer' }}
            onClick={() => openModal(proxy ? JSON.stringify(proxy, null, 2) : 'Not Associated')}
          >
            {proxy ? `${proxy.host}:${proxy.port}` : 'Not Associated'}
          </span>
        );
      },
    },
    {
      field: 'tags',
      headerName: 'Tags',
      flex: 1.5,
      sortable: true,
      filterable: true,
      renderCell: (params: GridRenderCellParams<Account>) => {
        return (
          <TagCell
            row={params.row}
            existingTags={existingTags}
            onTagsUpdate={handleTagsUpdate}
          />
        );
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
        return (
          <span style={{ background: '#0dcaf0', padding: '4px 6px', borderRadius: '4px', color: '#000' }}>
            {value || 'N/A'}
          </span>
        );
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
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              color="info"
              size="small"
              onClick={() => navigate(`/agency/${agencyId}/snapchat-account/${row.id}`)}
            >
              View Details
            </Button>
          </Box>
        );
      },
    },
  ], [agencyId, navigate, openModal, existingTags]);

  // Determine if the submit button is disabled
  const isSubmitDisabled = () => {
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
      if (
        maxRejectionRate === null ||
        minConversationRate === null ||
        minConversionRate === null
      ) {
        return true;
      }
      return false;
    }
    if (
      operationType !== 'generate_leads' &&
      operationType !== 'quick_adds_top_accounts' &&
      selectionModel.length === 0
    ) {
      return true;
    }
    if (
      operationType === 'quick_adds' &&
      (requests === null || requests === undefined || requests === '')
    ) {
      return true;
    }
    if (operationType === 'send_to_user' && (!username || username.trim() === '')) {
      return true;
    }
    return !operationType;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      <ToastContainer />

      {/* Operation Selection Area */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Manual Operations
        </Typography>

        <select
          value={operationType}
          onChange={(e) => setOperationType(e.target.value)}
          style={{ padding: '4px', marginBottom: '8px' }}
        >
          <option value="">--Choose--</option>
          <option value="quick_adds">Quick Adds</option>
          <option value="send_to_user">Send to User</option>
          <option value="check_conversations">Check Conversations</option>
          <option value="status_check">Check Status</option>
          <option value="compute_statistics">Compute Statistics</option>
          {/* <option value="generate_leads">Generate Leads</option>
          <option value="consume_leads">Consume Leads</option>
          <option value="quick_adds_top_accounts">Quick Adds Top Accounts</option> */}
          <option value="set_bitmoji">Set Bitmoji</option>
          <option value="change_bitmoji">Change Bitmoji</option>
        </select>

        {/* Operation-specific forms, same code but replaced "form-control" with inline style */}
        {operationType === 'quick_adds' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Number of Quick Adds to Send from Each Account:
            </Typography>
            <input
              type="number"
              value={requests}
              onChange={(e) => setRequests(e.target.value)}
              style={{ padding: '4px' }}
            />
          </Box>
        )}

        {operationType === 'send_to_user' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Username to Receive Quick Add Requests:
            </Typography>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ padding: '4px' }}
            />
          </Box>
        )}

        {operationType === 'generate_leads' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">Accounts Number:</Typography>
            <input
              type="number"
              value={accountsNumber}
              onChange={(e) => setAccountsNumber(e.target.value)}
              style={{ padding: '4px', marginBottom: '8px' }}
            />
            <Typography variant="body1">Target Lead Number:</Typography>
            <input
              type="number"
              value={targetLeadNumber}
              onChange={(e) => setTargetLeadNumber(e.target.value)}
              style={{ padding: '4px', marginBottom: '8px' }}
            />
            <Typography variant="body1">Weight Rejecting Rate:</Typography>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={weightRejectingRate}
              onChange={(e) => setWeightRejectingRate(e.target.value)}
              style={{ padding: '4px', marginBottom: '8px' }}
            />
            <Typography variant="body1">Weight Conversation Rate:</Typography>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={weightConversationRate}
              onChange={(e) => setWeightConversationRate(e.target.value)}
              style={{ padding: '4px', marginBottom: '8px' }}
            />
            <Typography variant="body1">Weight Conversion Rate:</Typography>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={weightConversionRate}
              onChange={(e) => setWeightConversionRate(e.target.value)}
              style={{ padding: '4px', marginBottom: '8px' }}
            />
            {weightError && (
              <Box sx={{ color: 'red', mt: 1 }}>
                {weightError}
              </Box>
            )}
          </Box>
        )}

        {/* ... Additional operation forms for quick_adds_top_accounts, consume_leads, etc. go here ... */}

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleOperationSubmit}
          disabled={loading || !operationType || isSubmitDisabled()}
        >
          Submit
        </Button>
      </Box>

      {/* DataGrid Container */}
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <DataGrid
            rows={accounts}
            columns={columns}
            getRowId={(row) => row.id}
            checkboxSelection
            disableSelectionOnClick
            onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
            rowSelectionModel={selectionModel}
            components={{
              Toolbar: CustomToolbar,
              Footer: CustomFooter,
            }}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
            pagination
            pageSize={20}
            rowsPerPageOptions={[20, 50, 100]}
          />
        )}
      </Box>

      {/* Reactstrap Dropdown example – unchanged logic */}
      <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} className="mt-3">
        <DropdownToggle caret>Open Dropdown</DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Header</DropdownItem>
          <DropdownItem>Action 1</DropdownItem>
          <DropdownItem>Action 2</DropdownItem>
          <DropdownItem divider />
          <DropdownItem>Separated Link</DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* Modal for info */}
      <InfoModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        content={modalContent}
      />
    </Box>
  );
};

export default ManualOperations;
