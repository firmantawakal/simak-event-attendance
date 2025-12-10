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
        <h1>Attendance Recorded Successfully!</h1>
        <p className="text-muted">
          Thank you for registering for this event.
        </p>

        <div className="success-actions">
          <Link to={`/attend/${eventSlug}`} className="btn btn-outline">
            Register Another Person
          </Link>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AttendSuccess;