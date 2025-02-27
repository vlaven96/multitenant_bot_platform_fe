import React from 'react';
import Modal from 'react-modal';
import { addModel, updateModel } from '../../../services/modelsService';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

interface AddModelModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (name: string, url: string) => void;
  isEditMode: boolean;
  model?: any;
  agencyId: string;
}

const AddModelModal: React.FC<AddModelModalProps> = ({ isOpen, onRequestClose, onSubmit, isEditMode, model, agencyId }) => {
  const [name, setName] = React.useState(model?.name || '');
  const [onlyfans_url, setOnlyfansUrl] = React.useState(model?.onlyfans_url || '');

  React.useEffect(() => {
    if (isEditMode && model) {
      setName(model.name);
      setOnlyfansUrl(model.onlyfans_url);
    }
  }, [isEditMode, model]);

  const handleCloseModal = () => {
    setName('');
    setOnlyfansUrl('');
    onRequestClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!agencyId) {
        console.error('Agency ID is undefined');
        return;
      }
      if (isEditMode) {
        await updateModel(agencyId, { id: model.id, name, onlyfans_url });
      } else {
        await addModel(agencyId, { name, onlyfans_url });
        onSubmit(name, onlyfans_url);
      }
      setName('');
      setOnlyfansUrl('');
      onRequestClose();
    } catch (error) {
      console.error('Failed to save model:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCloseModal}
      contentLabel="Add Model"
      ariaHideApp={false}
      className="add-model-modal"
      overlayClassName="add-model-modal-overlay"
    >
      <h2>{isEditMode ? 'Edit Model' : 'Add New Model'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label>URL</label>
          <input
            type="url"
            value={onlyfans_url}
            onChange={(e) => setOnlyfansUrl(e.target.value)}
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

export default AddModelModal; 