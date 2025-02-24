import React, { useRef, useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addProxy } from '../../../services/proxyService';

interface AddProxyModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const AddProxyModal: React.FC<AddProxyModalProps> = ({ isOpen, onRequestClose }) => {
  const [proxyText, setProxyText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    try {
      await addProxy(proxyText);
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
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Add Proxies"
      style={{
        content: {
          width: '80%',
          maxWidth: '800px',
          height: 'fit-content',
          margin: 'auto',
          padding: '20px',
        },
      }}
    >
      <div className="modal-header">
        <h2>Add Proxies</h2>
      </div>
      <div className="modal-body">
        {renderNumberedTextArea()}
        {errorMessage && <div className="text-danger mt-2">{errorMessage}</div>}
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onRequestClose}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSubmit}>
          Add
        </button>
      </div>
    </Modal>
  );
};

export default AddProxyModal;
