import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Clock, Users, Building, UserCheck } from 'lucide-react';
import './GuestDisplay.css';

const GuestDisplay = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Translate category to Indonesian
  const translateCategory = (category) => {
    const translations = {
      'guest': 'Tamu',
      'official_invitation': 'Undangan Resmi',
      'sponsor': 'Sponsor',
      'speaker': 'Pembicara',
      'media': 'Media',
      'other': 'Lainnya'
    };
    return translations[category] || category;
  };
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [delayedGuests, setDelayedGuests] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const scrollContainerRef = useRef(null);
  const socketRef = useRef(null);

  
  useEffect(() => {
    const fetchEventAndGuests = async () => {
      try {
        // Fetch event details
        const eventResponse = await fetch(`http://localhost:5000/api/events/slug/${slug}`);
        if (!eventResponse.ok) {
          throw new Error('Event not found');
        }
        const eventData = await eventResponse.json();
        setEvent(eventData.event);

        // Fetch existing guests
        try {
          const attendanceResponse = await fetch(`http://localhost:5000/api/attendance/event/${eventData.event.id}?pageSize=1000`);
          if (attendanceResponse.ok) {
            const attendanceData = await attendanceResponse.json();
            const sortedGuests = (attendanceData.attendance || []).sort((a, b) =>
              new Date(b.created_at) - new Date(a.created_at)
            );
            setGuests(sortedGuests);

            // On initial load, show all existing guests immediately (no delay)
            if (sortedGuests.length > 0) {
              setDelayedGuests(sortedGuests);
            }
            setInitialLoadComplete(true);
          } else {
            console.warn('Could not fetch attendance data:', attendanceResponse.status);
            setGuests([]);
          }
        } catch (attendanceErr) {
          console.warn('Error fetching attendance data:', attendanceErr);
          setGuests([]);
        }
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Failed to load event. Please check the event URL and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndGuests();
  }, [slug]);

  // Initialize Socket.io
  useEffect(() => {
    if (event) {
      socketRef.current = io('http://localhost:5000');

      socketRef.current.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
        socketRef.current.emit('join-event', event.id);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      socketRef.current.on('new-attendance', (newGuest) => {
        console.log('New guest registered:', newGuest);
        setGuests(prev => {
          // Check if guest already exists by ID
          const exists = prev.some(guest => guest.id === newGuest.id);
          if (!exists) {
            return [newGuest, ...prev];
          }
          return prev;
        });
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.emit('leave-event', event.id);
          socketRef.current.disconnect();
        }
      };
    }
  }, [event]);

  // Handle 15-second delayed guest processing (only after initial load)
  useEffect(() => {
    // Only start delayed processing after initial load is complete
    if (!initialLoadComplete) return;

    const timer = setInterval(() => {
      setGuests(currentGuests => {
        // Only process new guests that aren't already in delayedGuests
        const guestIdsInDelayed = new Set(delayedGuests.map(g => g.id));
        const newGuests = currentGuests.filter(guest => !guestIdsInDelayed.has(guest.id));

        if (newGuests.length > 0) {
          // Process the newest guest
          const newestGuest = newGuests[0];
          setDelayedGuests(prev => {
            // Check if guest already exists in delayed guests
            const exists = prev.some(guest => guest.id === newestGuest.id);
            if (!exists) {
              return [newestGuest, ...prev];
            }
            return prev;
          });
        }
        return currentGuests;
      });
    }, 15000); // 15-second delay

    return () => clearInterval(timer);
  }, [initialLoadComplete, delayedGuests.length]);

  
  if (loading) {
    return (
      <div className="guest-display-loading">
        <div className="loading-spinner"></div>
        <p>Memuat informasi acara...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="guest-display-error">
        <h2>Acara Tidak Ditemukan</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="back-button">
          Kembali ke Daftar Acara
        </button>
      </div>
    );
  }

  return (
    <div className="guest-display">
      {/* Header */}
      <div className="display-header">
        <div className="event-info">
          <h1 className="event-title">{event.name}</h1>
          <div className="event-meta">
            <div className="meta-item">
              <Clock size={20} />
              <span>{new Date(event.date).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="meta-item">
              <Building size={20} />
              <span>{event.location}</span>
            </div>
            <div className="meta-item">
              <Users size={20} />
              <span>{delayedGuests.length} Guests</span>
            </div>
          </div>
        </div>

        <div className="display-controls">
          <div className="connection-status">
            <div className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}></div>
            <span>{connected ? 'Langsung' : 'Luring'}</span>
          </div>
          <button
            className="control-button exit-button"
            onClick={() => navigate('/')}
          >
            Keluar dari Tampilan
          </button>
        </div>
      </div>

      {/* Guests Display */}
      <div className="guests-container" ref={scrollContainerRef}>
        <div className="guests-list">
          {/* Add space at top for smooth marquee start */}
          {delayedGuests.length > 0 && (
            <div style={{ height: '100px' }}></div>
          )}

          {delayedGuests.length === 0 ? (
            <div className="no-guests">
              <UserCheck size={48} />
              <h3>Belum Ada Tamu yang Hadir</h3>
              <p>Tamu akan muncul di sini saat mereka melakukan check-in ke acara</p>
            </div>
          ) : (
            delayedGuests.map((guest, index) => (
              <div
                key={`guest-${guest.id || guest.guest_name}-${guest.arrival_time || index}`}
                className="guest-card"
                style={{
                  animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="guest-content-wrapper">
                  <div className="guest-left-section">
                    <h3 className="guest-name">{guest.guest_name}</h3>
                    <div className="guest-details">
                      <p className="guest-institution">{guest.institution}</p>
                      {guest.position && (
                        <p className="guest-position">{guest.position}</p>
                      )}
                    </div>
                  </div>
                  <div className="guest-right-section">
                    <div className="guest-meta-info">
                      <span className="guest-category">{translateCategory(guest.category)}</span>
                      <span className="guest-time">
                        {new Date(guest.arrival_time).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Add space at bottom for smooth marquee end */}
          {delayedGuests.length > 0 && (
            <div style={{ height: '100px' }}></div>
          )}
        </div>
      </div>

      {/* Footer with live indicator */}
      <div className="display-footer">
        <div className="footer-info">
          <span>Tampilan Tamu Langsung</span>
          <span>•</span>
          <span>Pembaruan setiap 15 detik</span>
          <span>•</span>
          <span>{delayedGuests.length} total tamu</span>
        </div>
      </div>
    </div>
  );
};

export default GuestDisplay;