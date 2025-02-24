import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EditSnapchatAccount.css';
import { fetchAccountForEdit, updateAccount } from '../../services/accountsService';
import CreatableSelect from 'react-select/creatable';

interface AccountDetails {
  account: {
    id: number;
    username: string;
    password?: string;
    snapchat_link?: string;
    two_fa_secret?: string;
    creation_date?: string;
    added_to_system_date?: string;
    status?: string;
    proxy?: {
      id: number;
      host: string;
      port: string;
    };
    device?: {
      id: number;
      data: string;
    };
    cookies?: {
      id: number;
      data: string;
    };
    model?: {
      id: number;
      name: string;
      onlyfans_url: string;
    };
    chat_bot?: {
      id: number;
      type: string;
      token: string;
    };
  };
  proxies: Array<{
    id: number;
    host: string;
    port: string;
  }>;
  models: Array<{
    id: number;
    name: string;
    onlyfans_url: string;
  }>;
  chat_bots: Array<{
    id: number;
    type: string;
  }>;
  statuses: string[];
  tags: string[];
  workflows: Array<{
    id: number;
    name: string;
  }>;
}

const EditSnapchatAccount: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [selectedChatBot, setSelectedChatBot] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedProxy, setSelectedProxy] = useState<number | null>(null);
  const [tags, setTags] = useState<{ label: string, value: string }[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);

  useEffect(() => {
    const loadAccountDetails = async () => {
      try {
        if (!id) return;
        const data = await fetchAccountForEdit(id);
        setAccountDetails(data);
        setSelectedModel(data.account.model?.id || null);
        setSelectedChatBot(data.account.chat_bot?.id || null);
        setSelectedStatus(data.account.status || null);
        setSelectedProxy(data.account.proxy?.id || null);
        setTags(data.account.tags.map(tag => ({ label: tag, value: tag })) || []);
        setSelectedWorkflow(data.account.workflow?.id || null);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch account details');
        console.error('Error:', error);
        setLoading(false);
      }
    };

    loadAccountDetails();
  }, [id]);

  const handleTagChange = (newValue: any) => {
    setTags(newValue || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!id) return;
      
      await updateAccount(id, {
        model_id: selectedModel,
        chatbot_id: selectedChatBot,
        status: selectedStatus,
        proxy_id: selectedProxy,
        workflow_id: selectedWorkflow,
        tags: tags.map(tag => tag.value),
      });
      
      toast.success('Account updated successfully');
      navigate('/admin/accounts');
    } catch (error) {
      toast.error('Failed to update account');
      console.error('Error updating account:', error);
    }
  };

  const isFormValid = () => {
    return selectedStatus !== null && selectedModel !== null && selectedChatBot !== null;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!accountDetails) {
    return <div>Error loading account details</div>;
  }

  return (
    <div className="edit-account-container">
      <h2>Edit Snapchat Account: {accountDetails.account.username}</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label>Model:</label>
          <select
            value={selectedModel || ''}
            onChange={(e) => setSelectedModel(e.target.value ? Number(e.target.value) : null)}
            className="form-control"
          >
            <option value="">None</option>
            {accountDetails.models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          {accountDetails.account.model && (
            <div className="current-value">
              Current: {accountDetails.account.model.name}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>ChatBot:</label>
          <select
            value={selectedChatBot || ''}
            onChange={(e) => setSelectedChatBot(e.target.value ? Number(e.target.value) : null)}
            className="form-control"
          >
            <option value="">None</option>
            {accountDetails.chat_bots?.map((bot) => (
              <option key={bot.id} value={bot.id}>
                {bot.type}
              </option>
            ))}
          </select>
          {accountDetails.account.chat_bot && (
            <div className="current-value">
              Current: {accountDetails.account.chat_bot.type}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Status:</label>
          <select
            value={selectedStatus || ''}
            onChange={(e) => setSelectedStatus(e.target.value || null)}
            className="form-control"
          >
            <option value="">None</option>
            {accountDetails.statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {accountDetails.account.status && (
            <div className="current-value">
              Current: {accountDetails.account.status}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Proxy:</label>
          <select
            value={selectedProxy || ''}
            onChange={(e) => setSelectedProxy(e.target.value ? Number(e.target.value) : null)}
            className="form-control"
          >
            <option value="">None</option>
            {accountDetails.proxies.map((proxy) => (
              <option key={proxy.id} value={proxy.id}>
                {proxy.host}:{proxy.port}
              </option>
            ))}
          </select>
          {accountDetails.account.proxy && (
            <div className="current-value">
              Current: {accountDetails.account.proxy.host}:{accountDetails.account.proxy.port}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Workflow:</label>
          <select
            value={selectedWorkflow || ''}
            onChange={(e) => setSelectedWorkflow(e.target.value ? Number(e.target.value) : null)}
            className="form-control"
          >
            <option value="">None</option>
            {accountDetails.workflows.map((workflow) => (
              <option key={workflow.id} value={workflow.id}>
                {workflow.name}
              </option>
            ))}
          </select>
          {accountDetails.account.workflow && (
            <div className="current-value">
              Current: {accountDetails.account.workflow.name}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Tags:</label>
          <CreatableSelect
            isMulti
            options={accountDetails.tags.map(tag => ({ label: tag, value: tag }))}
            onChange={handleTagChange}
            value={tags}
            isClearable
            isSearchable
            placeholder="Select or type to add new tag"
          />
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!isFormValid()}
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/accounts')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default EditSnapchatAccount; 