import React, { useEffect, useState } from 'react';
import { Container, Typography, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridFooterContainer,
  GridFooter,
} from '@mui/x-data-grid';
import { fetchAllAgencies } from '../../services/agencyService';
import { createSubscription, updateSubscription, renewSubscription } from '../../services/subscriptionService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Subscription {
  id: number;
  agency_id: number;
  status: string;
  renewed_at: string;
  days_available: number;
  number_of_sloths: number;
  price: string;
  turned_off_at: string;
}

interface Agency {
  id: number;
  name: string;
  created_at: string;
  subscription: Subscription | null;
}

/** Optional custom toolbar, as in your example code */
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

/** Optional custom footer, as in your example code */
function CustomFooter() {
  return (
    <GridFooterContainer>
      <GridFooter />
      {/* Optionally place extra footer info here */}
    </GridFooterContainer>
  );
}

const GlobalAdminHome: React.FC = () => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'update' | 'renew' | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [formData, setFormData] = useState({ daysAvailable: '', numberOfSloths: '', price: '', status: '', endDate: '' });

  const loadAgencies = async () => {
    try {
      const data = await fetchAllAgencies();
      setAgencies(data);
    } catch (error) {
      console.error('Failed to fetch agencies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  const handleOpenModal = (type: 'create' | 'update' | 'renew', agency: Agency) => {
    setModalType(type);
    setSelectedAgency(agency);
    setFormData({
      daysAvailable: agency.subscription?.days_available.toString() || '',
      numberOfSloths: agency.subscription?.number_of_sloths.toString() || '',
      price: agency.subscription?.price || '',
      status: agency.subscription?.status || '',
      endDate: agency.subscription?.turned_off_at ? new Date(agency.subscription.turned_off_at).toISOString().split('T')[0] : '',
    });
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setModalType(null);
    setSelectedAgency(null);
  };

  const handleSubmit = async () => {
    if (!selectedAgency) return;

    try {
      if (modalType === 'create') {
        await createSubscription(selectedAgency.id, formData);
        toast.success('Subscription created successfully!');
      } else if (modalType === 'update') {
        await updateSubscription(selectedAgency.id, formData);
        toast.success('Subscription updated successfully!');
      } else if (modalType === 'renew') {
        await renewSubscription(selectedAgency.id, formData);
        toast.success('Subscription renewed successfully!');
      }
      await loadAgencies(); // Refresh data
    } catch (error) {
      toast.error('Failed to process the request.');
      console.error('Failed to submit:', error);
    } finally {
      handleCloseModal();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const columns: GridColDef<Agency>[] = [
    {
      field: 'id',
      headerName: 'ID',
      flex: 0.5,
      sortable: true,
      filterable: true,
      renderCell: (params: GridRenderCellParams<Agency>) => {
        const row = params.row;
        if (!row) return 'N/A';
        return row.id;
      },
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1.5,
      sortable: true,
      filterable: true,
      renderCell: (params: GridRenderCellParams<Agency>) => {
        const row = params.row;
        if (!row) return 'N/A';
        return (
          <a
            href={`/agency/${row.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1976d2', textDecoration: 'none' }}
          >
            {row.name ?? 'N/A'}
          </a>
        );
      },
    },
    {
      field: 'created_at',
      headerName: 'Created At',
      flex: 1.2,
      sortable: true,
      filterable: true,
      renderCell: (params: GridRenderCellParams<Agency>) => {
        const row = params.row;
        if (!row?.created_at) return 'N/A';
        return new Date(row.created_at).toLocaleDateString();
      },
    },
    {
      field: 'subscriptionStatus',
      headerName: 'Subscription Status',
      flex: 1.5,
      sortable: true,
      filterable: true,
      renderCell: (params: GridRenderCellParams<Agency>) => {
        const row = params.row;
        // subscription might be null
        if (!row?.subscription?.status) return 'N/A';
        return row.subscription.status;
      },
    },
    {
      field: 'daysAvailable',
      headerName: 'Days Available',
      flex: 1.2,
      sortable: true,
      filterable: true,
      renderCell: (params: GridRenderCellParams<Agency>) => {
        const row = params.row;
        return row?.subscription?.days_available ?? 'N/A';
      },
    },
    {
      field: 'numberOfSloths',
      headerName: 'Number of Sloths',
      flex: 1.2,
      sortable: true,
      filterable: true,
      renderCell: (params: GridRenderCellParams<Agency>) => {
        const row = params.row;
        return row?.subscription?.number_of_sloths ?? 'N/A';
      },
    },
    {
      field: 'price',
      headerName: 'Price',
      flex: 1,
      sortable: true,
      filterable: true,
      renderCell: (params: GridRenderCellParams<Agency>) => {
        const row = params.row;
        if (!row?.subscription?.price) return 'N/A';
        return `$${row.subscription.price}`;
      },
    },
    // NEW Actions column
    {
      field: 'actions',
      headerName: 'Subscriptions Actions',
      flex: 2,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Agency>) => {
        const row = params.row;
        if (!row) return null; // or 'N/A'

        // If no subscription => "Create Subscription"
        if (!row.subscription) {
          return (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenModal('create', row)}
              sx={{ minWidth: 150, fontSize: '0.875rem', padding: '6px 12px' }}
            >
              Create
            </Button>
          );
        }

        // Show "Update" if status is "AVAILABLE", otherwise show "Renew"
        return (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {row.subscription.status === 'AVAILABLE' ? (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleOpenModal('update', row)}
                sx={{ minWidth: 150, fontSize: '0.875rem', padding: '6px 12px' }}
              >
                Update
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleOpenModal('renew', row)}
                sx={{ minWidth: 150, fontSize: '0.875rem', padding: '6px 12px' }}
              >
                Renew
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom>
        Global Admin Dashboard
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <div style={{ height: 750, width: '100%' }}>
          <DataGrid<Agency>
            rows={agencies}
            columns={columns}
            getRowId={(row) => row.id}
            pageSizeOptions={[5, 10, 20]}
            initialState={{
              pagination: { paginationModel: { pageSize: 20 } },
            }}
            // Remove checkboxSelection to hide the left checkboxes
            // Provide custom toolbar & footer as in your example
            components={{
              Toolbar: CustomToolbar,
              Footer: CustomFooter,
            }}
          />
        </div>
      )}

      <Dialog open={open} onClose={handleCloseModal}>
        <DialogTitle>{modalType === 'create' ? 'Create Subscription' : modalType === 'update' ? 'Update Subscription' : 'Renew Subscription'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Days Available"
            type="number"
            fullWidth
            name="daysAvailable"
            value={formData.daysAvailable}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Number of Sloths"
            type="number"
            fullWidth
            name="numberOfSloths"
            value={formData.numberOfSloths}
            onChange={handleInputChange}
          />
          {(modalType === 'create' || modalType === 'renew') && (
            <TextField
              margin="dense"
              label="Price"
              type="text"
              fullWidth
              name="price"
              value={formData.price}
              onChange={handleInputChange}
            />
          )}
          {modalType === 'update' && (
            <>
              <TextField
                margin="dense"
                label="Status"
                select
                fullWidth
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
                <MenuItem value="EXPIRED">EXPIRED</MenuItem>
                <MenuItem value="SUSPENDED">SUSPENDED</MenuItem>
              </TextField>
              <TextField
                margin="dense"
                label="End Date"
                type="date"
                fullWidth
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </Container>
  );
};

export default GlobalAdminHome;
