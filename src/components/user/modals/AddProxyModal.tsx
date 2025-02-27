import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addProxy } from '../../../services/proxyService';
import { useParams } from 'react-router-dom';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';

interface AddProxyModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const AddProxyModal: React.FC<AddProxyModalProps> = ({ isOpen, onRequestClose }) => {
  const { agencyId } = useParams<{ agencyId: string }>();
  const [proxyText, setProxyText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (!agencyId) {
      console.error('Agency ID is undefined');
      return;
    }
    try {
      await addProxy(agencyId, proxyText);
      toast.success('Proxy added successfully!', {
        position: 'top-right',
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
      setErrorMessage(error.response?.data?.detail || 'An error occurred. Please try again.');
    }
  };

  const renderNumberedTextArea = () => {
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const lines = proxyText.split('\n');

    const handleScroll = () => {
      if (lineNumbersRef.current && textAreaRef.current) {
        lineNumbersRef.current.scrollTop = textAreaRef.current.scrollTop;
        lineNumbersRef.current.scrollLeft = textAreaRef.current.scrollLeft;
      }
    };

    return (
      <div
        style={{
          display: 'flex',
          maxHeight: '400px',
          overflow: 'hidden',
          fontFamily: 'monospace',
          border: '1px solid #ccc',
          backgroundColor: '#f8f9fa',
        }}
      >
        <div
          ref={lineNumbersRef}
          style={{
            flex: '0 0 auto',
            textAlign: 'right',
            marginRight: '10px',
            userSelect: 'none',
            whiteSpace: 'pre',
            overflow: 'hidden',
            backgroundColor: '#e9ecef',
            padding: '10px',
            lineHeight: '1.5',
          }}
        >
          {lines.map((_, index) => `${index + 1}\n`).join('')}
        </div>

        <textarea
          ref={textAreaRef}
          value={proxyText}
          onChange={(e) => setProxyText(e.target.value)}
          onScroll={handleScroll}
          placeholder="Enter proxies (one per line) in format: host username password"
          rows={lines.length}
          style={{
            flex: 1,
            resize: 'none',
            outline: 'none',
            border: 'none',
            overflow: 'auto',
            lineHeight: '1.5',
            whiteSpace: 'pre',
            fontFamily: 'monospace',
            padding: '10px',
          }}
        />
      </div>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onRequestClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Add Proxy</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter the proxy details below.
        </DialogContentText>
        {renderNumberedTextArea()}
        {errorMessage && <div className="text-danger mt-2">{errorMessage}</div>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onRequestClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProxyModal;
