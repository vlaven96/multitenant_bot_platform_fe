import React, { useEffect, useMemo, useState } from 'react';
import { useTable, useFilters, useSortBy, useColumnOrder, Row } from 'react-table';
import { fetchChatbots, addChatbot, updateChatbot, deleteChatbot } from '../../services/chatbotsService';
import './Chatbots.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddChatbotModal from './modals/AddChatbotModal';
import { useParams } from 'react-router-dom';

interface Chatbot {
  id: string;
  type: string;
  token: string;
}

const Chatbots: React.FC = () => {
  const { agencyId } = useParams<{ agencyId: string }>();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChatbot, setNewChatbot] = useState<Chatbot>({ id: '', type: '', token: '' });

  useEffect(() => {
    const loadChatbots = async () => {
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      try {
        const data = await fetchChatbots(agencyId);
        setChatbots(data);
      } catch (error) {
        console.error('Failed to load chatbots:', error);
        toast.error('Failed to load chatbots. Please try again.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    };

    loadChatbots();
  }, [agencyId]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddChatbot = async (type: string, token: string) => {
    if (!agencyId) {
      console.error('Agency ID is undefined');
      return;
    }
    try {
      await addChatbot(agencyId, { type, token });
      const data = await fetchChatbots(agencyId);
      setChatbots(data);
      toast.success('Chatbot added successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error('Failed to add chatbot:', error);
      toast.error('Failed to add chatbot. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleDeleteChatbot = async (chatbotId: string) => {
    if (!agencyId) {
      console.error('Agency ID is undefined');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the chatbot: ${newChatbot.type}?`)) {
      try {
        await deleteChatbot(agencyId, chatbotId);
        const data = await fetchChatbots(agencyId);
        setChatbots(data);
        toast.success('Chatbot deleted successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } catch (error) {
        console.error('Failed to delete chatbot:', error);
        toast.error('Failed to delete chatbot. Please try again.', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
  };

  const handleEditChatbot = (chatbot: Chatbot) => {
    setNewChatbot(chatbot);
    setIsModalOpen(true);
  };

  const handleOpenModalForAdd = () => {
    console.log('Add Chatbot button clicked');
    setNewChatbot({ id: '', type: '', token: '' });
    setIsModalOpen(true);
  };

  const handleUpdateChatbot = async (updatedChatbot: Chatbot) => {
    if (!agencyId) {
      console.error('Agency ID is undefined');
      return;
    }
    try {
      await updateChatbot(agencyId, updatedChatbot);
      const data = await fetchChatbots(agencyId);
      setChatbots(data);
      toast.success('Chatbot updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error('Failed to update chatbot:', error);
      toast.error('Failed to update chatbot. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    handleCloseModal();
  };

  const isEditMode = Boolean(newChatbot.id);

  const columns = useMemo(
    () => [
      {
        Header: 'Type',
        accessor: 'type' as const,
        width: 150,
      },
      {
        Header: 'Token',
        accessor: 'token' as const,
        width: 200,
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }: { row: Row<Chatbot> }) => (
          <div>
            <button onClick={() => handleEditChatbot(row.original)} className="btn btn-secondary">Edit</button>
            <button onClick={() => handleDeleteChatbot(row.original.id)} className="btn btn-danger">Delete</button>
          </div>
        ),
        width: 150,
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
  } = useTable<Chatbot>(
    {
      columns,
      data: chatbots,
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
            <h1>Chatbots</h1>
            <button onClick={() => {
              console.log('Opening Add Chatbot Modal');
              handleOpenModalForAdd();
            }} className="btn btn-primary">Add Chatbot</button>
          </div>
          <div className="table-container flex-grow-1 overflow-auto">
            <table {...getTableProps()} className="table">
              <thead>
                {headerGroups.map((headerGroup: any) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column: any) => (
                      <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                        {column.render('Header')}
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
        </div>
      </div>
      <AddChatbotModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        onSubmit={(type, token) => {
          if (isEditMode) {
            handleUpdateChatbot({ ...newChatbot, type, token });
          } else {
            handleAddChatbot(type, token);
          }
        }}
        isEditMode={isEditMode}
        chatbot={newChatbot}
        agencyId={agencyId || ''}
      />
    </div>
  );
};

export default Chatbots; 