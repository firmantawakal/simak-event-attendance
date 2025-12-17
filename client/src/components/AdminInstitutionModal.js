import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../api/client';
import './AdminInstitutionModal.css';
import { CheckIcon, Plus, Trash2 } from 'lucide-react';

const AdminInstitutionModal = ({ isOpen, onClose, onSave }) => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newInstitution, setNewInstitution] = useState({ name: '', type: 'university' });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const institutionTypes = [
    { value: 'university', label: 'Universitas', icon: '🎓' },
    { value: 'school', label: 'Sekolah', icon: '🏫' },
    { value: 'government', label: 'Pemerintahan', icon: '🏛️' },
    { value: 'company', label: 'Perusahaan', icon: '💼' },
    { value: 'other', label: 'Lainnya', icon: '📋' }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchInstitutions();
    }
  }, [isOpen]);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/institutions');
      setInstitutions(response.data.institutions || []);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      toast.error('Gagal memuat data institusi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstitution = async () => {
    if (!newInstitution.name.trim()) {
      toast.error('Nama institusi wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post('/institutions', {
        name: newInstitution.name.trim(),
        type: newInstitution.type
      });

      setNewInstitution({ name: '', type: 'university' });
      await fetchInstitutions();
      toast.success('Institusi berhasil ditambahkan');
    } catch (error) {
      console.error('Error adding institution:', error);
      toast.error(error.response?.data?.message || 'Gagal menambah institusi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditInstitution = (institution) => {
    setEditingId(institution.id);
    setNewInstitution({
      name: institution.name,
      type: institution.type
    });
  };

  const handleUpdateInstitution = async () => {
    if (!newInstitution.name.trim()) {
      toast.error('Nama institusi wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.put(`/institutions/${editingId}`, {
        name: newInstitution.name.trim(),
        type: newInstitution.type
      });

      setEditingId(null);
      setNewInstitution({ name: '', type: 'university' });
      await fetchInstitutions();
      toast.success('Institusi berhasil diperbarui');
    } catch (error) {
      console.error('Error updating institution:', error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui institusi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInstitution = async (id, name) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus "${name}"?`)) {
      try {
        const response = await apiClient.delete(`/institutions/${id}`);
        await fetchInstitutions();
        toast.success('Institusi berhasil dihapus');
      } catch (error) {
        console.error('Error deleting institution:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });

        // Provide more specific error messages
        if (error.response?.status === 403) {
          toast.error('Anda tidak memiliki izin untuk menghapus institusi');
        } else if (error.response?.status === 400 && error.response?.data?.message?.includes('being used')) {
          toast.error('Tidak dapat menghapus institusi yang sudah digunakan dalam data kehadiran');
        } else if (error.response?.status === 404) {
          toast.error('Institusi tidak ditemukan');
        } else {
          toast.error(error.response?.data?.message || 'Gagal menghapus institusi');
        }
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewInstitution({ name: '', type: 'university' });
  };

  const handleSave = () => {
    onSave();
    onClose();
  };

  const filteredInstitutions = institutions.filter(institution =>
    institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container institution-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            <svg className="modal-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H6a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
            </svg>
            Kelola Institusi
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="institution-form">
            <h3 className="form-title">
              {editingId ? 'Edit Institusi' : 'Tambah Institusi Baru'}
            </h3>
            <div className="form-row">
              <input
                type="text"
                className="form-input"
                placeholder="Nama institusi"
                value={newInstitution.name}
                onChange={(e) => setNewInstitution({ ...newInstitution, name: e.target.value })}
              />
              <select
                className="form-select"
                value={newInstitution.type}
                onChange={(e) => setNewInstitution({ ...newInstitution, type: e.target.value })}
              >
                {institutionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
              {editingId ? (
                <div className="button-group">
                  <button className="btn btn-success" onClick={handleUpdateInstitution} disabled={submitting}>
                    <CheckIcon className="inline-icon" color="#ffffff"/>
                    {submitting ? 'Menyimpan...' : 'Update'}
                  </button>
                  <button className="btn btn-secondary" onClick={handleCancelEdit} disabled={submitting}>
                    Batal
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={handleAddInstitution} disabled={submitting}>
                  <Plus className="inline-icon" />
                  {submitting ? 'Menambah...' : 'Tambah'}
                </button>
              )}
            </div>
          </div>

          <div className="institution-search">
            <input
              type="text"
              className="search-input"
              placeholder="Cari institusi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="institution-list">
            {loading ? (
              <div className="loading">Memuat data institusi...</div>
            ) : filteredInstitutions.length === 0 ? (
              <div className="empty-state">
                <svg className="empty-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H6a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
                <p>Belum ada institusi yang terdaftar</p>
              </div>
            ) : (
              <div className="institution-grid">
                {filteredInstitutions.map((institution) => {
                  const typeInfo = institutionTypes.find(t => t.value === institution.type);
                  return (
                    <div key={institution.id} className="institution-card">
                      <div className="institution-info">
                        <span className="institution-type-icon">{typeInfo?.icon}</span>
                        <div className="institution-details">
                          <h4 className="institution-name">{institution.name}</h4>
                          <span className="institution-type">{typeInfo?.label}</span>
                        </div>
                      </div>
                      <div className="institution-actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditInstitution(institution)}
                          title="Edit"
                        >
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteInstitution(institution.id, institution.name)}
                          title="Hapus"
                        >
                          <Trash2 className="inline-icon" color="#ffffff"/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminInstitutionModal;