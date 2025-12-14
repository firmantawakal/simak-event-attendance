import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import './AttendSuccess.css';

const AttendSuccess = () => {
  const { eventSlug } = useParams();

  return (
    <div className="attend-success">
      <div className="card text-center">
        <CheckCircle className="success-icon" />
        <h1>Kehadiran berhasil disimpan!</h1>
        <p className="text-muted">
          Terimakasih telah melakukan registrasi pada acara ini.
        </p>

        <div className="success-actions">
          <Link to={`/attend/${eventSlug}`} className="btn btn-outline">
            Registrasi Ulang
          </Link>
          <Link to="/" className="btn btn-primary">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AttendSuccess;