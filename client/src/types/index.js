export const Event = {
  id: null,
  name: '',
  slug: '',
  description: '',
  date: '',
  location: '',
  created_at: '',
  updated_at: ''
};

export const Attendance = {
  id: null,
  event_id: null,
  guest_name: '',
  institution: '',
  position: '',
  phone: '',
  email: '',
  representative_count: 1,
  category: '',
  arrival_time: '',
  created_at: ''
};

export const User = {
  id: null,
  name: '',
  email: '',
  role: '',
  created_at: ''
};