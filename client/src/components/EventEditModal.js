import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '../api/client';
import './EventEditModal.css';
import { Calendar, MapPin, FileText, Save, X, AlertCircle } from 'lucide-react';

const EventEditModal = ({ isOpen, onClose, onSave, event }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    setError
  } = useForm({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      date: '',
      location: ''
    }
  });

  const watchName = watch('name', '');

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Auto-generate slug when name changes
  useEffect(() => {
    if (watchName && !event) { // Only auto-generate for new events
      setValue('slug', generateSlug(watchName));
    }
  }, [watchName, setValue, event]);

  useEffect(() => {
    if (event && isOpen) {
      setIsLoading(true);
      reset({
        name: event.name || '',
        slug: event.slug || '',
        description: event.description || '',
        date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
        location: event.location || ''
      });
      setIsLoading(false);
    } else if (!event && isOpen) {
      // Reset form for new event creation
      reset({
        name: '',
        slug: '',
        description: '',
        date: '',
        location: ''
      });
    }
  }, [event, isOpen, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        date: new Date(data.date).toISOString()
      };

      let response;
      if (event) {
        // Update existing event
        response = await apiClient.put(`/events/${event.id}`, payload);
        toast.success('Acara berhasil diperbarui!');
      } else {
        // Create new event
        response = await apiClient.post('/events', payload);
        toast.success('Acara berhasil dibuat!');
      }

      if (onSave && response?.data) {
        // Handle different possible response structures
        const updatedEvent = response.data.event || response.data;
        onSave(updatedEvent);
      }

      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error response:', error.response);

      let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';

      // Extract error message from response
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Handle validation errors if they exist and are valid objects
      if (error.response?.data?.errors &&
          typeof error.response.data.errors === 'object' &&
          error.response.data.errors !== null) {
        try {
          // Set field-specific errors
          Object.entries(error.response.data.errors).forEach(([field, message]) => {
            setError(field, { type: 'manual', message: String(message) });
          });
        } catch (destructuringError) {
          console.error('Error destructuring validation errors:', destructuringError);
          // Fallback to general error
          setError('root', { type: 'manual', message: errorMessage });
        }
      } else {
        // Set general error
        setError('root', { type: 'manual', message: errorMessage });
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError('root', { type: 'manual', message: '' });
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="event-edit-modal-overlay" onClick={handleClose} onKeyDown={handleKeyDown} tabIndex="-1">
      <div className="event-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="event-edit-modal-header">
          <h2 className="event-edit-modal-title">
            {event ? 'Edit Acara' : 'Tambah Acara Baru'}
          </h2>
          <button
            className="event-edit-modal-close"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="event-edit-modal-loading">
            <div className="loading-spinner"></div>
            <p>Memuat data...</p>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit(onSubmit)} className="event-edit-form">
            {errors.root && (
              <div className="event-edit-error">
                <AlertCircle size={16} />
                <span>{errors.root.message}</span>
              </div>
            )}

            <div className="event-edit-form-group">
              <label htmlFor="name" className="event-edit-form-label">
                Nama Acara <span className="required">*</span>
              </label>
              <div className="event-edit-input-wrapper">
                <FileText className="event-edit-input-icon" size={16} />
                <input
                  type="text"
                  id="name"
                  {...register('name', {
                    required: 'Nama acara harus diisi',
                    minLength: {
                      value: 3,
                      message: 'Nama acara minimal 3 karakter'
                    }
                  })}
                  className={`event-edit-input ${errors.name ? 'error' : ''}`}
                  placeholder="Masukkan nama acara"
                  disabled={isSubmitting}
                />
              </div>
              {errors.name && <span className="event-edit-error-text">{errors.name.message}</span>}
            </div>

            <div className="event-edit-form-group">
              <label htmlFor="slug" className="event-edit-form-label">
                Slug <span className="required">*</span>
              </label>
              <div className="event-edit-input-wrapper">
                <FileText className="event-edit-input-icon" size={16} />
                <input
                  type="text"
                  id="slug"
                  {...register('slug', {
                    required: 'Slug harus diisi',
                    pattern: {
                      value: /^[a-z0-9-]+$/,
                      message: 'Slug hanya boleh mengandung huruf kecil, angka, dan hubung (-)'
                    }
                  })}
                  className={`event-edit-input ${errors.slug ? 'error' : ''}`}
                  placeholder="nama-acara"
                  disabled={isSubmitting || !!event} // Disable for existing events
                />
              </div>
              {errors.slug && <span className="event-edit-error-text">{errors.slug.message}</span>}
              <small className="event-edit-help-text">
                Slug akan digunakan untuk URL acara. Gunakan huruf kecil, angka, dan hubung (-).
              </small>
            </div>

            <div className="event-edit-form-group">
              <label htmlFor="date" className="event-edit-form-label">
                Tanggal Acara <span className="required">*</span>
              </label>
              <div className="event-edit-input-wrapper">
                <Calendar className="event-edit-input-icon" size={16} />
                <input
                  type="datetime-local"
                  id="date"
                  {...register('date', {
                    required: 'Tanggal acara harus diisi'
                  })}
                  className={`event-edit-input ${errors.date ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.date && <span className="event-edit-error-text">{errors.date.message}</span>}
            </div>

            <div className="event-edit-form-group">
              <label htmlFor="location" className="event-edit-form-label">
                Lokasi Acara
              </label>
              <div className="event-edit-input-wrapper">
                <MapPin className="event-edit-input-icon" size={16} />
                <input
                  type="text"
                  id="location"
                  {...register('location')}
                  className="event-edit-input"
                  placeholder="Masukkan lokasi acara"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="event-edit-form-group">
              <label htmlFor="description" className="event-edit-form-label">
                Deskripsi Acara
              </label>
              <textarea
                id="description"
                {...register('description', {
                  maxLength: {
                    value: 1000,
                    message: 'Deskripsi tidak boleh lebih dari 1000 karakter'
                  }
                })}
                className="event-edit-textarea"
                placeholder="Masukkan deskripsi acara"
                rows={4}
                disabled={isSubmitting}
              />
              {errors.description && <span className="event-edit-error-text">{errors.description.message}</span>}
            </div>

            <div className="event-edit-modal-actions">
              <button
                type="button"
                className="event-edit-button event-edit-button-secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                type="submit"
                className="event-edit-button event-edit-button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {event ? 'Perbarui' : 'Simpan'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EventEditModal;