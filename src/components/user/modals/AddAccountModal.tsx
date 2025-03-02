import React, { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
  Chip,
  Tooltip,
  IconButton,
  Autocomplete,
  Typography
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { toast } from 'react-toastify';
import CreatableSelect from 'react-select/creatable';

// --- Example imports (replace with your actual functions) ---
import { addAccount, fetchSources } from '../../../services/accountsService';
import { fetchModels } from '../../../services/modelsService';
import { fetchChatbots } from '../../../services/chatbotsService';
import { fetchWorkflowsSimplified } from '../../../services/workflowService';
// -----------------------------------------------------------

interface AddAccountModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  agencyId: string;
}

const PLACEHOLDER_OPTIONS = [
  { label: 'two_fa_secret', value: 'two_fa_secret' },
  { label: 'proxy', value: 'proxy' },
  { label: 'username', value: 'username' },
  { label: 'password', value: 'password' },
  { label: 'email', value: 'email' },
  { label: 'email_password', value: 'email_password' },
  { label: 'creation_date', value: 'creation_date' },
  { label: 'snapchat_link', value: 'snapchat_link' },
  // We can also include [spaces] as an item:
  { label: '[spaces]', value: '[spaces]' },
];

/**
 * Build a final string from the array of selected placeholders.
 * If item is [spaces], we append it literally. Otherwise, we wrap it with { }.
 */
const buildPatternString = (placeholders: string[]): string => {
  return placeholders
    .map((item) => (item === '[spaces]' ? '[spaces]' : `{${item}}`))
    .join('');
};

const tooltipText = `
Use one line per account, with at least two fields:
1. Username (automatically lowercased)
2. Password

Optionally, you can provide:
- A creation date (YYYY or YYYY-MM-DD). If missing, today's date is used.
- A 2FA secret (32 alphanumeric chars) or proxy (e.g., IP:PORT).
- An email and email password if the next field has '@'.

Examples:
  john123 myPass123
  john123 myPass123 2023
  john123 myPass123 2022-01-01 myemail@example.com secretEmailPass
  john123 myPass123 192.168.1.1:8080
  john123 myPass123 2023 1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6

A Snapchat link is auto-created from the username.

If you want to override the default parsing order, enable the custom pattern in the UI.
`;

const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onRequestClose,
  agencyId,
}) => {
  // ---------------------
  //  Basic form states
  // ---------------------
  const [errorMessage, setErrorMessage] = useState('');
  const [models, setModels] = useState<any[]>([]);
  const [chatbots, setChatbots] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedChatbot, setSelectedChatbot] = useState<string | null>(null);
  const [sources, setSources] = useState<{ label: string; value: string }[]>([]);
  const [selectedSource, setSelectedSource] = useState<{ label: string; value: string } | null>(null);
  const [workflows, setWorkflows] = useState<{ label: string; value: number }[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [triggerExecution, setTriggerExecution] = useState(true);

  // For the line-numbered "accounts" text area:
  const [inputText, setInputText] = useState('');

  // ---------------------
  //  Pattern states
  // ---------------------
  const [enablePattern, setEnablePattern] = useState(false);
  // We'll store the *raw values* in an array, e.g. ["username", "[spaces]", "password"]
  // Then build the final pattern from them
  const [patternItems, setPatternItems] = useState<string[]>([]);

  // ---------------------
  //  Load data on mount
  // ---------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        const [modelsData, chatbotsData, workflowsData, sourcesData] = await Promise.all([
          fetchModels(agencyId),
          fetchChatbots(agencyId),
          fetchWorkflowsSimplified(agencyId),
          fetchSources(agencyId),
        ]);

        // Convert models to something for <Select>
        setModels(modelsData); // or transform to {value,label} if you prefer
        setChatbots(chatbotsData);
        setWorkflows(
          workflowsData.map((wf: any) => ({
            label: wf.name,
            value: wf.id,
          }))
        );

        // For sources, let's store them as strings:
        setSources(sourcesData.map((src: string) => ({ label: src, value: src })));
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      }
    };

    if (isOpen) {
      loadData();
      // Reset error, input, pattern if needed
      setErrorMessage('');
    }
  }, [isOpen, agencyId]);

  // ---------------------
  //  Submitting the form
  // ---------------------
  const handleSubmit = async () => {
    if (!selectedSource || !inputText.trim()) {
      setErrorMessage('Please fill in all required fields (Source & Accounts).');
      return;
    }

    try {
      const finalPattern = enablePattern ? buildPatternString(patternItems) : undefined;

      const accountData = {
        data: inputText,
        model_id: selectedModel,    // or parseInt if needed
        chatbot_id: selectedChatbot, // or parseInt if needed
        source: selectedSource.value,
        workflow_id: selectedWorkflow,
        trigger_execution: triggerExecution,
        pattern: finalPattern,
      };

      await addAccount(agencyId, accountData);
      toast.success('Account added successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });

      onRequestClose();
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.detail || 'An error occurred. Please try again.');
    }
  };

  // ---------------------
  //  Numbered TextField
  // ---------------------
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleScroll = () => {
    if (lineNumbersRef.current && textAreaRef.current) {
      lineNumbersRef.current.scrollTop = textAreaRef.current.scrollTop;
      lineNumbersRef.current.scrollLeft = textAreaRef.current.scrollLeft;
    }
  };

  const renderNumberedTextArea = () => {
    const lines = inputText.split('\n');

    return (
      <Box
        sx={{
          display: 'flex',
          maxHeight: 400,
          overflow: 'hidden',
          fontFamily: 'monospace',
          border: '1px solid #ccc',
          backgroundColor: '#f8f9fa',
          mt: 1,
        }}
      >
        <Box
          ref={lineNumbersRef}
          sx={{
            flex: '0 0 auto',
            textAlign: 'right',
            userSelect: 'none',
            whiteSpace: 'pre',
            overflow: 'hidden',
            backgroundColor: '#e9ecef',
            p: 1,
            lineHeight: '1.5',
          }}
        >
          {lines.map((_, index) => `${index + 1}\n`).join('')}
        </Box>
        <Box sx={{ flex: 1 }}>
          <textarea
            ref={textAreaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onScroll={handleScroll}
            placeholder="Enter accounts (one per line)"
            rows={lines.length}
            style={{
              width: '100%',
              height: '100%',
              resize: 'none',
              outline: 'none',
              border: 'none',
              overflow: 'auto',
              lineHeight: '1.5',
              whiteSpace: 'pre',
              fontFamily: 'monospace',
              padding: '8px',
              boxSizing: 'border-box',
              background: 'transparent',
            }}
          />
        </Box>
      </Box>
    );
  };

  // ---------------------
  //  Pattern Builder
  // ---------------------
  // We use MUI Autocomplete with multiple.
  // Each time user picks an item, we update the array in the chosen order.
  const [autocompleteValue, setAutocompleteValue] = useState<any[]>([]);

  // sync patternItems <-> autocompleteValue
  // Because MUI Autocomplete with "multiple" expects an array of objects { label, value } or just strings
  // We'll store them as an array of strings. Let's do it with objects for the UI:
  const placeholdersAsObjects = patternItems.map((val) =>
    PLACEHOLDER_OPTIONS.find((o) => o.value === val) || { label: val, value: val }
  );

  const handleAutocompleteChange = (event: any, newValue: any[]) => {
    // `newValue` is an array of items (like { label, value })
    // We'll convert them to an array of strings for patternItems
    const newItems = newValue.map((item) => item.value);
    setPatternItems(newItems);
    setAutocompleteValue(newValue);
  };

  const renderPatternBuilder = () => {
    const finalPatternPreview = buildPatternString(patternItems);

    return (
      <Box sx={{ mt: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          Build your pattern by selecting placeholders:
        </Typography>

        <Autocomplete
          multiple
          options={PLACEHOLDER_OPTIONS}
          getOptionLabel={(option) => option.label}
          value={placeholdersAsObjects}
          onChange={handleAutocompleteChange}
          renderInput={(params) => (
            <TextField {...params} label="Select placeholders" variant="outlined" />
          )}
          sx={{ mb: 2, width: 400 }}
        />

        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          <strong>Preview:</strong> {finalPatternPreview || '(empty)'}
        </Typography>
      </Box>
    );
  };

  // ---------------------
  //  Render
  // ---------------------
  return (
    <Dialog open={isOpen} onClose={onRequestClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Account</DialogTitle>

      <DialogContent dividers>
        {/* Model Selection (optional) */}
        {/* 
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="model-label">Model</InputLabel>
          <Select
            labelId="model-label"
            label="Model"
            value={selectedModel || ''}
            onChange={(e) => setSelectedModel(e.target.value as string)}
          >
            <MenuItem value="">(none)</MenuItem>
            {models.map((m: any) => (
              <MenuItem key={m.id} value={m.id}>
                {m.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        */}

        {/* Chatbot Selection (optional) */}
        {/* 
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="chatbot-label">Chatbot</InputLabel>
          <Select
            labelId="chatbot-label"
            label="Chatbot"
            value={selectedChatbot || ''}
            onChange={(e) => setSelectedChatbot(e.target.value as string)}
          >
            <MenuItem value="">(none)</MenuItem>
            {chatbots.map((c: any) => (
              <MenuItem key={c.id} value={c.id}>
                {c.type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        */}

        {/* Source Selection */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Autocomplete
            freeSolo
            options={sources} // assuming sources is an array of objects with { label, value }
            value={selectedSource}
            onChange={(event, newValue) => {
              setSelectedSource(newValue);
            }}
            // When using objects, specify how to display each option
            getOptionLabel={(option) =>
              typeof option === 'string' ? option : option.label || ''
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Source"
                variant="outlined"
              />
            )}
          />
      </FormControl>

        {/* Workflow Selection */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="workflow-label">Workflow</InputLabel>
          <Select
            labelId="workflow-label"
            label="Workflow"
            value={selectedWorkflow || ''}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedWorkflow(val === '' ? null : Number(val));
            }}
          >
            <MenuItem value="">(none)</MenuItem>
            {workflows.map((wf) => (
              <MenuItem key={wf.value} value={wf.value}>
                {wf.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Trigger Execution */}
        <FormControlLabel
          sx={{ mb: 2 }}
          control={
            <Switch
              checked={triggerExecution}
              onChange={(e) => setTriggerExecution(e.target.checked)}
            />
          }
          label="Trigger Execution"
        />

        {/* Enable Pattern */}
        <FormControlLabel
          sx={{ mb: 2 }}
          control={
            <Switch
              checked={enablePattern}
              onChange={(e) => setEnablePattern(e.target.checked)}
            />
          }
          label="Enable Pattern Builder"
        />

        {/* Pattern Builder (if enabled) */}
        {enablePattern && renderPatternBuilder()}

        {/* Numbered Text Area for "accounts" */}
        <Box sx={{ mt: 3 }}>
          {/* "Accounts (one per line)" label with an info tooltip */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ mr: 1 }}>
              Accounts (one per line)
            </Typography>
            <Tooltip
              title={
                <Box sx={{ whiteSpace: 'pre-line' }}>{tooltipText}</Box>
              }
              arrow
            >
              <IconButton size="small">
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Our line-numbered text area */}
          {renderNumberedTextArea()}
        </Box>

        {/* Error message */}
        {errorMessage && (
          <Typography color="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onRequestClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          Add Account
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAccountModal;
