import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../api/client';
import {
  Calendar,
  Copy,
  Check,
  BarChart3,
  Edit,
  RefreshCw,
  X,
  MailOpen,
  PartyPopper,
  MapPin,
  Circle,
  CheckCircle
} from 'lucide-react';
import './EventsList.css';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/events');
      setEvents(response.data.events);
    } catch (err) {
      let errorMessage = 'Gagal mengambil data acara';

      if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan server berjalan di port 5000.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Masalah jaringan. Periksa koneksi internet Anda.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Endpoint tidak ditemukan. Periksa konfigurasi API.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server sedang bermasalah. Silakan coba lagi nanti.';
      }

      setError(errorMessage);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, eventId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(eventId);
      toast.success('URL berhasil disalin!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedId(eventId);
        toast.success('URL berhasil disalin!');
        setTimeout(() => setCopiedId(null), 2000);
      } catch (fallbackErr) {
        toast.error('Gagal menyalin URL');
      }
      document.body.removeChild(textArea);
    }
  };

  const getAttendUrl = (slug) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/attend/${slug}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Memuat data acara...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="card text-center">
          <h3><X className="inline-icon" /> {error}</h3>
          <p>Terjadi kesalahan saat mengambil data acara. Silakan coba lagi.</p>
          <button onClick={fetchEvents} className="btn btn-primary">
            <RefreshCw className="inline-icon" /> Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="events-list">
      <div className="events-header">
        <h1><Calendar className="inline-icon" /> Daftar Acara</h1>
        <Link to="/events/create" className="btn btn-primary">
          + Buat Acara Baru
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="card text-center">
            <MailOpen className="empty-icon" />
            <h3>Belum Ada Acara</h3>
            <p className="text-muted">
              Mulai dengan membuat acara pertama Anda
            </p>
            <Link to="/events/create" className="btn btn-primary">
              <PartyPopper className="inline-icon" /> Buat Acara
            </Link>
          </div>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-status">
                <span className={`status-badge ${isUpcoming(event.date) ? 'upcoming' : 'past'}`}>
                  {isUpcoming(event.date) ? (
                    <><CheckCircle className="inline-icon" /> Akan Datang</>
                  ) : (
                    <><Circle className="inline-icon" /> Selesai</>
                  )}
                </span>
              </div>

              <div className="event-content">
                <h3>{event.name}</h3>
                <p className="event-description">
                  {event.description || 'Tidak ada deskripsi'}
                </p>

                <div className="event-details">
                  <div className="detail-item">
                    <Calendar className="detail-icon" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  {event.location && (
                    <div className="detail-item">
                      <MapPin className="detail-icon" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="event-actions">
                <div className="action-row">
                  <button
                    onClick={() => copyToClipboard(getAttendUrl(event.slug), event.id)}
                    className={`btn-copy-url ${copiedId === event.id ? 'copied' : ''}`}
                  >
                    {copiedId === event.id ? (
                      <><Check className="inline-icon" /> Tersalin!</>
                    ) : (
                      <><Copy className="inline-icon" /> Salin URL Tamu</>
                    )}
                  </button>
                </div>

                <div className="action-row">
                  <Link
                    to={`/events/${event.id}`}
                    className="btn btn-outline"
                  >
                    <BarChart3 className="inline-icon" /> Lihat Detail
                  </Link>
                  <Link
                    to={`/attend/${event.slug}`}
                    className="btn btn-primary"
                  >
                    <Edit className="inline-icon" /> Form Tamu
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsList;