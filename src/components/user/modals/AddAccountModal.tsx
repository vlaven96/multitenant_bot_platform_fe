import React, { useRef, useState, useEffect } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addAccount, fetchSources } from "../../../services/accountsService";
import { fetchModels } from "../../../services/modelsService";
import { fetchChatbots } from "../../../services/chatbotsService";
import { fetchWorkflowsSimplified } from '../../../services/workflowService';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import './AddAccountModal.css';

Modal.setAppElement("#root");

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto',
    padding: '20px',
    borderRadius: '8px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000
  }
};

interface AddAccountModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  agencyId: string;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onRequestClose, agencyId }) => {
  const [inputText, setInputText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [models, setModels] = useState<any[]>([]);
  const [chatbots, setChatbots] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>({ value: null, label: 'Auto-assign' });
  const [selectedChatbot, setSelectedChatbot] = useState<any>({ value: null, label: 'Auto-assign' });
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [workflows, setWorkflows] = useState<{ id: number; name: string }[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [triggerExecution, setTriggerExecution] = useState(true);
  const [sources, setSources] = useState<any[]>([]);
  const [enablePattern, setEnablePattern] = useState(false);
  const [pattern, setPattern] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [modelsData, chatbotsData, workflowsData, sourcesData] = await Promise.all([
          fetchModels(agencyId),
          fetchChatbots(agencyId),
          fetchWorkflowsSimplified(agencyId),
          fetchSources(agencyId)
        ]);
        
        setModels([
          { value: null, label: 'Auto-assign' },
          ...modelsData.map((model: any) => ({
            value: model.id,
            label: model.name
          }))
        ]);
        
        setChatbots([
          { value: null, label: 'Auto-assign' },
          ...chatbotsData.map((chatbot: any) => ({
            value: chatbot.id,
            label: chatbot.type
          }))
        ]);

        setWorkflows([
          { value: null, label: 'None' },
          ...workflowsData.map((workflow: any) => ({
            value: workflow.id,
            label: workflow.name
          }))
        ]);
        setSelectedWorkflow(null);
        setSources(sourcesData.map((source: any) => ({
          value: source,
          label: source.replace(/[-_]/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())
        })));
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load models or chatbots');
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);


  const handleSubmit = async () => {
    if (!selectedModel || !selectedChatbot || !selectedSource || !inputText.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      const accountData = {
        data: inputText,
        model_id: selectedModel?.value,
        chatbot_id: selectedChatbot?.value,
        source: selectedSource?.value,
        workflow_id: selectedWorkflow,
        trigger_execution: triggerExecution,
        pattern: enablePattern ? pattern : undefined,
      };

      await addAccount(agencyId, accountData);
      toast.success("Account added successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      onRequestClose();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.detail || "An error occurred. Please try again.");
    }
  };

  const renderNumberedTextArea = () => {
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const lines = inputText.split("\n");

    const handleScroll = () => {
      if (lineNumbersRef.current && textAreaRef.current) {
        lineNumbersRef.current.scrollTop = textAreaRef.current.scrollTop;
        lineNumbersRef.current.scrollLeft = textAreaRef.current.scrollLeft;
      }
    };

    return (
      <div
        style={{
          display: "flex",
          maxHeight: "400px",
          overflow: "hidden", // Prevent container from having its own scrollbars
          fontFamily: "monospace",
          border: "1px solid #ccc",
          backgroundColor: "#f8f9fa",
        }}
      >
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          style={{
            flex: "0 0 auto",
            textAlign: "right",
            marginRight: "10px",
            userSelect: "none",
            whiteSpace: "pre",
            overflow: "hidden", // Line numbers shouldn't scroll independently
            backgroundColor: "#e9ecef",
            padding: "10px",
            lineHeight: "1.5",
          }}
        >
          {lines.map((_, index) => `${index + 1}\n`).join("")}
        </div>

        {/* Text Area */}
        <textarea
          ref={textAreaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onScroll={handleScroll} // Sync scrolling
          placeholder="Enter accounts (one per line)"
          rows={lines.length}
          style={{
            flex: 1,
            resize: "none",
            outline: "none",
            border: "none",
            overflow: "auto", // Allow scrolling for long content
            lineHeight: "1.5",
            whiteSpace: "pre", // Preserve spaces and tabs
            fontFamily: "monospace",
            padding: "10px",
          }}
        />
      </div>
    );
  };

  const renderPatternInput = () => {
    const formatPattern = (text: string) => {
      const regex = /\{(.*?)\}/g;
      return text.replace(regex, '<span style="color: red;">{$1}</span>').replace(/\[spaces\]/g, '<span style="color: blue;">[spaces]</span>');
    };

    const handlePatternChange = (e: React.FormEvent<HTMLDivElement>) => {
      const text = e.currentTarget.innerText;
      setPattern(text);
    };

    return (
      <div
        contentEditable
        onInput={handlePatternChange}
        dangerouslySetInnerHTML={{ __html: formatPattern(pattern) }}
        className="form-control"
        style={{ whiteSpace: 'pre-wrap', minHeight: '40px', border: '1px solid #ccc', padding: '10px' }}
      />
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Add Account Modal"
    >
      <div className="modal-header">
        <h2>Add Account</h2>
        <button 
          onClick={onRequestClose} 
          className="btn-close"
          aria-label="Close"
        ></button>
      </div>
      <div className="modal-body">
        {/* <div className="mb-3">
          <label className="form-label">Model</label>
          <Select
            value={selectedModel}
            onChange={setSelectedModel}
            options={models}
            isClearable
            placeholder="Select Model..."
            className="basic-select model-select"
            classNamePrefix="select"
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 })
            }}
          />
        </div> */}
        {/* <div className="mb-3">
          <label className="form-label">Chatbot</label>
          <Select
            value={selectedChatbot}
            onChange={setSelectedChatbot}
            options={chatbots}
            isClearable
            placeholder="Select Chatbot..."
            className="basic-select chatbot-select"
            classNamePrefix="select"
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 })
            }}
          />
        </div> */}
        <div className="mb-3">
          <label className="form-label">Source</label>
          <CreatableSelect
            value={selectedSource}
            onChange={setSelectedSource}
            options={sources}
            isClearable
            placeholder="Select or create a source..."
            className="basic-select source-select"
            classNamePrefix="select"
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 })
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Workflow</label>
          <Select
            value={workflows.find(workflow => workflow.value === selectedWorkflow) || null}
            onChange={(option) => setSelectedWorkflow(option ? option.value : null)}
            options={workflows}
            isClearable
            placeholder="Select Workflow..."
            className="basic-select workflow-select"
            classNamePrefix="select"
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 })
            }}
          />
        </div>
        <div className="form-group">
          <label>
            Trigger Execution
            <input
              type="checkbox"
              checked={triggerExecution}
              onChange={(e) => setTriggerExecution(e.target.checked)}
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Enable Pattern
            <input
              type="checkbox"
              checked={enablePattern}
              onChange={(e) => setEnablePattern(e.target.checked)}
            />
          </label>
        </div>
        {enablePattern && (
          <div className="form-group">
            {renderPatternInput()}
          </div>
        )}
        <div className="numbered-textarea-container">
          {renderNumberedTextArea()}
        </div>
        {errorMessage && (
          <div className="alert alert-danger mt-3">
            {errorMessage}
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button onClick={onRequestClose} className="btn btn-secondary">
          Cancel
        </button>
        <button onClick={handleSubmit} className="btn btn-primary">
          Add Account
        </button>
      </div>
    </Modal>
  );
};

export default AddAccountModal;
