import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchEventDetails = useCallback(async () => {
    try {
      setLoading(true);
      const eventResponse = await apiClient.get(`/events/${id}`);
      setEvent(eventResponse.data.event);

      // Try to get attendance data, but don't fail the whole component if it fails
      try {
        const attendanceResponse = await apiClient.get(`/attendance/event/${id}`);
        setAttendance(attendanceResponse.data.attendance || []);

        // Calculate stats
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
      setError('Gagal memuat detail acara');
      console.error('Error fetching event details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  const handleExport = async () => {
    try {
      const response = await apiClient.get(`/attendance/event/${id}/export`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `daftar-kehadiran-${event.slug}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Gagal mengekspor data');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Memuat detail acara...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acara Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">
              Acara yang Anda cari tidak ada atau telah dihapus.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Kembali ke Daftar Acara
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/"
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Beranda
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link
                  to="/events"
                  className="ml-1 text-sm font-medium text-gray-600 hover:text-indigo-600 md:ml-2 transition-colors duration-200"
                >
                  Daftar Acara
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-800 md:ml-2 truncate max-w-xs">{event.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Enhanced Event Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border border-gray-100">
          <div className="relative">
            {/* Header Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-90"></div>
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative px-6 py-12 sm:px-10 sm:py-16">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white bg-white/20 backdrop-blur-sm mb-4">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {isUpcoming(event.date) ? 'Akan Datang' : 'Selesai'}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white mb-6 leading-tight">
                    {event.name}
                  </h1>
                  <div className="space-y-4">
                    <div className="flex items-center text-white/90 text-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg mr-4">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-medium">{formatDate(event.date)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-white/90 text-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg mr-4">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="font-medium">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    to={`/attend/${event.slug}`}
                    className="group inline-flex items-center justify-center px-5 py-2.5 border-2 border-white text-sm font-medium rounded-lg text-white hover:bg-white hover:text-indigo-600 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    Buka Form Tamu
                  </Link>
                  <button
                    onClick={handleExport}
                    className="group inline-flex items-center justify-center px-5 py-2.5 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-sm font-medium rounded-lg text-white hover:bg-white hover:text-indigo-600 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all duration-300 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    disabled={attendance.length === 0}
                  >
                    <svg className="w-4 h-4 mr-2 group-hover:translate-y-0.5 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Ekspor Data
                  </button>
                </div>
              </div>
            </div>
          </div>
          {event.description && (
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-indigo-50 border-t border-gray-100">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-700 leading-relaxed text-lg">{event.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="group relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
                      {stats.totalAttendees}
                    </h3>
                    <p className="text-gray-600 font-semibold text-sm mt-1">Total Tamu</p>
                    <div className="mt-2 flex items-center text-xs text-indigo-600">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                      </svg>
                      Individu terdaftar
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H6a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">
                      {stats.totalInstitutions}
                    </h3>
                    <p className="text-gray-600 font-semibold text-sm mt-1">Institusi</p>
                    <div className="mt-2 flex items-center text-xs text-emerald-600">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                      </svg>
                      Organisasi berbeda
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                      {stats.totalRepresented}
                    </h3>
                    <p className="text-gray-600 font-semibold text-sm mt-1">Total Perwakilan</p>
                    <div className="mt-2 flex items-center text-xs text-purple-600">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                      </svg>
                      Jumlah total orang
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Attendance List */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Daftar Kehadiran</h2>
                  <p className="text-gray-600 font-medium">{attendance.length} tamu terdaftar</p>
                </div>
              </div>
              {attendance.length > 0 && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Data Real-time
                  </span>
                </div>
              )}
            </div>
          </div>

          {attendance.length === 0 ? (
            <div className="text-center py-16 px-8 bg-gradient-to-b from-white to-gray-50">
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-1a1 1 0 100-2h1a4 4 0 014 4v6a4 4 0 01-4 4H6a4 4 0 01-4-4V7a4 4 0 014-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Belum Ada Tamu</h3>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                Jadilah yang pertama! Mulai dengan mengisi form pendaftaran tamu untuk acara ini.
              </p>
              <Link
                to={`/attend/${event.slug}`}
                className="group inline-flex items-center px-8 py-4 border-2 border-transparent text-base font-bold rounded-2xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                <svg className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Daftarkan Tamu Pertama
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-indigo-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        Nama Tamu
                        <svg className="w-4 h-4 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        Institusi
                        <svg className="w-4 h-4 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H6a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        Jabatan
                        <svg className="w-4 h-4 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        Perwakilan
                        <svg className="w-4 h-4 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        Kategori
                        <svg className="w-4 h-4 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        Check-in
                        <svg className="w-4 h-4 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {attendance.map((guest, index) => (
                    <tr
                      key={guest.id}
                      className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    >
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-indigo-600">
                              {guest.guest_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{guest.guest_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-700">{guest.institution}</div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{guest.position || '-'}</div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                          </svg>
                          {guest.representative_count} orang
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold border ${
                          guest.category === 'guest' ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300' :
                          guest.category === 'official_invitation' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300' :
                          guest.category === 'sponsor' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300' :
                          guest.category === 'speaker' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-300' :
                          guest.category === 'media' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300' :
                          'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border-indigo-300'
                        }`}>
                          {guest.category === 'guest' ? 'Tamu' :
                           guest.category === 'official_invitation' ? 'Undangan Resmi' :
                           guest.category === 'sponsor' ? 'Sponsor' :
                           guest.category === 'speaker' ? 'Pembicara' :
                           guest.category === 'media' ? 'Media' :
                           guest.category || 'Tamu'}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mr-3">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{formatTime(guest.arrival_time)}</div>
                            <div className="text-xs text-gray-500">Real-time</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Enhanced Back Button */}
        <div className="mt-12 text-center">
          <Link
            to="/events"
            className="group inline-flex items-center px-5 py-2.5 border-2 border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 hover:border-indigo-300 hover:text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali ke Daftar Acara
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;