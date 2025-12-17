import { useState } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemType, itemName }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay" onClick={handleClose}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <div className="delete-modal-icon">
            <AlertTriangle size={24} />
          </div>
          <button
            className="delete-modal-close"
            onClick={handleClose}
            disabled={isDeleting}
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        <div className="delete-modal-content">
          <h2 className="delete-modal-title">
            Hapus {itemType}?
          </h2>

          <p className="delete-modal-message">
            Apakah Anda yakin ingin menghapus <strong>{itemName}</strong>?
          </p>

          <p className="delete-modal-warning">
            <AlertTriangle size={16} />
            Tindakan ini tidak dapat dibatalkan dan semua data terkait akan dihapus permanen.
          </p>
        </div>

        <div className="delete-modal-actions">
          <button
            className="delete-button delete-button-cancel"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Batal
          </button>
          <button
            className="delete-button delete-button-confirm"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="loading-spinner"></div>
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Hapus
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;