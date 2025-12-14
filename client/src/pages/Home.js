import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import {
  Smartphone,
  BarChart3,
  Download,
  Shield,
  Zap,
  Building
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    totalInstitutions: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch basic stats (this would need a new endpoint)
        const eventsResponse = await apiClient.get('/events');
        const events = eventsResponse.data;

        let totalAttendees = 0;
        let institutions = new Set();

        for (const event of events) {
          try {
            const attendanceResponse = await apiClient.get(`/events/${event.id}/attendance`);
            const attendance = attendanceResponse.data;
            totalAttendees += attendance.length;
            attendance.forEach(record => institutions.add(record.institution));
          } catch (error) {
            // Skip if no attendance data
            continue;
          }
        }

        setStats({
          totalEvents: events.length,
          totalAttendees,
          totalInstitutions: institutions.size
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>SIMAK Event</h1>
            <p className="hero-subtitle">
              Sistem Informasi Manajemen Acara Kampus - Universitas Dumai
            </p>
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary">
                Akses Sistem Admin
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-graphic">
              <div className="phone-mockup">
                <div className="screen">
                  <div className="mockup-form">
                    <div className="mockup-field"></div>
                    <div className="mockup-field"></div>
                    <div className="mockup-button"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="container">
          <h2 className="section-title">Statistik Sistem Kampus</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">
                {isLoading ? (
                  <div className="spinner"></div>
                ) : (
                  stats.totalEvents
                )}
              </div>
              <div className="stat-label">Acara Resmi Kampus</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {isLoading ? (
                  <div className="spinner"></div>
                ) : (
                  stats.totalAttendees
                )}
              </div>
              <div className="stat-label">Total Peserta</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {isLoading ? (
                  <div className="spinner"></div>
                ) : (
                  stats.totalInstitutions
                )}
              </div>
              <div className="stat-label">Institusi Mitra</div>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Fitur Unggulan SIMAK Event</h2>
          <div className="features-grid">
            <div className="feature-card">
              <Smartphone className="feature-icon" />
              <h3>Akses Seluler Terintegrasi</h3>
              <p>Peserta dapat melakukan pendaftaran kehadiran melalui perangkat mobile dengan antarmuka responsif yang dioptimalkan untuk ekosistem digital kampus.</p>
            </div>
            <div className="feature-card">
              <BarChart3 className="feature-icon" />
              <h3>Dashboard Monitoring Real-time</h3>
              <p>Pantau statistik kehadiran dan data acara secara real-time melalui dashboard administratif yang terintegrasi dengan sistem informasi kampus.</p>
            </div>
            <div className="feature-card">
              <Download className="feature-icon" />
              <h3>Generasi Laporan Resmi</h3>
              <p>Buat laporan kehadiran dalam format standar universitas untuk dokumentasi resmi dan keperluan administrasi kampus.</p>
            </div>
            <div className="feature-card">
              <Shield className="feature-icon" />
              <h3>Keamanan Data Terstandar</h3>
              <p>Sistem dilindungi dengan protokol keamanan standar universitas, enkripsi data, dan autentikasi berlapis untuk menjaga privasi peserta.</p>
            </div>
            <div className="feature-card">
              <Zap className="feature-icon" />
              <h3>Proses Registrasi Efisien</h3>
              <p>Sistem pendaftaran kehadiran yang optimal meminimalkan waktu tunggu dan meningkatkan efisiensi administrasi acara kampus.</p>
            </div>
            <div className="feature-card">
              <Building className="feature-icon" />
              <h3>Manajemen Data Institusi</h3>
              <p>Pencatatan dan analisis data peserta berdasarkan institusi untuk mendukung kerjasama akademik dan networking antar lembaga.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Sistem Manajemen Acara Resmi Universitas Dumai</h2>
            <p>Platform digital terintegrasi untuk mendukung administrasi dan dokumentasi kehadiran pada setiap kegiatan akademik dan kemahasiswaan.</p>
            <div className="cta-buttons">
              <Link to="/login" className="btn btn-primary btn-large">
                Akses Sistem Administrasi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;