import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '../api/client';

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

      await apiClient.post('/api/events', eventData);

      toast.success('Event created successfully!');
      navigate('/events');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create event';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-create">
      <div className="card">
        <h1>Create New Event</h1>
        <p>Fill in the details below to create a new event</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-3">
          <div className="form-group">
            <label className="form-label">Event Name *</label>
            <input
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="Enter event name"
              {...register('name', {
                required: 'Event name is required',
                minLength: {
                  value: 3,
                  message: 'Event name must be at least 3 characters'
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
              placeholder="event-slug"
              {...register('slug', {
                required: 'URL slug is required',
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: 'Slug can only contain lowercase letters, numbers, and hyphens'
                }
              })}
            />
            {errors.slug && (
              <span className="error">{errors.slug.message}</span>
            )}
            <small className="text-muted">
              This will be used in the URL: /attend/{watch('slug') || 'event-slug'}
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              rows="3"
              placeholder="Enter event description (optional)"
              {...register('description', {
                maxLength: {
                  value: 1000,
                  message: 'Description cannot exceed 1000 characters'
                }
              })}
            />
            {errors.description && (
              <span className="error">{errors.description.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Date and Time *</label>
            <input
              type="datetime-local"
              className={`form-control ${errors.date ? 'is-invalid' : ''}`}
              {...register('date', {
                required: 'Date and time are required'
              })}
            />
            {errors.date && (
              <span className="error">{errors.date.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              className={`form-control ${errors.location ? 'is-invalid' : ''}`}
              placeholder="Enter event location (optional)"
              {...register('location')}
            />
            {errors.location && (
              <span className="error">{errors.location.message}</span>
            )}
          </div>

          <div className="form-group">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
            <button
              type="button"
              className="btn btn-secondary ml-2"
              onClick={() => navigate('/events')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventCreate;