import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end space-x-4">
        <Button variant="secondary" onClick={onClose}>Annuler</Button>
        <Button variant="primary" onClick={onConfirm}>Confirmer</Button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
