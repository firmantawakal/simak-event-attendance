import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '../api/client';
import './EventCreate.css';

const EventCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm();

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

  React.useEffect(() => {
    if (watchName) {
      setValue('slug', generateSlug(watchName));
    }
  }, [watchName, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Format date for API
      const eventData = {
        ...data,
        date: new Date(data.date).toISOString()
      };

      await apiClient.post('/events', eventData);

      toast.success('Acara berhasil dibuat!');
      navigate('/events');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Gagal membuat acara';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-create">
      <div className="card">
        <h1>Buat Acara Baru</h1>
        <p>Isi detail di bawah ini untuk membuat acara baru</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Nama Acara *</label>
            <input
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="Masukkan nama acara"
              {...register('name', {
                required: 'Nama acara wajib diisi',
                minLength: {
                  value: 3,
                  message: 'Nama acara minimal 3 karakter'
                }
              })}
            />
            {errors.name && (
              <span className="error">{errors.name.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">URL Slug *</label>
            <input
              type="text"
              className={`form-control ${errors.slug ? 'is-invalid' : ''}`}
              placeholder="nama-acara"
              {...register('slug', {
                required: 'URL slug wajib diisi',
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: 'Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung'
                }
              })}
            />
            {errors.slug && (
              <span className="error">{errors.slug.message}</span>
            )}
            <small className="text-muted">
              Ini akan digunakan dalam URL: /attend/{watch('slug') || 'nama-acara'}
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              rows="3"
              placeholder="Masukkan deskripsi acara (opsional)"
              {...register('description', {
                maxLength: {
                  value: 1000,
                  message: 'Deskripsi tidak boleh lebih dari 1000 karakter'
                }
              })}
            />
            {errors.description && (
              <span className="error">{errors.description.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Tanggal dan Waktu *</label>
            <input
              type="datetime-local"
              className={`form-control ${errors.date ? 'is-invalid' : ''}`}
              {...register('date', {
                required: 'Tanggal dan waktu wajib diisi'
              })}
            />
            {errors.date && (
              <span className="error">{errors.date.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Lokasi</label>
            <input
              type="text"
              className={`form-control ${errors.location ? 'is-invalid' : ''}`}
              placeholder="Masukkan lokasi acara (opsional)"
              {...register('location')}
            />
            {errors.location && (
              <span className="error">{errors.location.message}</span>
            )}
          </div>

          <div className="btn-group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/events')}
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Membuat...' : 'Buat Acara'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventCreate;