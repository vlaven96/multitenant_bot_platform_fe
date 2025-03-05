import React, { useState, useEffect } from 'react';
import {
  Button as RBButton, // Distinguish React-Bootstrap <Button> from MUI <Button>
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Alert
} from 'reactstrap';
import CreatableSelect from 'react-select/creatable';
import {
  fetchWorkflows,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  updateWorkflowStatus,
  fetchAssociatedAccounts
} from '../../../services/workflowService';
import { fetchStatuses } from '../../../services/accountsService';
import { fetchTags } from '../../../services/tagsService';
import { toast, ToastContainer } from 'react-toastify';
import { useParams } from 'react-router-dom';

// Keep Bootstrap for React-Bootstrap usage
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { Box, Typography, Button, Grid } from '@mui/material'; // MUI for layout & styling

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
  const [tags, setTags] = useState<{ label: string; value: string }[]>([]);
  const [error, setError] = useState<string>('');

  const [showUsernamesModal, setShowUsernamesModal] = useState(false);
  const [associatedUsernames, setAssociatedUsernames] = useState<{ username: string; id: number }[]>(
    []
  );
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
      id: undefined, // new workflow
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
          id: step.id ? parseInt(step.id.toString(), 10) : undefined,
        })),
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
      const errorMessage =
        error.response?.data?.detail || error.message || 'An unknown error occurred';
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
        const errorMessage =
          error.response?.data?.detail || error.message || 'An unknown error occurred';
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
      const data = await fetchWorkflows(agencyId);
      setWorkflows(data);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'An unknown error occurred';
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
    <Box sx={{ minHeight: '100vh', p: 4 }}>
      <ToastContainer />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Workflows</Typography>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Create Workflow
        </Button>
      </Box>

      {workflows.length === 0 ? (
        <Box
          sx={{
            border: '1px solid #ccc',
            borderRadius: 1,
            p: 2,
          }}
        >
          <Typography>No workflows available.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {workflows.map((workflow) => (
            <Grid item xs={12} sm={6} md={4} key={workflow.id}>
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    mb: 2,
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 0 }}>
                    {workflow.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="small"
                      color={workflow.status === 'ACTIVE' ? 'warning' : 'success'}
                      onClick={() => handleStatusUpdate(workflow.id, workflow.status)}
                    >
                      {workflow.status === 'ACTIVE' ? 'Stop' : 'Activate'}
                    </Button>

                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleEdit(workflow)}
                      title="Edit Workflow"
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleCopy(workflow)}
                      title="Copy Workflow"
                    >
                      <i className="bi bi-files"></i>
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      color="error"
                      onClick={() => handleDelete(workflow.id)}
                      title="Delete Workflow"
                    >
                      <i className="bi bi-trash3-fill"></i>
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="secondary"
                      onClick={() => {
                        setSelectedWorkflowId(workflow.id);
                        fetchAssociatedAccountsHandler(workflow.id);
                      }}
                      title="View Associated Accounts"
                    >
                      <i className="bi bi-people-fill"></i>
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box
                    component="span"
                    sx={{
                      backgroundColor: workflow.status === 'ACTIVE' ? '#198754' : '#6c757d',
                      color: '#fff',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      mr: 1,
                    }}
                  >
                    {workflow.status}
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Description: </strong>
                  {workflow.description || 'N/A'}
                </Typography>

                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Steps:
                  </Typography>
                  {workflow.steps.map((step: any, index: number) => (
                    <Box key={index} sx={{ fontSize: '0.9rem', mb: 1 }}>
                      <strong>Day Offset:</strong> {step.day_offset},{' '}
                      <strong>Action:</strong> {step.action_type},{' '}
                      <strong>Value:</strong> {step.action_value}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Reactstrap Modal for creating/editing workflow */}
      <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg">
        <ModalHeader toggle={toggleModal}>
          {isEditing ? 'Edit Workflow' : 'Create Workflow'}
        </ModalHeader>
        <ModalBody>
          {error && <Alert color="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="workflowName">Name</Label>
              <Input
                type="text"
                id="workflowName"
                value={selectedWorkflow?.name || ''}
                onChange={(e) =>
                  setSelectedWorkflow({ ...selectedWorkflow, name: e.target.value })
                }
                required
              />
            </FormGroup>

            <FormGroup>
              <Label for="workflowDescription">Description (Optional)</Label>
              <Input
                type="text"
                id="workflowDescription"
                value={selectedWorkflow?.description || ''}
                onChange={(e) =>
                  setSelectedWorkflow({ ...selectedWorkflow, description: e.target.value })
                }
              />
            </FormGroup>

            <hr />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Steps
            </Typography>
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
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Input>
                  )}
                  {(step.action_type === 'ADD_TAG' || step.action_type === 'REMOVE_TAG') && (
                    <CreatableSelect
                      options={tags}
                      value={
                        tags.find((tagItem) => tagItem.value === step.action_value) || {
                          label: step.action_value,
                          value: step.action_value,
                        }
                      }
                      onChange={(newValue) => handleTagChange(index, newValue)}
                      isClearable
                      isSearchable
                      placeholder={`Select or type to ${
                        step.action_type === 'ADD_TAG' ? 'add new tag' : 'remove tag'
                      }`}
                    />
                  )}
                </Col>
                <Col md={2}>
                  <RBButton
                    color="danger"
                    className="mt-0"
                    onClick={() => removeStep(index)}
                  >
                    Remove
                  </RBButton>
                </Col>
              </Row>
            ))}

            <RBButton color="secondary" className="mt-3" onClick={addStep}>
              Add Step
            </RBButton>

            <RBButton type="submit" color="primary" className="mt-3">
              {isEditing ? 'Update' : 'Create'}
            </RBButton>
          </Form>
        </ModalBody>
      </Modal>

      {/* Reactstrap Modal for associated accounts */}
      <Modal isOpen={showUsernamesModal} toggle={() => setShowUsernamesModal(false)}>
        <ModalHeader toggle={() => setShowUsernamesModal(false)}>Associated Usernames</ModalHeader>
        <ModalBody>
          {associatedUsernames.length > 0 ? (
            <ul className="list-group">
              {associatedUsernames.map((account, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <span>{account.username}</span>
                    {/* If there's a 'lastExecutedStep' or something similar, show it here */}
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
    </Box>
  );
};

export default Workflows;
