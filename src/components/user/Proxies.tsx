import React, { useEffect, useState } from 'react';
import { fetchProxies, deleteProxy as deleteProxyService } from '../../services/proxyService';
import InfoModal from '../Modal';
import AddProxyModal from './modals/AddProxyModal';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// Define a type for the data structure
interface ProxyData {
  id: string;
  host: string;
  port: number;
  proxy_username: string;
  proxy_password: string;
  snapchat_accounts: SnapchatAccount[];
}

// Define a type for the Snapchat account
interface SnapchatAccount {
  username: string;
  // Add other properties if needed
}

const Proxies: React.FC = () => {
  const { agencyId } = useParams<{ agencyId: string }>();
  const [proxies, setProxies] = useState<ProxyData[]>([]);
  const [modalContent, setModalContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddProxyModalOpen, setIsAddProxyModalOpen] = useState(false);

  useEffect(() => {
    const loadProxies = async () => {
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      try {
        const data = await fetchProxies(agencyId);
        setProxies(data);
      } catch (error) {
        console.error('Failed to load proxies:', error);
      }
    };

    loadProxies();
  }, [agencyId]);

  const openModal = (content: string) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const deleteProxy = async (proxyId: string) => {
    if (!agencyId) {
      console.error('Agency ID is undefined');
      return;
    }
    if (window.confirm('Are you sure you want to delete this proxy?')) {
      try {
        await deleteProxyService(agencyId, proxyId);
        setProxies((prevProxies) => prevProxies.filter(proxy => proxy.id !== proxyId));
        console.log(`Deleted proxy with ID: ${proxyId}`);
      } catch (error) {
        console.error('Failed to delete proxy:', error);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'host', headerName: 'Proxy Host', width: 150 },
    { field: 'port', headerName: 'Proxy Port', width: 150 },
    { field: 'proxy_username', headerName: 'Username', width: 150 },
    { field: 'proxy_password', headerName: 'Password', width: 150 },
    {
      field: 'snapchat_accounts',
      headerName: 'Snapchat Accounts',
      width: 200,
      renderCell: (params) => {
        const snapchatAccounts = params.value as SnapchatAccount[];
        const displayAccounts = snapchatAccounts.map(account => account.username).join(', ') || 'Not Associated';
        return (
          <span
            style={{ cursor: 'pointer', color: 'blue' }}
            onClick={() => openModal(JSON.stringify(snapchatAccounts, null, 2))}
          >
            {displayAccounts}
          </span>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Button variant="contained" color="secondary" onClick={() => deleteProxy(params.id as string)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Container style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Proxies Management
      </Typography>
      <Button variant="contained" color="primary" onClick={() => setIsAddProxyModalOpen(true)} style={{ marginBottom: '20px' }}>
        Add Proxies
      </Button>
      <div style={{ flexGrow: 1 }}>
        <DataGrid
          rows={proxies}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          style={{ height: '100%' }}
        />
      </div>
      <InfoModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        content={modalContent}
      />
      <AddProxyModal
        isOpen={isAddProxyModalOpen}
        onRequestClose={() => setIsAddProxyModalOpen(false)}
      />
    </Container>
  );
};

export default Proxies; 