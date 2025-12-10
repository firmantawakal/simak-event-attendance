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
            <h1>Buku Tamu Digital</h1>
            <p className="hero-subtitle">
              Universitas Dumai - Sistem manajemen acara dan kehadiran kampus
            </p>
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary">
                Login Admin
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
          <h2 className="section-title">Statistik Platform</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">
                {isLoading ? (
                  <div className="spinner"></div>
                ) : (
                  stats.totalEvents
                )}
              </div>
              <div className="stat-label">Total Acara</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {isLoading ? (
                  <div className="spinner"></div>
                ) : (
                  stats.totalAttendees
                )}
              </div>
              <div className="stat-label">Total Tamu</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {isLoading ? (
                  <div className="spinner"></div>
                ) : (
                  stats.totalInstitutions
                )}
              </div>
              <div className="stat-label">Institusi</div>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Mengapa Memilih Sistem Kami?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <Smartphone className="feature-icon" />
              <h3>Mobile Friendly</h3>
              <p>Tamu dapat dengan mudah check-in menggunakan perangkat mobile dengan desain responsif yang dioptimalkan untuk semua ukuran layar.</p>
            </div>
            <div className="feature-card">
              <BarChart3 className="feature-icon" />
              <h3>Analitik Real-time</h3>
              <p>Lihat data kehadiran dan statistik secara real-time dengan dashboard interaktif dan update instan.</p>
            </div>
            <div className="feature-card">
              <Download className="feature-icon" />
              <h3>Ekspor Data</h3>
              <p>Ekspor laporan kehadiran ke format CSV dan Excel untuk analisis lebih lanjut dan penyimpanan rekaman.</p>
            </div>
            <div className="feature-card">
              <Shield className="feature-icon" />
              <h3>Aman & Terpercaya</h3>
              <p>Dilindungi dengan validasi input, rate limiting, dan autentikasi aman untuk menjaga keamanan data Anda.</p>
            </div>
            <div className="feature-card">
              <Zap className="feature-icon" />
              <h3>Check-in Cepat</h3>
              <p>Proses check-in yang cepat dan efisien mengurangi antrian dan meningkatkan pengalaman tamu di acara Anda.</p>
            </div>
            <div className="feature-card">
              <Building className="feature-icon" />
              <h3>Tracking Institusi</h3>
              <p>Lacak peserta berdasarkan institusi untuk wawasan lebih baik dan peluang networking di acara kampus.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Siap untuk Transformasi Manajemen Acara Anda?</h2>
            <p>Bergabunglah dengan ribuan penyelenggara acara yang telah mendigitalkan sistem tracking kehadiran mereka.</p>
            <div className="cta-buttons">
              <Link to="/login" className="btn btn-primary btn-large">
                Mulai Sekarang
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;