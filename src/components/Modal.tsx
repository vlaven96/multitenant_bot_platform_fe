import React from 'react';
import Modal from 'react-modal';
import ReactJson from 'react-json-view';

Modal.setAppElement('#root'); // Set the app element for accessibility

interface InfoModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  content: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onRequestClose, content }) => {
  let jsonData;
  try {
    jsonData = JSON.parse(content); // Parse the JSON content
  } catch (e) {
    jsonData = content; // Fallback to raw content if parsing fails
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Information"
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: 9999
        },
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: '600px',
          height: '80%',
          maxHeight: '500px',
          overflow: 'auto',
          position: 'relative',
          zIndex: 10000
        },
      }}
    >
      <button 
        onClick={onRequestClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'transparent',
          border: 'none',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        ✖
      </button>
      <h2>Details</h2>
      {typeof jsonData === 'object' ? (
        <ReactJson src={jsonData} theme="monokai" />
      ) : (
        <pre>{jsonData}</pre>
      )}
    </Modal>
  );
};

export default InfoModal; 