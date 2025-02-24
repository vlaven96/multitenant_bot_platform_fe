import React, { useEffect, useMemo, useState } from 'react';
import { useTable, useFilters, useSortBy, useColumnOrder, Row } from 'react-table';
import { fetchModels, deleteModel, updateModel } from '../../services/modelsService';
import './Models.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddModelModal from './modals/AddModelModal';

interface Model {
  id: number;
  name: string;
  onlyfans_url: string;
}

function Models() {
  const [models, setModels] = useState<Model[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModel, setNewModel] = useState<Model>({ id: 0, name: '', onlyfans_url: '' });

  useEffect(() => {
    const loadModels = async () => {
      try {
        const data = await fetchModels();
        console.log('Fetched models:', data);
        setModels(data);
      } catch (error) {
        console.error('Failed to load models:', error);
        toast.error('Failed to load models. Please try again.', {
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

    loadModels();
  }, []);

  useEffect(() => {
    console.log('Models state updated:', models);
  }, [models]);


  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  const handleAddModel = (name: string, onlyfans_url: string) => {
    // Logic to add the new model
    console.log('Adding model:', { name, onlyfans_url });
    setModels([...models, { id: 0, name, onlyfans_url }]);
  };

  const handleDeleteModel = async (model: Model) => {
    console.log('Current models before deletion:', models); 
    if (window.confirm(`Are you sure you want to delete the following model: ${model.name}?`)) {
      try {
        await deleteModel(model);
        const updatedModels = models.filter(m => m.id !== model.id);
        console.log('Updated models after deletion:', updatedModels);
        setModels(updatedModels);
        toast.success('Model deleted successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } catch (error) {
        console.error('Failed to delete model:', error);
        toast.error('Failed to delete model. Please try again.', {
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

  const handleEditModel = (model: Model) => {
    setNewModel({ id: model.id, name: model.name, onlyfans_url: model.onlyfans_url });
    setIsModalOpen(true);
  };

  const handleOpenModalForAdd = () => {
    setNewModel({ id: 0, name: '', onlyfans_url: '' });
    setIsModalOpen(true);
  };

  const handleUpdateModel = (updatedModel: Model) => {
    setModels(models.map(model => model.id === updatedModel.id ? updatedModel : model));
    handleCloseModal();
  };

  const isEditMode = Boolean(newModel.id);

  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name' as const,
        width: 150,
      },
      {
        Header: 'Onlyfans URL',
        accessor: 'onlyfans_url' as const,
        width: 200,
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }: { row: Row<Model> }) => (
          <div>
            <button onClick={() => handleEditModel(row.original)} className="btn btn-secondary">Edit</button>
            <button onClick={() => handleDeleteModel(row.original)} className="btn btn-danger">Delete</button>
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
  } = useTable<Model>(
    {
      columns,
      data: models,
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
            <h1>Models</h1>
            <button onClick={handleOpenModalForAdd} className="btn btn-primary">Add Model</button>
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
      <AddModelModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        onSubmit={(name, onlyfans_url) => {
          if (isEditMode) {
            handleUpdateModel({ ...newModel, name, onlyfans_url });
          } else {
            handleAddModel(name, onlyfans_url);
          }
        }}
        isEditMode={isEditMode}
        model={newModel}
      />
      <ToastContainer />
    </div>
  );
}

export default Models; 