import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const [eventResponse, attendanceResponse] = await Promise.all([
        apiClient.get(`/api/events/${id}`),
        apiClient.get(`/api/attendance/event/${id}`)
      ]);

      setEvent(eventResponse.data.event);
      setAttendance(attendanceResponse.data.attendance);

      // Calculate stats
      const totalAttendees = attendanceResponse.data.attendance.length;
      const totalInstitutions = new Set(
        attendanceResponse.data.attendance.map(a => a.institution)
      ).size;
      const totalRepresented = attendanceResponse.data.attendance.reduce(
        (sum, a) => sum + a.representative_count, 0
      );

      setStats({
        totalAttendees,
        totalInstitutions,
        totalRepresented
      });
    } catch (err) {
      setError('Failed to fetch event details');
      console.error('Error fetching event details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiClient.get(`/api/attendance/event/${id}/export`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-${event.slug}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data');
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

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
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
          <Link to="/events" className="btn btn-primary">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="event-detail">
      {/* Event Header */}
      <div className="event-header card mb-3">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h1>{event.name}</h1>
            <div className="event-meta">
              <p><strong>Date:</strong> {formatDate(event.date)}</p>
              {event.location && (
                <p><strong>Location:</strong> {event.location}</p>
              )}
              {event.description && (
                <p className="text-muted">{event.description}</p>
              )}
            </div>
          </div>
          <div>
            <Link
              to={`/attend/${event.slug}`}
              className="btn btn-success mr-2"
            >
              Open Guest Form
            </Link>
            <button
              onClick={handleExport}
              className="btn btn-primary"
              disabled={attendance.length === 0}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="stats-section card mb-3">
          <h2>Attendance Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>{stats.totalAttendees}</h3>
              <p>Total Guests</p>
            </div>
            <div className="stat-item">
              <h3>{stats.totalInstitutions}</h3>
              <p>Institutions</p>
            </div>
            <div className="stat-item">
              <h3>{stats.totalRepresented}</h3>
              <p>People Represented</p>
            </div>
          </div>
        </div>
      )}

      {/* Attendance List */}
      <div className="attendance-section card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Guest List ({attendance.length})</h2>
        </div>

        {attendance.length === 0 ? (
          <div className="text-center text-muted py-4">
            <p>No guests have checked in yet.</p>
            <Link
              to={`/attend/${event.slug}`}
              className="btn btn-primary"
            >
              Test Guest Form
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Guest Name</th>
                  <th>Institution</th>
                  <th>Position</th>
                  <th>People</th>
                  <th>Category</th>
                  <th>Check-in Time</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((guest) => (
                  <tr key={guest.id}>
                    <td>{guest.guest_name}</td>
                    <td>{guest.institution}</td>
                    <td>{guest.position || '-'}</td>
                    <td>{guest.representative_count}</td>
                    <td>
                      <span className="badge badge-secondary">
                        {guest.category || 'guest'}
                      </span>
                    </td>
                    <td>{formatTime(guest.arrival_time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons mt-3">
        <Link to="/events" className="btn btn-secondary">
          Back to Events
        </Link>
      </div>
    </div>
  );
};

export default EventDetail;