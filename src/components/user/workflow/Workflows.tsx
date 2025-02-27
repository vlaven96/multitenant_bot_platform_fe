import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, Row, Col, Alert } from 'reactstrap';
import CreatableSelect from 'react-select/creatable';
import { fetchWorkflows, createWorkflow, updateWorkflow, deleteWorkflow, updateWorkflowStatus, fetchAssociatedAccounts } from '../../../services/workflowService';
import { fetchStatuses } from '../../../services/accountsService';
import { fetchTags } from '../../../services/tagsService';
import { toast, ToastContainer } from 'react-toastify';
import { useParams } from 'react-router-dom';
interface Step {
  id?: number;
  day_offset: string | number;
  action_type: string;
  action_value: string;
}

const Workflows: React.FC = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const { agencyId } = useParams<{ agencyId: string }>();
  const [selectedWorkflow, setSelectedWorkflow] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [tags, setTags] = useState<{ label: string, value: string }[]>([]);
  const [error, setError] = useState<string>('');
  const [showUsernamesModal, setShowUsernamesModal] = useState(false);
  const [associatedUsernames, setAssociatedUsernames] = useState<{ username: string, id: number }[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<number | null>(null);

  useEffect(() => {
    loadWorkflows();
    loadStatuses();
    loadTags();
  }, []);

  const loadWorkflows = async () => {
    try {
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      const data = await fetchWorkflows(agencyId);
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  const loadStatuses = async () => {
    try {
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      const data = await fetchStatuses(agencyId);
      setStatuses(data);
    } catch (error) {
      console.error('Failed to load statuses:', error);
    }
  };

  const loadTags = async () => {
    try {
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      const data = await fetchTags(agencyId);
      setTags(data.map((tag: string) => ({ label: tag, value: tag })));
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setError('');
  };

  const handleEdit = (workflow: any) => {
    setSelectedWorkflow(workflow);
    setIsEditing(true);
    toggleModal();
  };

  const handleCreate = () => {
    setSelectedWorkflow({ name: '', description: '', steps: [] });
    setIsEditing(false);
    toggleModal();
  };

  const handleCopy = (workflow: any) => {
    const copiedWorkflow = {
      ...workflow,
      name: `${workflow.name} - Copy`,
      id: undefined, // Remove the ID to create a new workflow
    };
    setSelectedWorkflow(copiedWorkflow);
    setIsEditing(false);
    toggleModal();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedWorkflow?.name) {
      setError('Workflow name is required.');
      return;
    }
    if (!selectedWorkflow?.steps.length) {
      setError('At least one step is required.');
      return;
    }
    for (const step of selectedWorkflow.steps) {
      if (!step.day_offset || !step.action_type || !step.action_value) {
        setError('All fields in each step must be completed.');
        return;
      }
    }
    try {
      const workflowData = {
        ...selectedWorkflow,
        steps: selectedWorkflow.steps.map((step: Step) => ({
          ...step,
          day_offset: parseInt(step.day_offset.toString(), 10),
          id: step.id ? parseInt(step.id.toString(), 10) : undefined
        }))
      };

      if (isEditing && selectedWorkflow) {
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        await updateWorkflow(agencyId, selectedWorkflow.id, workflowData);
        toast.success('Workflow updated successfully');
      } else {
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        await createWorkflow(agencyId, workflowData);
        toast.success('Workflow created successfully');
      }
      loadWorkflows();
      toggleModal();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'An unknown error occurred';
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} workflow: ${errorMessage}`);
      console.error(`Error ${isEditing ? 'updating' : 'creating'} workflow:`, error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        if (!agencyId) {
          console.error('Agency ID is undefined');
          return;
        }
        await deleteWorkflow(agencyId, id);
        toast.success('Workflow deleted successfully');
        loadWorkflows();
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || error.message || 'An unknown error occurred';
        toast.error(`Failed to delete workflow: ${errorMessage}`);
        console.error('Error deleting workflow:', error);
      }
    }
  };

  const addStep = () => {
    setSelectedWorkflow({
      ...selectedWorkflow,
      steps: [...selectedWorkflow.steps, { day_offset: '', action_type: '', action_value: '' }],
    });
  };

  const updateStep = (index: number, field: string, value: string) => {
    const updatedSteps = selectedWorkflow.steps.map((step: any, i: number) =>
      i === index ? { ...step, [field]: value } : step
    );
    setSelectedWorkflow({ ...selectedWorkflow, steps: updatedSteps });
  };

  const removeStep = (index: number) => {
    const updatedSteps = selectedWorkflow.steps.filter((_: any, i: number) => i !== index);
    setSelectedWorkflow({ ...selectedWorkflow, steps: updatedSteps });
  };

  const handleTagChange = (index: number, newValue: any) => {
    if (newValue && newValue.__isNew__) {
      const newTag = { label: newValue.value, value: newValue.value };
      setTags([...tags, newTag]);
      updateStep(index, 'action_value', newValue.value);
    } else {
      updateStep(index, 'action_value', newValue ? newValue.value : '');
    }
  };

  const handleStatusUpdate = async (workflowId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'STOPPED' : 'ACTIVE';
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      await updateWorkflowStatus(agencyId, workflowId, newStatus);
      toast.success('Workflow status updated successfully');
      // Refresh workflows list
      const data = await fetchWorkflows(agencyId);
      setWorkflows(data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'An unknown error occurred';
      toast.error(`Failed to update workflow status: ${errorMessage}`);
      console.error('Error updating workflow status:', error);
    }
  };

  const fetchAssociatedAccountsHandler = async (workflowId: number) => {
    try {
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      const accounts = await fetchAssociatedAccounts(agencyId, workflowId);
      setAssociatedUsernames(accounts);
      setShowUsernamesModal(true);
    } catch (error) {
      console.error('Failed to fetch associated accounts:', error);
      toast.error('Failed to load associated accounts');
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Workflows</h1>
        <Button color="primary" onClick={handleCreate}>Create Workflow</Button>
      </div>

      {workflows.length === 0 ? (
        <div className="alert alert-info">No workflows available.</div>
      ) : (
        <div className="row">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                    <h5 className="card-title mb-0">{workflow.name}</h5>
                    <div className="d-flex gap-2 flex-wrap">
                      <button 
                        className={`btn btn-sm ${workflow.status === 'ACTIVE' ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleStatusUpdate(workflow.id, workflow.status)}
                      >
                        {workflow.status === 'ACTIVE' ? 'Stop' : 'Activate'}
                      </button>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEdit(workflow)}
                        title="Edit Workflow"
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleCopy(workflow)}
                        title="Copy Workflow"
                      >
                        <i className="bi bi-files"></i>
                      </button>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => handleDelete(workflow.id)}
                        title="Delete Workflow"
                      >
                        <i className="bi bi-trash3-fill"></i>
                      </button>
                      <Button 
                        color="secondary" 
                        size="sm"
                        onClick={() => {
                          setSelectedWorkflowId(workflow.id);
                          fetchAssociatedAccountsHandler(workflow.id);
                        }}
                        title="View Associated Accounts"
                      >
                        <i className="bi bi-people-fill"></i>
                      </Button>
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className={`badge bg-${workflow.status === 'ACTIVE' ? 'success' : 'secondary'} me-2`}>
                      {workflow.status}
                    </span>
                  </div>
                  <p className="card-text">
                    <small className="text-muted">
                      <strong>Description:</strong> {workflow.description || 'N/A'}
                    </small>
                  </p>
                  <div className="mb-2">
                    <strong className="d-block mb-1">Steps:</strong>
                    {workflow.steps.map((step: any, index: number) => (
                      <div key={index} className="mb-1 text-break">
                        <strong>Day Offset:</strong> {step.day_offset}, <strong>Action:</strong> {step.action_type}, <strong>Value:</strong> {step.action_value}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg">
        <ModalHeader toggle={toggleModal}>{isEditing ? 'Edit Workflow' : 'Create Workflow'}</ModalHeader>
        <ModalBody>
          <Form onSubmit={handleSubmit}>
            {error && <Alert color="danger">{error}</Alert>}
            <FormGroup>
              <Label for="workflowName">Name</Label>
              <Input
                type="text"
                id="workflowName"
                value={selectedWorkflow?.name || ''}
                onChange={(e) => setSelectedWorkflow({ ...selectedWorkflow, name: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="workflowDescription">Description (Optional)</Label>
              <Input
                type="text"
                id="workflowDescription"
                value={selectedWorkflow?.description || ''}
                onChange={(e) => setSelectedWorkflow({ ...selectedWorkflow, description: e.target.value })}
              />
            </FormGroup>
            <h5>Steps</h5>
            {selectedWorkflow?.steps.map((step: any, index: number) => (
              <Row key={index} className="mb-2">
                <Col md={2}>
                  <Input
                    type="number"
                    placeholder="Day Offset"
                    value={step.day_offset}
                    onChange={(e) => updateStep(index, 'day_offset', e.target.value)}
                    min="1"
                    max="90"
                    required
                  />
                </Col>
                <Col md={3}>
                  <Input
                    type="select"
                    value={step.action_type}
                    onChange={(e) => updateStep(index, 'action_type', e.target.value)}
                    required
                  >
                    <option value="">Select Action</option>
                    <option value="CHANGE_STATUS">Change Status</option>
                    <option value="ADD_TAG">Add Tag</option>
                    <option value="REMOVE_TAG">Remove Tag</option>
                  </Input>
                </Col>
                <Col md={4}>
                  {step.action_type === 'CHANGE_STATUS' && (
                    <Input
                      type="select"
                      value={step.action_value}
                      onChange={(e) => updateStep(index, 'action_value', e.target.value)}
                      required
                    >
                      <option value="">Select Status</option>
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Input>
                  )}
                  {step.action_type === 'ADD_TAG' && (
                    <CreatableSelect
                      options={tags}
                      value={tags.find(tag => tag.value === step.action_value) || { label: step.action_value, value: step.action_value }}
                      onChange={(newValue) => handleTagChange(index, newValue)}
                      isClearable
                      isSearchable
                      placeholder="Select or type to add new tag"
                    />
                  )}
                  {step.action_type === 'REMOVE_TAG' && (
                    <CreatableSelect
                      options={tags}
                      value={tags.find(tag => tag.value === step.action_value) || { label: step.action_value, value: step.action_value }}
                      onChange={(newValue) => handleTagChange(index, newValue)}
                      isClearable
                      isSearchable
                      isDisabled={false}
                      placeholder="Select tag to remove"
                    />
                  )}
                </Col>
                <Col md={2}>
                  <Button color="danger" className="mt-0" onClick={() => removeStep(index)}>Remove</Button>
                </Col>
              </Row>
            ))}
            <Button color="secondary" className="mt-3" onClick={addStep}>Add Step</Button>
            <Button type="submit" color="primary" className="mt-3">{isEditing ? 'Update' : 'Create'}</Button>
          </Form>
        </ModalBody>
      </Modal>

      <Modal isOpen={showUsernamesModal} toggle={() => setShowUsernamesModal(false)}>
        <ModalHeader toggle={() => setShowUsernamesModal(false)}>Associated Usernames</ModalHeader>
        <ModalBody>
          {associatedUsernames.length > 0 ? (
            <ul className="list-group">
              {associatedUsernames.map((account, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <span>{account.username}</span>
                    <small className="text-muted d-block">
                      {account.lastExecutedStep === -1 ? 'No steps executed yet' : `Last Executed Step: ${account.lastExecutedStep}`}
                    </small>
                  </div>
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
        </ModalBody>
      </Modal>

    </div>
  );
};

export default Workflows; 