// Simple test file to validate AdminActionDropdown component structure
import { render, screen, fireEvent } from '@testing-library/react';
import AdminActionDropdown from '../AdminActionDropdown';

describe('AdminActionDropdown', () => {
  const mockOnEditEvent = jest.fn();
  const mockOnDeleteEvent = jest.fn();
  const mockOnManageInstitutions = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dropdown toggle button', () => {
    render(
      <AdminActionDropdown
        onEditEvent={mockOnEditEvent}
        onDeleteEvent={mockOnDeleteEvent}
        onManageInstitutions={mockOnManageInstitutions}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /admin actions/i });
    expect(toggleButton).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  test('opens dropdown menu on click', () => {
    render(
      <AdminActionDropdown
        onEditEvent={mockOnEditEvent}
        onDeleteEvent={mockOnDeleteEvent}
        onManageInstitutions={mockOnManageInstitutions}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /admin actions/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText('Edit Acara')).toBeInTheDocument();
    expect(screen.getByText('Hapus Acara')).toBeInTheDocument();
    expect(screen.getByText('Kelola Institusi')).toBeInTheDocument();
  });

  test('calls correct handlers when menu items are clicked', () => {
    render(
      <AdminActionDropdown
        onEditEvent={mockOnEditEvent}
        onDeleteEvent={mockOnDeleteEvent}
        onManageInstitutions={mockOnManageInstitutions}
      />
    );

    // Open dropdown
    const toggleButton = screen.getByRole('button', { name: /admin actions/i });
    fireEvent.click(toggleButton);

    // Click edit item
    const editItem = screen.getByText('Edit Acara');
    fireEvent.click(editItem);
    expect(mockOnEditEvent).toHaveBeenCalledTimes(1);

    // Re-open dropdown
    fireEvent.click(toggleButton);

    // Click delete item
    const deleteItem = screen.getByText('Hapus Acara');
    fireEvent.click(deleteItem);
    expect(mockOnDeleteEvent).toHaveBeenCalledTimes(1);

    // Re-open dropdown
    fireEvent.click(toggleButton);

    // Click institution item
    const institutionItem = screen.getByText('Kelola Institusi');
    fireEvent.click(institutionItem);
    expect(mockOnManageInstitutions).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(
      <AdminActionDropdown
        onEditEvent={mockOnEditEvent}
        onDeleteEvent={mockOnDeleteEvent}
        onManageInstitutions={mockOnManageInstitutions}
        disabled={true}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /admin actions/i });
    expect(toggleButton).toBeDisabled();
  });
});