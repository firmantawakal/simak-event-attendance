// Simple test file to validate EventEditModal component structure
import { render, screen } from '@testing-library/react';
import EventEditModal from '../EventEditModal';

// Mock React Hook Form
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: jest.fn((fn) => (e) => {
      e.preventDefault();
      return fn({});
    }),
    formState: { errors: {} },
    watch: jest.fn(() => ''),
    setValue: jest.fn(),
    reset: jest.fn(),
    setError: jest.fn()
  })
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

// Mock API client
jest.mock('../../api/client', () => ({
  put: jest.fn(() => Promise.resolve({ data: { event: { id: 1, name: 'Test Event' } } })),
  post: jest.fn(() => Promise.resolve({ data: { event: { id: 1, name: 'Test Event' } } }))
}));

describe('EventEditModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const mockEvent = {
    id: 1,
    name: 'Test Event',
    slug: 'test-event',
    description: 'Test Description',
    date: '2023-12-25T10:00:00.000Z',
    location: 'Test Location'
  };

  test('renders modal when open', () => {
    render(
      <EventEditModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        event={mockEvent}
      />
    );

    expect(screen.getByText('Edit Acara')).toBeInTheDocument();
  });

  test('renders create modal when no event provided', () => {
    render(
      <EventEditModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        event={null}
      />
    );

    expect(screen.getByText('Tambah Acara Baru')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    const { container } = render(
      <EventEditModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        event={mockEvent}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});