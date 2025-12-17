import { useState, useRef, useEffect } from 'react';
import { Settings, Edit, Trash2, Building, ChevronDown } from 'lucide-react';
import './AdminActionDropdown.css';

const AdminActionDropdown = ({
  onEditEvent,
  onDeleteEvent,
  onManageInstitutions,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleAction = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="admin-action-dropdown" ref={dropdownRef}>
      <button
        className="admin-dropdown-toggle"
        onClick={toggleDropdown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Admin Actions"
      >
        <Settings className="inline-icon" />
        Admin
        <ChevronDown className={`dropdown-arrow ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="admin-dropdown-menu">
          <div className="admin-dropdown-header">
            <div className="admin-dropdown-title">
              <Settings className="admin-title-icon" />
              Admin Actions
            </div>
          </div>

          <div className="admin-dropdown-content">
            <button
              className="admin-dropdown-item edit-item"
              onClick={() => handleAction(onEditEvent)}
              disabled={disabled}
            >
              <Edit className="item-icon" />
              <span className="item-text">Edit Acara</span>
              <span className="item-description">Ubah detail acara</span>
            </button>

            <button
              className="admin-dropdown-item delete-item"
              onClick={() => handleAction(onDeleteEvent)}
              disabled={disabled}
            >
              <Trash2 className="item-icon" />
              <span className="item-text">Hapus Acara</span>
              <span className="item-description">Hapus acara secara permanen</span>
            </button>

            <div className="admin-dropdown-divider"></div>

            <button
              className="admin-dropdown-item institution-item"
              onClick={() => handleAction(onManageInstitutions)}
              disabled={disabled}
            >
              <Building className="item-icon" />
              <span className="item-text">Kelola Institusi</span>
              <span className="item-description">Tambah/edit institusi</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActionDropdown;