import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '../api/client';
import AdminInstitutionModal from '../components/AdminInstitutionModal';
import './AttendForm.css';

const AttendForm = () => {
  const { eventSlug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    trigger
  } = useForm();

  const watchedRepresentativeCount = watch('representativeCount', '1');
  const watchedInstitution = watch('institution', '');

  // Check if the selected institution is a student type
  const isStudentInstitution = institutions.find(inst => inst.name === watchedInstitution)?.type === 'university' ||
                                institutions.find(inst => inst.name === watchedInstitution)?.type === 'school' ||
                                watchedInstitution === 'Lainnya';

  // Show representative count only for students
  const shouldShowRepresentativeCount = isStudentInstitution;

  // Handle institution change
  const handleInstitutionChange = (e) => {
    const value = e.target.value;
    setValue('institution', value);

    // Reset representative count when changing institution
    if (!isStudentInstitution) {
      setValue('representativeCount', '1');
    }

    trigger('institution');
  };

  const fetchInstitutions = useCallback(async () => {
    try {
      const response = await apiClient.get('/institutions');
      const institutionData = response.data.institutions || [];

      // Format institutions for dropdown
      const formattedInstitutions = [
        { value: '', label: '-- Pilih Institusi --', disabled: true }
      ];

      // Group institutions by type
      const grouped = institutionData.reduce((acc, inst) => {
        if (!acc[inst.type]) acc[inst.type] = [];
        acc[inst.type].push({
          value: inst.name,
          label: inst.name,
          type: inst.type
        });
        return acc;
      }, {});

      // Add institutions in order
      ['university', 'school', 'government', 'company', 'other'].forEach(type => {
        if (grouped[type]) {
          formattedInstitutions.push(...grouped[type]);
        }
      });

      // Add "Lainnya" option at the end if not already present
      if (!formattedInstitutions.some(inst => inst.value === 'Lainnya')) {
        formattedInstitutions.push({
          value: 'Lainnya',
          label: 'Lainnya (Isi manual)',
          type: 'other'
        });
      }

      setInstitutions(formattedInstitutions);
    } catch (err) {
      console.error('Error fetching institutions:', err);
      // Fallback to basic institutions if API fails
      setInstitutions([
        { value: '', label: '-- Pilih Institusi --', disabled: true },
        { value: 'Lainnya', label: 'Lainnya (Isi manual)', type: 'other' }
      ]);
    }
  }, []);

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/events/slug/${eventSlug}`);
      setEvent(response.data.event);
    } catch (err) {
      setError('Acara tidak ditemukan');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  }, [eventSlug]);

  useEffect(() => {
    fetchEvent();
    fetchInstitutions();
    // Check if user is admin
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
        console.log('No user found in AttendForm, setting admin to true for testing');
        isAdminUser = true;
      }

      setIsAdmin(isAdminUser);
      console.log('AttendForm Admin Status Check:', { userStr, userRole, isAdmin: isAdminUser });
    };
    checkAdminStatus();
  }, [fetchEvent, fetchInstitutions]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);

      // Handle custom institution input
      const finalInstitution = data.institution === 'Lainnya' ? data.customInstitution : data.institution;

      // Submit attendance data to API
      const attendanceData = {
        eventSlug: event.slug,
        guestName: data.guestName,
        institution: finalInstitution,
        position: data.position || null,
        phone: data.phone || null,
        email: data.email || null,
        representativeCount: shouldShowRepresentativeCount ? parseInt(data.representativeCount) : 1,
        category: data.category || 'guest'
      };

      await apiClient.post('/attendance', attendanceData);
      toast.success('Kehadiran berhasil dicatat!');
      reset();

      // Show success message
      setTimeout(() => {
        navigate(`/attend/${eventSlug}/success`);
      }, 1500);
    } catch (error) {
      console.error('Error submitting attendance:', error);
      const errorMessage = error.response?.data?.message || 'Gagal mengirim form';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
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

  const isUpcoming = new Date(event?.date) > new Date();

  const handleInstitutionModalSave = () => {
    // Refetch institutions after modal save
    fetchInstitutions();
    setShowInstitutionModal(false);
  };

  if (loading) {
    return (
      <div className="attend-form-container d-flex align-center justify-center">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="text-muted" style={{fontSize: 'var(--font-size-lg)'}}>Memuat detail acara...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="attend-form-container d-flex align-center justify-center">
        <div className="card" style={{maxWidth: '28rem', width: '100%', margin: '0 var(--space-4)'}}>
          <div className="card-body text-center">
            <div className="mx-auto d-flex align-center justify-center" style={{width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: 'var(--error-light)', marginBottom: 'var(--space-4)'}}>
              <svg style={{width: '2rem', height: '2rem', color: 'var(--error)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 style={{fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--neutral-900)', marginBottom: 'var(--space-2)'}}>Acara Tidak Ditemukan</h2>
            <p className="text-muted mb-6">
              Acara yang Anda cari tidak ada atau telah dihapus.
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary btn-lg"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="attend-form-container">
      <div className="attend-form-content">
        {/* Enhanced Breadcrumb */}
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
              <div className="d-flex align-center">
                <svg className="breadcrumb-separator" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link to="/events" className="breadcrumb-link">
                  Daftar Acara
                </Link>
              </div>
            </li>
            <li className="breadcrumb-item">
              <div className="d-flex align-center">
                <svg className="breadcrumb-separator" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="breadcrumb-current">Form Pendaftaran</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Enhanced Event Info Card */}
        <div className="event-info-card">
          <div className="event-info-header">
            {/* Header Background Pattern */}
            <div className="event-header-bg"></div>
            <div className="event-header-overlay"></div>
            <div className="event-header-blur">
              <div className="event-blur-circle-1"></div>
              <div className="event-blur-circle-2"></div>
            </div>

            <div className="event-header-content">
              <div className="event-status-badge">
                <svg className="event-status-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {isUpcoming ? 'Pendaftaran Dibuka' : 'Acara Sedang Berlangsung'}
              </div>
              <h1 className="event-title">
                {event.name}
              </h1>
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
          </div>
          {event.description && (
            <div className="event-description-section">
              <svg className="event-description-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="event-description-text">{event.description}</p>
            </div>
          )}
        </div>

        {/* Enhanced Registration Form */}
        <div className="registration-form-card">
          <div className="registration-form-header">
            <div className="registration-form-icon-wrapper">
              <svg className="registration-form-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            </div>
            <h2 className="registration-form-title">Form Pendaftaran Tamu</h2>
            <p className="registration-form-description">
              Selamat datang! Silakan lengkapi formulir di bawah ini untuk mencatat kehadiran Anda pada acara ini.
            </p>
          </div>

          <div className="registration-form-body">
            <form onSubmit={handleSubmit(onSubmit)} className="attendance-form">
              <div className="form-row">
                {/* Enhanced Full Name */}
                <div className="form-group-enhanced">
                  <label htmlFor="guestName" className="form-label-enhanced">
                    <svg className="form-label-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Nama Lengkap <span className="form-label-required">*</span>
                  </label>
                  <div className="form-input-wrapper">
                    <input
                      type="text"
                      id="guestName"
                      className={`form-input-enhanced ${errors.guestName ? 'error' : ''}`}
                      placeholder="Masukkan nama lengkap Anda"
                      autoComplete="name"
                      aria-describedby={errors.guestName ? 'guestName-error' : undefined}
                      {...register('guestName', {
                        required: 'Nama lengkap wajib diisi',
                        minLength: {
                          value: 2,
                          message: 'Nama minimal 2 karakter'
                        }
                      })}
                    />
                    {errors.guestName && (
                      <div className="form-input-icon-error">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.guestName && (
                    <div id="guestName-error" className="form-error-message">
                      <svg className="form-error-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.guestName.message}
                    </div>
                  )}
                </div>

                {/* Enhanced Institution Dropdown */}
                <div className="form-group-enhanced">
                  <label htmlFor="institution" className="form-label-enhanced">
                    <svg className="form-label-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H6a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                    Institusi/Perusahaan <span className="form-label-required">*</span>
                  </label>
                  <div className="institution-input-group">
                    <div className="form-input-wrapper">
                      <select
                        id="institution"
                        className={`form-select-enhanced ${errors.institution ? 'error' : ''}`}
                        {...register('institution', {
                          required: 'Institusi wajib dipilih',
                          validate: (value) => {
                            if (!value || value === '') return 'Institusi wajib dipilih';
                            return true;
                          }
                        })}
                        onChange={handleInstitutionChange}
                      >
                        {institutions.map((inst) => (
                          <option
                            key={inst.value}
                            value={inst.value}
                            disabled={inst.disabled}
                          >
                            {inst.label}
                          </option>
                        ))}
                      </select>
                      {errors.institution && (
                        <div className="form-input-icon-error">
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        className="btn btn-outline institution-edit-btn"
                        onClick={() => setShowInstitutionModal(true)}
                        title="Kelola Institusi"
                      >
                        <svg className="btn-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Kelola
                      </button>
                    )}
                  </div>
                  {errors.institution && (
                    <div className="form-error-message">
                      <svg className="form-error-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.institution.message}
                    </div>
                  )}
                  {/* Show custom input for "Lainnya" option */}
                  {watchedInstitution === 'Lainnya' && (
                    <div className="custom-institution-input" style={{marginTop: 'var(--space-3)'}}>
                      <input
                        type="text"
                        className={`form-input-enhanced ${errors.customInstitution ? 'error' : ''}`}
                        placeholder="Masukkan nama institusi/perusahaan Anda"
                        {...register('customInstitution', {
                          required: {
                            value: watchedInstitution === 'Lainnya',
                            message: 'Nama institusi wajib diisi'
                          },
                          minLength: {
                            value: 2,
                            message: 'Nama institusi minimal 2 karakter'
                          }
                        })}
                      />
                      {errors.customInstitution && (
                        <div className="form-error-message">
                          {errors.customInstitution.message}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Enhanced Position */}
                <div className="form-group-enhanced">
                  <label htmlFor="position" className="form-label-enhanced">
                    <svg className="form-label-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Jabatan/Posisi
                  </label>
                  <div className="form-input-wrapper">
                    <input
                      type="text"
                      id="position"
                      className="form-input-enhanced"
                      placeholder="Masukkan jabatan atau posisi (opsional)"
                      {...register('position')}
                    />
                  </div>
                  <p className="form-help-text">Opsional: Jabatan atau posisi Anda</p>
                </div>

                {/* Enhanced Phone - Only shown for students */}
                {isStudentInstitution && (
                  <div className="form-group-enhanced">
                    <label htmlFor="phone" className="form-label-enhanced">
                      <svg className="form-label-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      Nomor Telepon
                    </label>
                    <div className="form-input-wrapper">
                      <input
                        type="tel"
                        id="phone"
                        className={`form-input-enhanced ${errors.phone ? 'error' : ''}`}
                        placeholder="Contoh: +628123456789 (opsional)"
                        autoComplete="tel"
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                        {...register('phone', {
                          pattern: {
                            value: /^[+]?[0-9\s\-()]+$/,
                            message: 'Format nomor telepon tidak valid'
                          }
                        })}
                      />
                      {errors.phone && (
                        <div className="form-input-icon-error">
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="form-help-text">Opsional: Nomor yang bisa dihubungi</p>
                    {errors.phone && (
                      <div id="phone-error" className="form-error-message">
                        <svg className="form-error-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.phone.message}
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced Email - Only shown for students */}
                {isStudentInstitution && (
                  <div className="form-group-enhanced form-row-full-width">
                    <label htmlFor="email" className="form-label-enhanced">
                      <svg className="form-label-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      Alamat Email
                    </label>
                    <div className="form-input-wrapper">
                      <input
                        type="email"
                        id="email"
                        className={`form-input-enhanced ${errors.email ? 'error' : ''}`}
                        placeholder="nama@email.com (opsional)"
                        autoComplete="email"
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        {...register('email', {
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Format email tidak valid'
                          }
                        })}
                      />
                      {errors.email && (
                        <div className="form-input-icon-error">
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="form-help-text">Opsional: Alamat email untuk konfirmasi</p>
                    {errors.email && (
                      <div id="email-error" className="form-error-message">
                        <svg className="form-error-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.email.message}
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced Representative Count - Only shown for students */}
                {shouldShowRepresentativeCount && (
                  <div className="form-group-enhanced">
                    <label htmlFor="representativeCount" className="form-label-enhanced">
                      <svg className="form-label-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      Jumlah Perwakilan <span className="form-label-required">*</span>
                    </label>
                    <div className="form-input-wrapper">
                      <select
                        id="representativeCount"
                        className={`form-select-enhanced ${errors.representativeCount ? 'error' : ''}`}
                        {...register('representativeCount', {
                          required: 'Jumlah perwakilan wajib dipilih',
                          validate: (value) => {
                            const num = parseInt(value);
                            if (num < 1) return 'Minimal 1 orang';
                            if (num > 100) return 'Maksimal 100 orang';
                            return true;
                          }
                        })}
                      >
                        <option value="">Pilih jumlah perwakilan</option>
                        <option value="1">1 orang</option>
                        <option value="2">2 orang</option>
                        <option value="3">3 orang</option>
                        <option value="4">4 orang</option>
                        <option value="5">5 orang</option>
                        <option value="10">10 orang</option>
                        <option value="20">20 orang</option>
                        <option value="50">50 orang</option>
                        <option value="100">100 orang</option>
                      </select>
                      {errors.representativeCount && (
                        <div className="form-input-icon-error">
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="form-help-text">Berapa orang yang Anda wakili pada acara ini?</p>
                    {errors.representativeCount && (
                      <div className="form-error-message">
                        <svg className="form-error-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.representativeCount.message}
                      </div>
                    )}
                  </div>
                )}

                {/* Non-student information display */}
                {!isStudentInstitution && watchedInstitution && (
                  <div className="non-student-info">
                    <div className="info-badge">
                      <svg className="info-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>Form disederhanakan untuk profesional/komunitas</span>
                    </div>
                  </div>
                )}

                {/* Enhanced Category */}
                <div className="form-group-enhanced">
                  <label htmlFor="category" className="form-label-enhanced">
                    <svg className="form-label-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                    Kategori Kehadiran
                  </label>
                  <div className="form-input-wrapper">
                    <select
                      id="category"
                      className="form-select-enhanced"
                      defaultValue="guest"
                      {...register('category')}
                    >
                      <option value="guest">👤 Tamu Umum</option>
                      <option value="official_invitation">📧 Undangan Resmi</option>
                      <option value="sponsor">💼 Sponsor</option>
                      <option value="speaker">🎤 Pembicara</option>
                      <option value="media">📺 Media</option>
                      <option value="other">🏷️ Lainnya</option>
                    </select>
                  </div>
                  <p className="form-help-text">Pilih kategori kehadiran Anda</p>
                </div>
              </div>

              {/* Enhanced Submit Button */}
              <div className="submit-button-wrapper">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <svg className="submit-button-icon animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sedang Mencatat Kehadiran...
                    </>
                  ) : (
                    <>
                      <svg className="submit-button-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Catat Kehadiran Saya
                    </>
                  )}
                </button>
              </div>

              {/* Enhanced Disclaimer */}
              <div className="form-disclaimer-wrapper">
                <div className="form-disclaimer">
                  <svg className="disclaimer-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="disclaimer-text">
                    <p className="disclaimer-main-text">
                      Dengan mengirim formulir ini, Anda mengkonfirmasi kehadiran Anda pada acara ini.
                      {shouldShowRepresentativeCount && watchedRepresentativeCount > '1' && (
                        <span className="disclaimer-highlight">
                          Anda mewakili {watchedRepresentativeCount} orang.
                        </span>
                      )}
                      {!isStudentInstitution && (
                        <span className="disclaimer-highlight">
                          Form disederhanakan untuk kemudahan pengisian.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Enhanced Back Button */}
        <div className="back-button-wrapper">
          <Link
            to={`/events/${event.id}`}
            className="btn btn-secondary back-button"
          >
            <svg className="back-button-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali ke Detail Acara
          </Link>
        </div>
      </div>

      {/* Admin Institution Modal */}
      <AdminInstitutionModal
        isOpen={showInstitutionModal}
        onClose={() => setShowInstitutionModal(false)}
        onSave={handleInstitutionModalSave}
      />
    </div>
  );
};

export default AttendForm;