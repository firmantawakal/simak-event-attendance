import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import EventsList from './pages/EventsList';
import EventCreate from './pages/EventCreate';
import EventDetail from './pages/EventDetail';
import AttendForm from './pages/AttendForm';
import AttendSuccess from './pages/AttendSuccess';
import GuestDisplay from './pages/GuestDisplay';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/events" element={<EventsList />} />
          <Route path="/events/create" element={<EventCreate />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/attend/:eventSlug" element={<AttendForm />} />
          <Route path="/attend/:eventSlug/success" element={<AttendSuccess />} />
          <Route path="/display/:slug" element={<GuestDisplay />} />
        </Routes>
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </Router>
  );
}

export default App;