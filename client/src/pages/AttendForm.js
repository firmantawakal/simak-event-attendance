import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '../api/client';

const AttendForm = () => {
  const { eventSlug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  useEffect(() => {
    fetchEvent();
  }, [eventSlug]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/events/slug/${eventSlug}`);
      setEvent(response.data.event);
    } catch (err) {
      setError('Event not found');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);

      const attendanceData = {
        eventSlug,
        ...data,
        representativeCount: parseInt(data.representativeCount) || 1
      };

      await apiClient.post('/api/attendance', attendanceData);

      toast.success('Attendance recorded successfully!');
      reset();

      // Show success message
      setTimeout(() => {
        navigate(`/attend/${eventSlug}/success`);
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to record attendance';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center">
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center">
        <div className="card">
          <h2>Event Not Found</h2>
          <p className="text-muted">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="attend-form">
      <div className="event-info card mb-3">
        <h1>{event.name}</h1>
        <div className="event-details">
          <p><strong>Date:</strong> {formatDate(event.date)}</p>
          {event.location && (
            <p><strong>Location:</strong> {event.location}</p>
          )}
          {event.description && (
            <p className="text-muted">{event.description}</p>
          )}
        </div>
      </div>

      <div className="attendance-form card">
        <h2>Guest Registration</h2>
        <p className="text-muted">
          Please fill in your information to record your attendance
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className={`form-control ${errors.guestName ? 'is-invalid' : ''}`}
              placeholder="Enter your full name"
              {...register('guestName', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                }
              })}
            />
            {errors.guestName && (
              <span className="error">{errors.guestName.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Institution *</label>
            <input
              type="text"
              className={`form-control ${errors.institution ? 'is-invalid' : ''}`}
              placeholder="Enter your institution name"
              {...register('institution', {
                required: 'Institution name is required',
                minLength: {
                  value: 2,
                  message: 'Institution name must be at least 2 characters'
                }
              })}
            />
            {errors.institution && (
              <span className="error">{errors.institution.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Position</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your position/title"
              {...register('position')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              placeholder="Enter your phone number"
              {...register('phone')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="Enter your email address"
              {...register('email', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && (
              <span className="error">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Number of People Represented *</label>
            <input
              type="number"
              className={`form-control ${errors.representativeCount ? 'is-invalid' : ''}`}
              placeholder="1"
              min="1"
              max="100"
              defaultValue="1"
              {...register('representativeCount', {
                required: 'This field is required',
                min: {
                  value: 1,
                  message: 'Must be at least 1 person'
                },
                max: {
                  value: 100,
                  message: 'Cannot exceed 100 people'
                }
              })}
            />
            {errors.representativeCount && (
              <span className="error">{errors.representativeCount.message}</span>
            )}
            <small className="text-muted">
              How many people are you representing at this event?
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-control"
              defaultValue="guest"
              {...register('category')}
            >
              <option value="guest">Guest</option>
              <option value="official_invitation">Official Invitation</option>
              <option value="sponsor">Sponsor</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting}
            >
              {submitting ? 'Recording Attendance...' : 'Record Attendance'}
            </button>
          </div>

          <div className="text-center text-muted">
            <small>
              By submitting this form, you confirm your attendance at this event
            </small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendForm;