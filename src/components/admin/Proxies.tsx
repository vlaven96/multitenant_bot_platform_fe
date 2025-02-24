import { useEffect, useMemo, useState } from 'react';
import { useTable, useFilters, useSortBy, useColumnOrder, Row } from 'react-table';
import { fetchProxies, deleteProxy as deleteProxyService } from '../../services/proxyService';
import InfoModal from '../Modal';
import AddProxyModal from './modals/AddProxyModal';
import 'bootstrap/dist/css/bootstrap.min.css';

// Define a type for the data structure
interface ProxyData {
  host: string;
  port: number;
  proxy_username: string;
  proxy_password: string;
  snapchat_accounts: SnapchatAccount[];
  id: string;
}

// Define a type for the Snapchat account
interface SnapchatAccount {
  username: string;
  // Add other properties if needed
}

// Define a helper function to get the sort indicator
const getSortIndicator = (column: any) => {
  if (column.isSorted) {
    return column.isSortedDesc ? ' 🔽' : ' 🔼';
  }
  return '';
};

function Proxies() {
  const [proxies, setProxies] = useState<ProxyData[]>([]);
  const [modalContent, setModalContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddProxyModalOpen, setIsAddProxyModalOpen] = useState(false);

  useEffect(() => {
    const loadProxies = async () => {
      try {
        const data = await fetchProxies();
        setProxies(data);
      } catch (error) {
        console.error('Failed to load proxies:', error);
      }
    };

    loadProxies();
  }, []);

  const openModal = (content: string) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const deleteProxy = async (proxyId: string) => {
    if (window.confirm('Are you sure you want to delete this proxy?')) {
      try {
        await deleteProxyService(proxyId);
        setProxies((prevProxies) => prevProxies.filter(proxy => proxy.id !== proxyId));
        console.log(`Deleted proxy with ID: ${proxyId}`);
      } catch (error) {
        console.error('Failed to delete proxy:', error);
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Proxy Host',
        accessor: 'host' as const,
        width: 150,
      },
      {
        Header: 'Proxy Port',
        accessor: 'port' as const,
        width: 150,
      },
      {
        Header: 'Username',
        accessor: 'proxy_username' as const,
        width: 150,
      },
      {
        Header: 'Password',
        accessor: 'proxy_password' as const,
        width: 150,
      },
      {
        Header: 'Snapchat Accounts',
        accessor: 'snapchat_accounts' as const,
        width: 200,
        Cell: ({ row }: { row: Row<ProxyData> }) => {
          const snapchatAccounts = row.original.snapchat_accounts;
          const displayAccounts = () => {
            if (!snapchatAccounts || snapchatAccounts.length === 0) {
              return 'Not Associated';
            }
            return snapchatAccounts.map((account: SnapchatAccount) => account.username).join(', ');
          };

          return (
            <span
              className="clickable-cell"
              onClick={() => openModal(snapchatAccounts ? JSON.stringify(snapchatAccounts, null, 2) : 'Not Associated')}
            >
              {displayAccounts()}
            </span>
          );
        },
      },
      {
        Header: 'Actions',
        accessor: 'id',
        Cell: ({ row }: { row: Row<ProxyData> }) => (
          <button onClick={() => deleteProxy(row.original.id)} className="btn btn-danger">
            Delete
          </button>
        ),
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable<ProxyData>(
    {
      columns,
      data: proxies,
    },
    useFilters,
    useSortBy,
    useColumnOrder
  );

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        <div className="col d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1>Proxies Management</h1>
            <button onClick={() => setIsAddProxyModalOpen(true)} className="btn btn-primary">Add Proxies</button>
          </div>
          <div className="table-container flex-grow-1 overflow-auto">
            <table {...getTableProps()} className="table">
              <thead>
                {headerGroups.map((headerGroup: any) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column: any) => (
                      <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                        {column.render('Header')}
                        <span>
                          {getSortIndicator(column)}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map(row => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map(cell => (
                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
        </div>
      </div>
    </div>
  );
}

export default Proxies; 