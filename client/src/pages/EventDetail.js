import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import AdminInstitutionModal from '../components/AdminInstitutionModal';
import EventEditModal from '../components/EventEditModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import AdminActionDropdown from '../components/AdminActionDropdown';
import './EventDetail.css';
import { Download, User2, Monitor } from 'lucide-react';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const [showEventEditModal, setShowEventEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    try {
      setLoading(true);
      const eventResponse = await apiClient.get(`/events/${id}`);
      setEvent(eventResponse.data.event);

      try {
        const attendanceResponse = await apiClient.get(`/attendance/event/${id}`);
        setAttendance(attendanceResponse.data.attendance || []);

        const attendanceData = attendanceResponse.data.attendance || [];
        const totalAttendees = attendanceData.length;
        const totalInstitutions = new Set(
          attendanceData.map(a => a.institution)
        ).size;
        const totalRepresented = attendanceData.reduce(
          (sum, a) => sum + (a.representative_count || 1), 0
        );

        setStats({
          totalAttendees,
          totalInstitutions,
          totalRepresented
        });
      } catch (attendanceError) {
        console.warn('Could not fetch attendance data:', attendanceError);
        setAttendance([]);
        setStats({
          totalAttendees: 0,
          totalInstitutions: 0,
          totalRepresented: 0
        });
      }
    } catch (err) {
      setError('Tidak dapat memuat informasi acara. Silakan coba kembali.');
      console.error('Error fetching event details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEventDetails();
    // Check if user is admin (this is a simplified check - in production, use proper auth)
    const checkAdminStatus = () => {
      const userStr = localStorage.getItem('user');
      const userRole = localStorage.getItem('userRole');
      let isAdminUser = false;

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          isAdminUser = user.role === 'admin' || user.role === 'superadmin';
        } catch (e) {
          isAdminUser = userRole === 'admin' || userRole === 'superadmin';
        }
      } else {
        isAdminUser = userRole === 'admin' || userRole === 'superadmin';
      }

      // For testing purposes, set admin to true if no admin detection works
      if (!isAdminUser && !userStr && !userRole) {
        isAdminUser = true;
      }

      setIsAdmin(isAdminUser);
    };
    checkAdminStatus();
  }, [fetchEventDetails]);

  const handleExport = async () => {
    try {
      const response = await apiClient.get(`/attendance/event/${id}/export`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `daftar-kehadiran-${event.slug}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Tidak dapat mengunduh laporan kehadiran. Silakan coba kembali.');
    }
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

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  const handleInstitutionModalSave = () => {
    // Refresh the page or refetch data if needed
    window.location.reload();
  };

  const handleEditEvent = () => {
    setShowEventEditModal(true);
  };

  const handleEventEditSave = (updatedEvent) => {
    setEvent(updatedEvent);
    setShowEventEditModal(false);
    fetchEventDetails();
  };

  const handleDeleteEvent = async () => {
    try {
      await apiClient.delete(`/events/${event.id}`);
      // Navigate back to events list after successful deletion
      navigate('/events');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Gagal menghapus acara. Silakan coba lagi.');
      setShowDeleteModal(false);
    }
  };

  
  if (loading) {
    return (
      <div className="event-detail-container">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p>Sistem sedang memuat informasi acara...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail-container">
        <div className="event-header-card">
          <div className="text-center">
            <div className="empty-state">
              <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="empty-state-title">Informasi Acara Tidak Tersedia</h2>
              <p className="empty-state-text">Acara yang Anda tuju tidak tersedia atau telah diarsipkan. Silakan hubungi panitia acara untuk informasi lebih lanjut.</p>
              <Link to="/events" className="event-action-button">Lihat Acara Lainnya</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="event-detail-container">
      <div className="event-detail-content">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol className="breadcrumb-list">
            <li className="breadcrumb-item">
              <Link to="/" className="breadcrumb-link">
                <svg className="breadcrumb-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Beranda
              </Link>
            </li>
            <li className="breadcrumb-item">
              <div className="flex items-center">
                <svg className="breadcrumb-separator" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link to="/events" className="breadcrumb-link">Jadwal Acara Kampus</Link>
              </div>
            </li>
            <li className="breadcrumb-item">
              <div className="flex items-center">
                <svg className="breadcrumb-separator" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="breadcrumb-current">{event.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="event-header-card">
          <div className="event-header">
            <div className="event-header-bg"></div>
            <div className="event-header-overlay"></div>
            <div className="event-header-blur">
              <div className="event-blur-circle-1"></div>
              <div className="event-blur-circle-2"></div>
            </div>

            <div className="event-header-content">
              <div className="event-header-info">
                <div className="event-status-badge">
                  <svg className="event-status-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {isUpcoming(event.date) ? 'Akan Datang' : 'Selesai'}
                </div>
                <h1 className="event-title">{event.name}</h1>
                <div className="event-details">
                  <div className="event-detail-item">
                    <div className="event-detail-icon-wrapper">
                      <svg className="event-detail-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>{formatDate(event.date)}</span>
                  </div>
                  {event.location && (
                    <div className="event-detail-item">
                      <div className="event-detail-icon-wrapper">
                        <svg className="event-detail-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="event-header-actions">
                <div className="event-header-actions-wrapper">
                  {isAdmin && (
                      <AdminActionDropdown
                        onEditEvent={handleEditEvent}
                        onDeleteEvent={() => setShowDeleteModal(true)}
                        onManageInstitutions={() => setShowInstitutionModal(true)}
                      />
                    )}
                  <Link to={`/attend/${event.slug}`} className="btn event-action-button">
                    <User2 className="inline-icon"/>
                    Daftar Kehadiran Digital
                  </Link>
                  <Link to={`/display/${event.slug}`} className="btn event-action-button display-button" target="_blank">
                    <Monitor className="inline-icon"/>
                    Live Guest Display
                  </Link>
                  <button
                    onClick={handleExport}
                    className="event-action-button btn"
                    disabled={attendance.length === 0}
                  >
                    <Download className="inline-icon"/>
                    Unduh Laporan Kehadiran
                  </button>
                </div>
              </div>
            </div>
          </div>

          {event.description && (
            <div className="event-description-section">
              <div className="event-description-header">
                <svg className="event-description-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <h2 className="event-description-title">Deskripsi Acara</h2>
              </div>
              <p className="event-description-text">{event.description}</p>
            </div>
          )}
        </div>

        {stats && (
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <svg className="stat-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div className="stat-number">{stats.totalAttendees}</div>
              <div className="stat-label">Total Peserta</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <svg className="stat-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H6a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-number">{stats.totalInstitutions}</div>
              <div className="stat-label">Institusi</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <svg className="stat-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <div className="stat-number">{stats.totalRepresented}</div>
              <div className="stat-label">Jumlah Perwakilan</div>
            </div>
          </div>
        )}

        <div className="attendance-section">
          <div className="attendance-header">
            <div className="attendance-header-info">
              <svg className="attendance-header-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <div>
                <h2 className="attendance-header-title">Daftar Peserta Hadir</h2>
                <span className="attendance-header-count">{attendance.length} peserta terdaftar</span>
              </div>
            </div>
            {attendance.length > 0 && (
              <div className="attendance-actions">
                <button className="export-button" onClick={handleExport} disabled={attendance.length === 0}>
                  <svg className="export-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Ekspor Data
                </button>
              </div>
            )}
          </div>

          {attendance.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-state-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-1a1 1 0 100-2h1a4 4 0 014 4v6a4 4 0 01-4 4H6a4 4 0 01-4-4V7a4 4 0 014-4z" clipRule="evenodd" />
              </svg>
              <h3 className="empty-state-title">Belum Ada Peserta Terdaftar</h3>
              <p className="empty-state-text">Menjadi peserta pertama! Sistem pendaftaran digital siap mencatat kehadiran Anda untuk acara resmi kampus.</p>
              <Link to={`/attend/${event.slug}`} className="event-action-button">
                <svg className="event-action-icon primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Daftar Sebagai Peserta
              </Link>
            </div>
          ) : (
            <div className="attendance-list">
              {attendance.map((guest) => (
                <div key={guest.id} className="attendance-item">
                  <div className="attendance-avatar">
                    {guest.guest_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="attendance-info">
                    <div className="attendance-name">{guest.guest_name}</div>
                    <div className="attendance-details">
                      <div className="attendance-detail">
                        <svg className="attendance-detail-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H6a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                        {guest.institution}
                      </div>
                      {guest.position && (
                        <div className="attendance-detail">
                          <svg className="attendance-detail-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                          {guest.position}
                        </div>
                      )}
                      <div className="attendance-detail">
                        <svg className="attendance-detail-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                        {guest.representative_count} orang
                      </div>
                    </div>
                  </div>
                  <div className="attendance-meta">
                    <div className="attendance-time">
                      <svg className="attendance-time-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {formatTime(guest.arrival_time)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="back-button-wrapper">
          <Link to="/events" className="back-button">
            <svg className="back-button-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali ke Jadwal Acara
          </Link>
        </div>
      </div>

      {/* Admin Institution Modal */}
      <AdminInstitutionModal
        isOpen={showInstitutionModal}
        onClose={() => setShowInstitutionModal(false)}
        onSave={handleInstitutionModalSave}
      />

      {/* Event Edit Modal */}
      <EventEditModal
        isOpen={showEventEditModal}
        onClose={() => setShowEventEditModal(false)}
        onSave={handleEventEditSave}
        event={event}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteEvent}
        itemType="Acara"
        itemName={event?.name || 'Acara ini'}
      />
    </div>
  );
};

export default EventDetail;