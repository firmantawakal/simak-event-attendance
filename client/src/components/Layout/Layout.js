import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();

  const isAttendPage = location.pathname.startsWith('/attend');

  return (
    <div className="layout">
      {!isAttendPage && (
        <nav className="navbar">
          <div className="container">
            <Link to="/" className="navbar-brand">
              SIMAK
            </Link>
            <div className="navbar-menu">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/events" className="nav-link">Events</Link>
              <Link to="/events/create" className="nav-link">Create Event</Link>
            </div>
          </div>
        </nav>
      )}

      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>

      {!isAttendPage && (
        <footer className="footer">
          <div className="container">
            <p className="text-center">
              © 2024 SIMAK - Campus Digital Guestbook. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;