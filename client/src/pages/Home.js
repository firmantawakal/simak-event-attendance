import React from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';

const Home = () => {
  return (
    <div className="home">
      <div className="hero-section">
        <div className="card text-center">
          <h1>SIMAK Digital Guestbook</h1>
          <p className="text-muted">
            Modern attendance tracking system for campus events
          </p>
          <div className="hero-buttons mt-3">
            <Link to="/events" className="btn btn-primary mr-2">
              View Events
            </Link>
            <Link to="/events/create" className="btn btn-secondary">
              Create Event
            </Link>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2 className="text-center mb-3">Features</h2>
        <div className="features-grid">
          <div className="card">
            <h3>📱 Mobile Friendly</h3>
            <p>Guests can easily check in using their mobile devices</p>
          </div>
          <div className="card">
            <h3>📊 Real-time Analytics</h3>
            <p>View attendance data and statistics in real-time</p>
          </div>
          <div className="card">
            <h3>📤 Export Data</h3>
            <p>Export attendance reports to CSV for further analysis</p>
          </div>
          <div className="card">
            <h3>🔒 Secure</h3>
            <p>Protected with input validation and rate limiting</p>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="card text-center">
          <h2>Quick Stats</h2>
          <p>Track your event attendance with ease</p>
          <Link to="/events" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;