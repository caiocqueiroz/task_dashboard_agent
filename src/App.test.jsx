import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import App from './App';

// Mock the child components
vi.mock('./features/tasks/components/GlobalTaskForm', () => ({
  default: ({ onCancel }) => (
    <div data-testid="global-task-form">
      <button onClick={onCancel} data-testid="cancel-form-button">Cancel</button>
    </div>
  )
}));

vi.mock('./features/lists/components/TaskBoard', () => ({
  default: () => <div data-testid="task-board">Task Board</div>
}));

// Mock the contexts
vi.mock('./context/TaskContext', () => ({
  TaskProvider: ({ children }) => <div data-testid="task-provider">{children}</div>
}));

vi.mock('./context/TagContext', () => ({
  TagProvider: ({ children }) => <div data-testid="tag-provider">{children}</div>
}));

vi.mock('./context/ListContext', () => ({
  ListProvider: ({ children }) => <div data-testid="list-provider">{children}</div>
}));

describe('App Component', () => {
  test('renders the app with title', () => {
    render(<App />);
    
    expect(screen.getByText('Task Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('app')).toBeInTheDocument();
  });

  test('renders the app header', () => {
    render(<App />);
    
    expect(screen.getByTestId('app-header')).toBeInTheDocument();
  });

  test('shows Add New Task button initially', () => {
    render(<App />);
    
    expect(screen.getByTestId('show-task-form-button')).toBeInTheDocument();
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
  });

  test('does not show GlobalTaskForm initially', () => {
    render(<App />);
    
    expect(screen.queryByTestId('global-task-form')).not.toBeInTheDocument();
  });

  test('shows GlobalTaskForm when button is clicked', async () => {
    render(<App />);
    
    const button = screen.getByTestId('show-task-form-button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByTestId('global-task-form')).toBeInTheDocument();
    });
  });

  test('hides Add New Task button when form is shown', async () => {
    render(<App />);
    
    const button = screen.getByTestId('show-task-form-button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.queryByTestId('show-task-form-button')).not.toBeInTheDocument();
    });
  });

  test('hides GlobalTaskForm when cancel is clicked', async () => {
    render(<App />);
    
    // Show form
    fireEvent.click(screen.getByTestId('show-task-form-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('global-task-form')).toBeInTheDocument();
    });
    
    // Cancel form
    fireEvent.click(screen.getByTestId('cancel-form-button'));
    
    await waitFor(() => {
      expect(screen.queryByTestId('global-task-form')).not.toBeInTheDocument();
    });
  });

  test('shows Add New Task button again after form is cancelled', async () => {
    render(<App />);
    
    // Show form
    fireEvent.click(screen.getByTestId('show-task-form-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('global-task-form')).toBeInTheDocument();
    });
    
    // Cancel form
    fireEvent.click(screen.getByTestId('cancel-form-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('show-task-form-button')).toBeInTheDocument();
    });
  });

  test('renders TaskBoard component', () => {
    render(<App />);
    
    expect(screen.getByTestId('task-board')).toBeInTheDocument();
  });

  test('providers are rendered in correct order', () => {
    render(<App />);
    
    // Check that providers wrap the content correctly
    expect(screen.getByTestId('task-provider')).toBeInTheDocument();
    expect(screen.getByTestId('tag-provider')).toBeInTheDocument();
    expect(screen.getByTestId('list-provider')).toBeInTheDocument();
  });

  test('task form container has proper test id when visible', async () => {
    render(<App />);
    
    fireEvent.click(screen.getByTestId('show-task-form-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('task-form-container')).toBeInTheDocument();
    });
  });
});
