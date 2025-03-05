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
import 'react-toastify/dist/ReactToastify.css'; // Still used for notifications

import {
  fetchAccounts,
  terminateAccount,
  updateAccount,
  fetchTerminationCandidates,
  terminateMultipleAccounts,
  bulkUpdateAccounts
} from '../../services/accountsService';
import { fetchTags } from '../../services/tagsService';

import InfoModal from '../Modal';
import AddAccountModal from './modals/AddAccountModal';
import TerminateAccountsModal from './modals/TerminateAccountsModal';
import BulkUpdateModal from './modals/BulkUpdateModal';
import TagCell from '../common/TagCell';

// If you still want to keep Bootstrap for other parts of your app, leave this import.
// Otherwise, you can remove it if you're moving fully to MUI.
// import 'bootstrap/dist/css/bootstrap.min.css';

// MUI components for layout & styling:
import { Box, Button, Typography } from '@mui/material';

// You mentioned colors – if you're using them directly, keep them, or remove if not needed
import { MAIN_COLOR_1, MAIN_COLOR_2, MAIN_COLOR_3, MAIN_COLOR_4, MAIN_COLOR_5 } from '../../colors';

// Define the Account interface
interface Account {
  id: string;
  username: string;
  password?: string;
  snapchat_link?: string;
  two_fa_secret?: string;
  creation_date?: string;
  added_to_system_date?: string;
  proxy?: { id: number; host: string; port?: number };
  account_executions?: { status: string }[];
  status?: string;
  tags?: string[];
  account_source?: string;
  workflow_id?: string;
}

/** Custom MUI DataGrid toolbar, same logic as before. */
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

/** Custom DataGrid footer, same logic as before. */
function CustomFooter() {
  return (
    <GridFooterContainer>
      <GridFooter />
      <Box ml={2} fontWeight="bold">
        {/* Additional row count or custom info can go here */}
      </Box>
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

  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);

  // Selected rows in the DataGrid
  const [selectionModel, setSelectionModel] = useState<string[]>([]);

  // For TagCell
  const [existingTags, setExistingTags] = useState<string[]>([]);

  // Column visibility localStorage logic (unchanged)
  const initialColumnVisibility = () => {
    const savedConfig = localStorage.getItem('columnVisibilityConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    // Default: all columns visible
    return {
      username: true,
      password: true,
      snapchat_link: true,
      email: true,
      email_password: true,
      two_fa_secret: true,
      creation_date: true,
      added_to_system_date: true,
      proxy: true,
      status: true,
      account_source: true,
      tags: true,
      workflow: true,
      account_executions: true,
      actions: true,
    };
  };
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<Record<string, boolean>>(initialColumnVisibility);

  // -------------- Original Effects and logic remain --------------
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
  }, [agencyId]);

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

      // Refresh the accounts list
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
      await updateAccount(agencyId, rowId, {
        tags: newTags
      });

      // Merge newly created tags into existingTags
      const newlyCreated = newTags.filter((t) => !existingTags.includes(t));
      if (newlyCreated.length > 0) {
        setExistingTags((prev) => [...prev, ...newlyCreated]);
      }

      // Update the specific row data
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
        account_ids: selectionModel.map((id) => parseInt(id, 10)),
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

      // Reload accounts
      const data = await fetchAccounts(agencyId, () => {});
      // Reflect new tags
      const updatedAccounts = data.map((account) => {
        if (selectionModel.includes(account.id)) {
          const newTags = new Set(account.tags || []);
          updates.tagsToAdd?.forEach((tag) => newTags.add(tag));
          updates.tagsToRemove?.forEach((tag) => newTags.delete(tag));
          return { ...account, tags: Array.from(newTags) };
        }
        return account;
      });
      setAccounts(updatedAccounts);

      setSelectionModel([]);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to bulk update accounts';
      toast.error(errorMessage);
      console.error('Bulk update error:', error);
    }
  };

  // Same DataGrid columns as before
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
        sortable: true,
        renderCell: (params: GridRenderCellParams<Account>) => {
          const proxy = params.row.proxy;
          return (
            <span
              style={{ color: 'blue', cursor: 'pointer' }}
              onClick={() => openModal(proxy ? JSON.stringify(proxy, null, 2) : 'Not Associated')}
            >
              {proxy ? `${proxy.host}:${proxy.port ?? ''}` : 'Not Associated'}
            </span>
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
          const getStatusColor = (st: string | undefined) => {
            switch (st) {
              case 'RECENTLY_INGESTED':
                return '#17a2b8'; // Just a sample color
              case 'GOOD_STANDING':
                return '#28a745';
              case 'LOCKED':
                return '#ffc107';
              case 'TERMINATED':
                return '#dc3545';
              default:
                return '#6c757d';
            }
          };
          return (
            <span style={{ color: getStatusColor(status), fontWeight: 'bold' }}>
              {status || 'Unknown'}
            </span>
          );
        },
      },
      {
        field: 'account_source',
        headerName: 'Source',
        flex: 1,
        renderCell: (params: GridRenderCellParams<Account>) => {
          const value = params.row.account_source;
          return (
            <span
              style={{
                background: '#0dcaf0',
                padding: '4px 6px',
                borderRadius: '4px',
                color: '#000'
              }}
            >
              {value || 'N/A'}
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
                return 'gray';
              default:
                return 'yellow';
            }
          };
          return (
            <span
              style={{ cursor: 'pointer' }}
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
            </span>
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
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate(`/agency/${agencyId}/accounts/edit/${row.id}`)}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => terminateAccountHandler(row.id)}
              >
                Terminate
              </Button>
              <Button
                variant="contained"
                color="info"
                size="small"
                onClick={() => navigate(`/snapchat-account/${row.id}`)}
              >
                View Details
              </Button>
            </Box>
          );
        },
      },
    ],
    [agencyId, navigate, terminateAccountHandler, openModal, existingTags]
  );

  return (
    <>
      {/* Replace container-fluid + rows + columns with MUI Box components for layout */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Accounts Management (MUI DataGrid)</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" color="error" onClick={handleOpenTerminateModal}>
              Terminate Accounts
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsAddAccountModalOpen(true)}
            >
              Add Accounts
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={() => setIsBulkUpdateModalOpen(true)}
              disabled={selectionModel.length === 0}
            >
              Bulk Update
            </Button>
          </Box>
        </Box>

        {/* This replaces the .table-container + flex-grow-1 */}
        <Box sx={{ flexGrow: 1, width: '100%' }}>
          <DataGrid
            rows={accounts}
            columns={columns}
            getRowId={(row) => row.id}
            disableSelectionOnClick
            checkboxSelection
            onRowSelectionModelChange={(newSelection) => {
              setSelectionModel(newSelection as string[]);
            }}
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
        </Box>
      </Box>

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

      {/* Toast container for notifications */}
      <ToastContainer />
    </>
  );
}

export default Accounts;
