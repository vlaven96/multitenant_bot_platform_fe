import React from 'react';
import Modal from 'react-modal';
Modal.setAppElement("#root");
interface AddChatbotModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (type: string, token: string) => void;
  isEditMode: boolean;
  chatbot?: { id: string; type: string; token: string };
  agencyId: string;
}

const AddChatbotModal: React.FC<AddChatbotModalProps> = ({ isOpen, onRequestClose, onSubmit, isEditMode, chatbot , agencyId}) => {
  const [type, setName] = React.useState(chatbot?.type || '');
  const [token, setToken] = React.useState(chatbot?.token || '');

  React.useEffect(() => {
    if (isEditMode && chatbot) {
      setName(chatbot.type);
      setToken(chatbot.token);
    }
  }, [isEditMode, chatbot]);

  const handleCloseModal = () => {
    setName('');
    setToken('');
    onRequestClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(type, token);
    handleCloseModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCloseModal}
      contentLabel={isEditMode ? 'Edit Chatbot' : 'Add New Chatbot'}
      ariaHideApp={false}
      className="add-chatbot-modal"
      overlayClassName="add-chatbot-modal-overlay"
    >
      <h2>{isEditMode ? 'Edit Chatbot' : 'Add New Chatbot'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={type}
            onChange={(e) => setName(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label>Token</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
        <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
      </form>
    </Modal>
  );
};

export default AddChatbotModal; 