import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '../api/client';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/events';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', data);

      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Dispatch custom event to notify Layout component
      window.dispatchEvent(new CustomEvent('userLogin'));

      toast.success(`Selamat datang kembali, ${response.data.user.name}!`);

      // Redirect to the intended page
      navigate(from === '/login' ? '/events' : from, { replace: true });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login gagal. Silakan coba lagi.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Selamat Datang Kembali</h1>
          <p>Login untuk mengelola acara Anda</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Alamat Email</label>
            <input
              type="email"
              id="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="admin@universitasdumai.ac.id"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email.message}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Kata Sandi</label>
            <input
              type="password"
              id="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Masukkan kata sandi Anda"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password.message}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Masuk...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <div className="demo-credentials">
            <h6>Akun Demo:</h6>
            <p className="mb-1">
              <strong>Email:</strong> admin@universitasdumai.ac.id
            </p>
            <p className="mb-0">
              <strong>Kata Sandi:</strong> admin123
            </p>
          </div>

          <div className="auth-links">
            <Link to="/" className="btn btn-link">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;