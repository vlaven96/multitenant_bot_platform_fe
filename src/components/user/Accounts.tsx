import React, { useState, useEffect, useMemo } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridFooterContainer,
  GridFooter
} from '@mui/x-data-grid';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import InfoModal from '../Modal';
import AddAccountModal from './modals/AddAccountModal';
import TerminateAccountsModal from './modals/TerminateAccountsModal';
import TagCell from '../common/TagCell';

import {
  fetchAccounts,
  terminateAccount,
  updateAccount,
  fetchTerminationCandidates,
  terminateMultipleAccounts
} from '../../services/accountsService';
import { fetchTags } from '../../services/tagsService';
import { bulkUpdateAccounts } from '../../services/accountsService'; // Bulk update service
import BulkUpdateModal from './modals/BulkUpdateModal'; // Import new BulkUpdateModal

import './Accounts.css';

// Define the Account interface
interface Account {
  id: string;
  username: string;
  password?: string;
  snapchat_link?: string;
  two_fa_secret?: string;
  creation_date?: string;
  added_to_system_date?: string;
  proxy?: { id: number; host: string };
  // device?: { data: string };
  // cookies?: { data: string };
  account_executions?: { status: string }[];
  // model?: { id: number; name: string };
  // chat_bot?: { id: number; type: string };
  status?: string;
  tags?: string[];
  account_source?: string;
  workflow_id?: string;
}

// Custom MUI DataGrid toolbar
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

// Custom footer for row counts, pagination, etc.
function CustomFooter() {
  return (
    <GridFooterContainer>
      <GridFooter />
      <div style={{ marginLeft: '16px', fontWeight: 'bold' }}>
        {/* Additional row count or custom info can go here */}
      </div>
    </GridFooterContainer>
  );
}

