import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/events');
      setEvents(response.data.events);
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  if (loading) {
    return (
      <div className="text-center">
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="error">{error}</p>
        <button onClick={fetchEvents} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="events-list">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Events</h1>
        <Link to="/events/create" className="btn btn-primary">
          Create New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="card text-center">
          <h3>No Events Found</h3>
          <p className="text-muted">
            Start by creating your first event
          </p>
          <Link to="/events/create" className="btn btn-primary">
            Create Event
          </Link>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="card">
              <div className="card-header">
                <h3>{event.name}</h3>
                <span className={`badge ${isUpcoming(event.date) ? 'badge-success' : 'badge-secondary'}`}>
                  {isUpcoming(event.date) ? 'Upcoming' : 'Past'}
                </span>
              </div>
              <div className="card-body">
                <p className="text-muted">
                  {event.description || 'No description available'}
                </p>
                <div className="event-details">
                  <p><strong>Date:</strong> {formatDate(event.date)}</p>
                  {event.location && (
                    <p><strong>Location:</strong> {event.location}</p>
                  )}
                </div>
              </div>
              <div className="card-footer">
                <Link
                  to={`/events/${event.id}`}
                  className="btn btn-primary mr-2"
                >
                  View Details
                </Link>
                <Link
                  to={`/attend/${event.slug}`}
                  className="btn btn-secondary"
                >
                  Guest Form
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsList;