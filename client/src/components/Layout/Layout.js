import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, CalendarPlus, LogOut, User, Menu, X, Building2, ChevronDown } from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isAttendPage = location.pathname.startsWith('/attend');
  const isDisplayPage = location.pathname.startsWith('/display');
  const isFullPage = isAttendPage || isDisplayPage;

  useEffect(() => {
    // Check if user is logged in on component mount
    const updateUserFromStorage = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    updateUserFromStorage();

    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = () => {
      updateUserFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab updates)
    window.addEventListener('userLogin', handleStorageChange);
    window.addEventListener('userLogout', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange);
      window.removeEventListener('userLogout', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsUserMenuOpen(false);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('userLogout'));

    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
      if (!event.target.closest('.mobile-menu-container') && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    closeMenus();
  }, [location.pathname]);

  // Check if current page is login page
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="layout">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {!isFullPage && (
        <nav className="navbar" role="navigation" aria-label="Main navigation">
          <div className="container">
            <div className="navbar-brand-container">
              <Link to="/" className="navbar-brand" aria-label="Universitas Dumai Home">
                <Building2 className="brand-icon" />
                <span className="brand-text">Universitas Dumai</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="navbar-menu desktop-only">
              <Link
                to="/"
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                aria-current={location.pathname === '/' ? 'page' : undefined}
              >
                <Home className="inline-icon" /> Beranda
              </Link>

              {/* Show admin links only when user is logged in */}
              {user && (
                <>
                  <Link
                    to="/events"
                    className={`nav-link ${location.pathname.startsWith('/events') ? 'active' : ''}`}
                    aria-current={location.pathname.startsWith('/events') ? 'page' : undefined}
                  >
                    Acara
                  </Link>
                  <Link
                    to="/events/create"
                    className="nav-link"
                    aria-current={location.pathname === '/events/create' ? 'page' : undefined}
                  >
                    <CalendarPlus className="inline-icon" /> Buat Acara
                  </Link>
                </>
              )}

              {/* Show login link only when user is not logged in and not on login page */}
              {!user && !isLoginPage && (
                <Link to="/login" className="nav-link nav-link-primary">
                  <User className="inline-icon" /> Login
                </Link>
              )}

              {/* Show user menu only when user is logged in */}
              {user && (
                <div className="user-menu-container">
                  <button
                    onClick={toggleUserMenu}
                    className="user-menu-button"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="menu"
                  >
                    <div className="user-avatar">
                      <User className="user-avatar-icon" />
                    </div>
                    <span className="user-name">{user.name}</span>
                    <ChevronDown className={`chevron-icon ${isUserMenuOpen ? 'open' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="user-dropdown" role="menu">
                      <div className="user-info">
                        <div className="user-avatar">
                          <User className="user-avatar-icon" />
                        </div>
                        <div>
                          <div className="user-name">{user.name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                      <div className="dropdown-divider"></div>
                      <button
                        onClick={handleLogout}
                        className="dropdown-item logout-item"
                        role="menuitem"
                      >
                        <LogOut className="inline-icon" /> Keluar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="mobile-menu-container mobile-only">
              <button
                onClick={toggleMobileMenu}
                className="mobile-menu-button"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div id="mobile-menu" className="mobile-menu">
              <div className="container">
                <div className="mobile-menu-content">
                  <Link
                    to="/"
                    className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    onClick={closeMenus}
                  >
                    <Home className="inline-icon" /> Beranda
                  </Link>

                  {user && (
                    <>
                      <Link
                        to="/events"
                        className={`mobile-nav-link ${location.pathname.startsWith('/events') ? 'active' : ''}`}
                        onClick={closeMenus}
                      >
                        Acara
                      </Link>
                      <Link
                        to="/events/create"
                        className="mobile-nav-link"
                        onClick={closeMenus}
                      >
                        <CalendarPlus className="inline-icon" /> Buat Acara
                      </Link>
                    </>
                  )}

                  {!user && !isLoginPage && (
                    <Link to="/login" className="mobile-nav-link mobile-nav-primary" onClick={closeMenus}>
                      <User className="inline-icon" /> Login
                    </Link>
                  )}

                  {user && (
                    <>
                      <div className="mobile-user-info">
                        <div className="user-avatar">
                          <User className="user-avatar-icon" />
                        </div>
                        <div>
                          <div className="user-name">{user.name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="mobile-nav-link mobile-nav-logout"
                      >
                        <LogOut className="inline-icon" /> Keluar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      )}

      {/* Main Content */}
      <main id="main-content" className="main-content" role="main">
        <div className="container">
          {children}
        </div>
      </main>

      {/* Footer */}
      {!isFullPage && (
        <footer className="footer" role="contentinfo">
          <div className="container">
            <div className="footer-content">
              <div className="footer-brand">
                <Building2 className="footer-brand-icon" />
                <span>Universitas Dumai</span>
              </div>
              <div className="footer-text">
                © 2024 Universitas Dumai - Buku Tamu Digital. Semua hak dilindungi.
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;