function Accounts() {
  const navigate = useNavigate();
  const { agencyId } = useParams<{ agencyId: string }>();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [modalContent, setModalContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [terminationCandidates, setTerminationCandidates] = useState<
    Array<{ id: string; username: string; status: string }>
  >([]);

  // For dropdown example (not strictly needed for the new feature)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  // For bulk update
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);

  // Selected rows in the DataGrid
  const [selectionModel, setSelectionModel] = useState<string[]>([]);

  // For TagCell
  const [existingTags, setExistingTags] = useState<string[]>([]);

  // For columnVisibilityModel in MUI DataGrid
  const initialColumnVisibility = () => {
    const savedConfig = localStorage.getItem('columnVisibilityConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    // Default: all columns visible
    return {
      username: true,
      model: true,
      chat_bot: true,
      password: true,
      snapchat_link: true,
      two_fa_secret: true,
      creation_date: true,
      added_to_system_date: true,
      proxy: true,
      device: true,
      cookies: true,
      status: true,
      account_source: true,
      tags: true,
      account_executions: true,
      actions: true, // for the actions column
      workflow: true,
    };
  };
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<Record<string, boolean>>(initialColumnVisibility);

  // Load accounts on mount
  useEffect(() => {
    const loadAccounts = async () => {
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      try {
        const data = await fetchAccounts(agencyId, () => {});
        setAccounts(data);
      } catch (error) {
        console.error('Failed to load accounts:', error);
      }
    };
    loadAccounts();
  }, [agencyId]);

  // Load tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        const tags = await fetchTags(agencyId);
        setExistingTags(tags);
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };
    loadTags();
  }, []);

  // Save column visibility to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('columnVisibilityConfig', JSON.stringify(columnVisibilityModel));
  }, [columnVisibilityModel]);

  const openModal = (content: string) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const handleOpenTerminateModal = async () => {
    try {
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      const candidates = await fetchTerminationCandidates(agencyId);
      setTerminationCandidates(candidates);
      setIsTerminateModalOpen(true);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to fetch termination candidates';
      toast.error(errorMessage);
    }
  };

  const terminateAccountHandler = async (accountId: string) => {
    if (!agencyId) {
      console.error('Agency ID is undefined');
      return;
    }
    try {
      await terminateAccount(agencyId, accountId);
      toast.success(`Account terminated successfully.`, {
        position: 'top-right',
        autoClose: 3000
      });
      // Optionally refresh the accounts list
      const data = await fetchAccounts(agencyId, () => {});
      setAccounts(data);
    } catch (error) {
      toast.error('Error terminating account. Please try again.', {
        position: 'top-right',
        autoClose: 3000
      });
      console.error('Error terminating account:', error);
    }
  };

  const handleTagsUpdate = async (rowId: string, newTags: string[]) => {
    try {
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      // 1. Call your updateAccount or similar service
      await updateAccount(agencyId, rowId, {
        tags: newTags
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

      toast.success('Tags updated successfully!', {
        position: 'top-right',
        autoClose: 3000
      });
    } catch (error) {
      console.error('Failed to update tags:', error);
      toast.error('Error updating tags.');
    }
  };

  const handleTerminateAccounts = async (selectedAccountIds: string[]) => {
    if (!agencyId) {
      console.error('Agency ID is undefined');
      return;
    }
    try {
      await terminateMultipleAccounts(agencyId, selectedAccountIds);
      setIsTerminateModalOpen(false);
      const data = await fetchAccounts(agencyId, () => {});
      setAccounts(data);
      toast.success('Selected accounts have been terminated successfully', {
        position: 'top-right',
        autoClose: 3000
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to terminate accounts';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  /**
   * Handler for Bulk Update from the modal.
   * Receives an object with the new status, tagsToAdd, tagsToRemove, etc.
   */
  const handleBulkUpdate = async (updates: {
    status?: string;
    tagsToAdd?: string[];
    tagsToRemove?: string[];
    modelId?: number;
    chatBotId?: number;
  }) => {
    if (selectionModel.length === 0) {
      toast.error('No rows selected for bulk update.');
      setIsBulkUpdateModalOpen(false);
      return;
    }
    if (!agencyId) {
      console.error('Agency ID is undefined');
      return;
    }

    try {
      await bulkUpdateAccounts(agencyId, {
        account_ids: selectionModel.map(id => parseInt(id)), // Convert string IDs to numbers
        status: updates.status,
        tags_to_add: updates.tagsToAdd,
        tags_to_remove: updates.tagsToRemove,
        model_id: updates.modelId,
        chat_bot_id: updates.chatBotId,
      });

      toast.success('Bulk update successful!', {
        position: 'top-right',
        autoClose: 3000
      });
      setIsBulkUpdateModalOpen(false);
      setSelectionModel([]);

      // Reload the accounts to reflect changes
      const data = await fetchAccounts(agencyId, () => {});
      setAccounts(data);

      // Update tags in the state
      setAccounts(prevAccounts =>
        prevAccounts.map(account => {
          if (selectionModel.includes(account.id)) {
            const newTags = new Set(account.tags || []);
            updates.tagsToAdd?.forEach(tag => newTags.add(tag));
            updates.tagsToRemove?.forEach(tag => newTags.delete(tag));
            return { ...account, tags: Array.from(newTags) };
          }
          return account;
        })
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to bulk update accounts';
      toast.error(errorMessage);
      console.error('Bulk update error:', error);
    }
  };

  // Define MUI DataGrid columns
  const columns: GridColDef<Account>[] = useMemo(
    () => [
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
        field: 'password',
        headerName: 'Password',
        flex: 1,
        sortable: true,
        filterable: true,
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
        sortable: true,
        renderCell: (params: GridRenderCellParams<Account>) => {
          const proxy = params.row.proxy;
          return (
            <span
              className="clickable-cell"
              role="button"
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
      //       <span
      //         className="clickable-cell"
      //         onClick={() => openModal(cookies ? cookies.data : 'Not Associated')}
      //       >
      //         {cookies ? 'View Cookies' : 'Not Associated'}
      //       </span>
      //     );
      //   },
      // },
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
        field: 'workflow',
        headerName: 'Workflow',
        flex: 1,
        sortable: true,
        filterable: true,
        valueGetter: (params: GridValueGetterParams<Account, any>) => {
          console.log("WORKFLOW_________")
          console.log(params);
          return params?.name || 'No Workflow';
        },
      },
      {
        field: 'account_executions',
        headerName: 'Last Executions',
        flex: 1.3,
        renderCell: (params: GridRenderCellParams<Account>) => {
          const executions = params.row.account_executions || [];
          const getDotColor = (st: string | undefined) => {
            switch (st) {
              case 'DONE':
                return 'green';
              case 'FAILURE':
                return 'red';
              case undefined:
                return 'grey';
              default:
                return 'yellow';
            }
          };
          return (
            <div
              className="clickable-cell"
              onClick={() => openModal(JSON.stringify(executions, null, 2))}
            >
              {[2, 1, 0].map((idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: getDotColor(executions[idx]?.status),
                    margin: '0 2px',
                  }}
                />
              ))}
            </div>
          );
        },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        flex: 1.2,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<Account>) => {
          const row = params.row;
          return (
            <div className="d-flex gap-2">
              <button
                onClick={() => navigate(`/agency/${agencyId}/accounts/edit/${row.id}`)}
                className="btn btn-sm btn-primary"
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                Edit
              </button>
              <button
                onClick={() => terminateAccountHandler(row.id)}
                className="btn btn-sm btn-danger"
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                Terminate
              </button>
              <button
                onClick={() => navigate(`/snapchat-account/${row.id}`)}
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
    [navigate, terminateAccountHandler, openModal, existingTags]
  );

  return (
    <>
      <div className="container-fluid vh-100 d-flex flex-column">
        <div className="row flex-grow-1">
          <div className="col d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h1>Accounts Management (MUI DataGrid)</h1>
              <div className="d-flex gap-2">
                <button onClick={handleOpenTerminateModal} className="btn btn-danger">
                  Terminate Accounts
                </button>
                <button onClick={() => setIsAddAccountModalOpen(true)} className="btn btn-primary">
                  Add Accounts
                </button>
                <button
                  onClick={() => setIsBulkUpdateModalOpen(true)}
                  className="btn btn-warning"
                  disabled={selectionModel.length === 0}
                >
                  Bulk Update
                </button>
              </div>
            </div>

            <div className="table-container flex-grow-1" style={{ width: '100%' }}>
              <DataGrid
                rows={accounts}
                columns={columns}
                getRowId={(row) => row.id}
                disableSelectionOnClick
                autoHeight={false}
                checkboxSelection
                onRowSelectionModelChange={(newSelection) => {
                  // newSelection is typically an array of selected row IDs
                  setSelectionModel(newSelection as string[]);
                }}
                selectionModel={selectionModel}
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
            </div>

            {/* Info Modal */}
            <InfoModal
              isOpen={isModalOpen}
              onRequestClose={() => setIsModalOpen(false)}
              content={modalContent}
            />

            {/* Add Account Modal */}
            <AddAccountModal
              isOpen={isAddAccountModalOpen}
              onRequestClose={() => setIsAddAccountModalOpen(false)}
              agencyId={agencyId || ''}
            />

            {/* Terminate Accounts Modal */}
            <TerminateAccountsModal
              isOpen={isTerminateModalOpen}
              onClose={() => setIsTerminateModalOpen(false)}
              accounts={terminationCandidates}
              onConfirm={handleTerminateAccounts}
            />

            {/* Bulk Update Modal */}
            <BulkUpdateModal
              isOpen={isBulkUpdateModalOpen}
              onClose={() => setIsBulkUpdateModalOpen(false)}
              onConfirm={handleBulkUpdate}
              agencyId={agencyId || ''}
            />
          </div>
        </div>
      </div>
      {/* Toast container for notifications */}
    </>
  );
}

export default Accounts;
