import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

interface TerminateAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Array<{ id: string; username: string; status: string }>;
  onConfirm: (selectedAccountIds: string[]) => void;
}

const TerminateAccountsModal: React.FC<TerminateAccountsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onConfirm
}) => {
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());

  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAccounts(new Set());
    }
  }, [isOpen]);

  const handleToggleAccount = (id: string) => {
    const newSelection = new Set(selectedAccounts);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedAccounts(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedAccounts.size === accounts.length) {
      setSelectedAccounts(new Set());
    } else {
      setSelectedAccounts(new Set(accounts.map(account => account.id)));
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Terminate Accounts</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6>Select accounts to terminate</h6>
            <Button 
              variant="link" 
              onClick={handleSelectAll}
              className="p-0"
            >
              {selectedAccounts.size === accounts.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Username</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedAccounts.has(account.id)}
                        onChange={() => handleToggleAccount(account.id)}
                        className="form-check-input"
                      />
                    </td>
                    <td>{account.username}</td>
                    <td>{account.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => onConfirm(Array.from(selectedAccounts))}
          disabled={selectedAccounts.size === 0}
        >
          Terminate Selected Accounts
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TerminateAccountsModal; 