import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input
} from 'reactstrap';
import { toast } from 'react-toastify';
import CreatableSelect from 'react-select/creatable';
import Select, { MultiValue } from 'react-select';
import { fetchTags } from '../../../services/tagsService';
import { fetchModels } from '../../../services/modelsService'; // Update path if needed
import { fetchStatuses } from '../../../services/accountsService'; // Update path if needed
import {fetchChatbots, Chatbot} from '../../../services/chatbotsService';
// Example interface for Model (same as in your modelsService)
interface Model {
  id: string;
  name: string;
  onlyfans_url: string;
}

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (updates: {
    status?: string;
    tagsToAdd?: string[];
    tagsToRemove?: string[];
    modelId?: number;
    chatBotId?: number;
  }) => void;
}

/**
 * This modal lets the user pick which fields to bulk update:
 * - Status (populated from fetchStatuses)
 * - Tags (add new or existing, remove existing)
 * - Model (populated from fetchModels)
 * - ChatBot (just a numeric ID input in this example)
 */
const BulkUpdateModal: React.FC<BulkUpdateModalProps> = ({ isOpen, onClose, onConfirm }) => {
  // Control which fields are updated
  const [updateStatus, setUpdateStatus] = useState(false);
  const [updateTags, setUpdateTags] = useState(false);
  const [updateModel, setUpdateModel] = useState(false);
  const [updateChatBot, setUpdateChatBot] = useState(false);

  // Form inputs
  const [status, setStatus] = useState<string>('');
  const [modelId, setModelId] = useState<string>('');  // We store the string, convert to number later
  const [chatBotId, setChatBotId] = useState<string>('');

  // For tags, we have two multi-selects:
  // 1) "Tags to Add" (can create new or select existing)
  // 2) "Tags to Remove" (select from existing only)
  const [tagsToAdd, setTagsToAdd] = useState<MultiValue<{ label: string; value: string }>>([]);
  const [tagsToRemove, setTagsToRemove] = useState<MultiValue<{ label: string; value: string }>>([]);

  // Dropdown data from server
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAllData();
    }
  }, [isOpen]);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      setUpdateStatus(false);
      setUpdateTags(false);
      setUpdateModel(false);
      setUpdateChatBot(false);

      setStatus('');
      setModelId('');
      setChatBotId('');
      setTagsToAdd([]);
      setTagsToRemove([]);
    }
  }, [isOpen]);

  const fetchAllData = async () => {
    try {
      // fetch tags
      const tagList = await fetchTags();
      setAvailableTags(tagList);

      // fetch statuses
      const statusList = await fetchStatuses();
      // Make sure statusList is an array of strings
      setAvailableStatuses(statusList);

      // fetch models
      const fetchedModels = await fetchModels();
      setModels(fetchedModels);

      const fetchedChatbots = await fetchChatbots();
      setChatbots(fetchedChatbots);
    } catch (err) {
      console.error('Error fetching data for BulkUpdateModal:', err);
    }
  };

  // Convert your string-based tags to React Select options
  const tagOptions = availableTags.map((tag) => ({ value: tag, label: tag }));

  // Convert your Model[] to <option> elements or you can do a react-select
  const modelOptions = models.map((m) => (
    <option key={m.id} value={m.id}>
      {m.name}
    </option>
  ));

  const chatBotOptions = chatbots.map((cb) => (
    <option key={cb.id} value={cb.id}>
      {cb.type}
    </option>
  ));

  // Confirm
  const handleConfirm = () => {
    // If no checkboxes are selected, show an error
    if (!updateStatus && !updateTags && !updateModel && !updateChatBot) {
      toast.error('No fields selected for bulk update.');
      return;
    }

    // Build updates object based on checked fields
    const updates: {
      status?: string;
      tagsToAdd?: string[];
      tagsToRemove?: string[];
      modelId?: number;
      chatBotId?: number;
    } = {};

    // 1) Status
    if (updateStatus && status.trim()) {
      updates.status = status.trim();
    }

    // 2) Tags
    if (updateTags) {
      const addList = tagsToAdd.map((item) => item.value);
      const removeList = tagsToRemove.map((item) => item.value);

      if (addList.length > 0) {
        updates.tagsToAdd = addList;
      }
      if (removeList.length > 0) {
        updates.tagsToRemove = removeList;
      }
    }

    // 3) Model
    if (updateModel && modelId.trim()) {
      updates.modelId = Number(modelId.trim());
    }

    // 4) ChatBot
    if (updateChatBot && chatBotId.trim()) {
      updates.chatBotId = Number(chatBotId.trim());
    }

    // If the final updates object has no keys (e.g. they toggled a field but left it blank)
    if (Object.keys(updates).length === 0) {
      toast.error('You selected fields to update but did not provide any values.');
      return;
    }

    onConfirm(updates);
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose}>
      <ModalHeader toggle={onClose}>Bulk Update Accounts</ModalHeader>
      <ModalBody>
        <Form>
          {/* ==================== Update Status ==================== */}
          <FormGroup check>
            <Input
              type="checkbox"
              id="updateStatusCheckbox"
              checked={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.checked)}
            />
            <Label for="updateStatusCheckbox" check>
              Update Status
            </Label>
          </FormGroup>

          {updateStatus && (
            <FormGroup style={{ marginTop: '0.5rem' }}>
              <Label for="statusSelect">Select New Status</Label>
              <Input
                type="select"
                id="statusSelect"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">(Choose a status)</option>
                {availableStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </Input>
            </FormGroup>
          )}

          <hr />

          {/* ==================== Update Tags ==================== */}
          <FormGroup check>
            <Input
              type="checkbox"
              id="updateTagsCheckbox"
              checked={updateTags}
              onChange={(e) => setUpdateTags(e.target.checked)}
            />
            <Label for="updateTagsCheckbox" check>
              Update Tags
            </Label>
          </FormGroup>

          {updateTags && (
            <div style={{ marginTop: '0.5rem' }}>
              <Label>Add Tags (Choose existing or type new)</Label>
              <CreatableSelect
                isMulti
                value={tagsToAdd}
                onChange={(newValue) => setTagsToAdd(newValue)}
                options={tagOptions}
                placeholder="Select or type tags..."
              />

              <Label style={{ marginTop: '1rem' }}>Remove Tags (Select from existing)</Label>
              <Select
                isMulti
                value={tagsToRemove}
                onChange={(newValue) => setTagsToRemove(newValue)}
                options={tagOptions}
                placeholder="Select existing tags to remove..."
              />

        
            </div>
          )}

          <hr />

          {/* ==================== Update Model ==================== */}
          <FormGroup check>
            <Input
              type="checkbox"
              id="updateModelCheckbox"
              checked={updateModel}
              onChange={(e) => setUpdateModel(e.target.checked)}
            />
            <Label for="updateModelCheckbox" check>
              Update Model
            </Label>
          </FormGroup>

          {updateModel && (
            <FormGroup style={{ marginTop: '0.5rem' }}>
              <Label for="modelSelect">Select Model</Label>
              <Input
                type="select"
                id="modelSelect"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
              >
                <option value="">(Choose a model)</option>
                {modelOptions}
              </Input>
            </FormGroup>
          )}

          <hr />

          {/* ==================== Update ChatBot ==================== */}
          <FormGroup check>
            <Input
              type="checkbox"
              id="updateChatBotCheckbox"
              checked={updateChatBot}
              onChange={(e) => setUpdateChatBot(e.target.checked)}
            />
            <Label for="updateChatBotCheckbox" check>
              Update ChatBot
            </Label>
          </FormGroup>

          {updateChatBot && (
            <FormGroup style={{ marginTop: '0.5rem' }}>
              <Label for="chatBotId">Select ChatBot</Label>
              <Input
                type="select"
                id="chatbotSelect"
                value={chatBotId}
                onChange={(e) => setChatBotId(e.target.value)}
              >
                <option value="">(Choose a chatbot)</option>
                {chatBotOptions}
              </Input>
            </FormGroup>
          )}
        </Form>
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleConfirm}>
          Confirm Bulk Update
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default BulkUpdateModal;
