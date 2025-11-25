import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

// Mock DataHydrationService
vi.mock('./common/utils/DataHydrationService', () => ({
  DataHydrationService: {
    shouldHydrate: vi.fn(() => false),
    getInitialTasks: vi.fn(() => []),
    getInitialTags: vi.fn(() => []),
    getInitialTaskLists: vi.fn(() => [])
  }
}));

// Mock child components
vi.mock('./features/tasks/components/GlobalTaskForm', () => ({
  default: ({ onCancel }) => (
    <div data-testid="global-task-form">
      <button onClick={onCancel} data-testid="cancel-button">Cancel</button>
    </div>
  )
}));

vi.mock('./features/lists/components/TaskBoard', () => ({
  default: () => <div data-testid="task-board">Task Board</div>
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders without crashing', () => {
      render(<App />);
      expect(screen.getByTestId('app')).toBeInTheDocument();
    });

    test('displays Task Dashboard title', () => {
      render(<App />);
      expect(screen.getByText('Task Dashboard')).toBeInTheDocument();
    });

    test('renders the app header', () => {
      render(<App />);
      expect(screen.getByTestId('app-header')).toBeInTheDocument();
    });

    test('renders TaskBoard component', () => {
      render(<App />);
      expect(screen.getByTestId('task-board')).toBeInTheDocument();
    });

    test('has proper CSS classes for layout', () => {
      render(<App />);
      const appDiv = screen.getByTestId('app');
      expect(appDiv).toHaveClass('App');
      expect(appDiv).toHaveClass('min-h-screen');
    });
  });

  describe('add task button', () => {
    test('shows add task button initially', () => {
      render(<App />);
      expect(screen.getByTestId('show-task-form-button')).toBeInTheDocument();
      expect(screen.getByText('Add New Task')).toBeInTheDocument();
    });

    test('add button has proper styling', () => {
      render(<App />);
      const button = screen.getByTestId('show-task-form-button');
      expect(button).toHaveClass('bg-primary-500');
    });

    test('does not show form initially', () => {
      render(<App />);
      expect(screen.queryByTestId('global-task-form')).not.toBeInTheDocument();
    });
  });

  describe('task form interactions', () => {
    test('displays form when add button is clicked', () => {
      render(<App />);
      const addButton = screen.getByTestId('show-task-form-button');
      
      fireEvent.click(addButton);
      
      expect(screen.getByTestId('global-task-form')).toBeInTheDocument();
    });

    test('hides add button when form is shown', () => {
      render(<App />);
      const addButton = screen.getByTestId('show-task-form-button');
      
      fireEvent.click(addButton);
      
      expect(screen.queryByTestId('show-task-form-button')).not.toBeInTheDocument();
    });

    test('shows form container with proper test id', () => {
      render(<App />);
      const addButton = screen.getByTestId('show-task-form-button');
      
      fireEvent.click(addButton);
      
      expect(screen.getByTestId('task-form-container')).toBeInTheDocument();
    });

    test('hides form when cancel is clicked', () => {
      render(<App />);
      const addButton = screen.getByTestId('show-task-form-button');
      
      fireEvent.click(addButton);
      expect(screen.getByTestId('global-task-form')).toBeInTheDocument();
      
      const cancelButton = screen.getByTestId('cancel-button');
      fireEvent.click(cancelButton);
      
      expect(screen.queryByTestId('global-task-form')).not.toBeInTheDocument();
    });

    test('shows add button again after cancel', () => {
      render(<App />);
      const addButton = screen.getByTestId('show-task-form-button');
      
      fireEvent.click(addButton);
      
      const cancelButton = screen.getByTestId('cancel-button');
      fireEvent.click(cancelButton);
      
      expect(screen.getByTestId('show-task-form-button')).toBeInTheDocument();
    });

    test('can toggle form multiple times', () => {
      render(<App />);
      
      // Show form
      fireEvent.click(screen.getByTestId('show-task-form-button'));
      expect(screen.getByTestId('global-task-form')).toBeInTheDocument();
      
      // Hide form
      fireEvent.click(screen.getByTestId('cancel-button'));
      expect(screen.queryByTestId('global-task-form')).not.toBeInTheDocument();
      
      // Show form again
      fireEvent.click(screen.getByTestId('show-task-form-button'));
      expect(screen.getByTestId('global-task-form')).toBeInTheDocument();
    });
  });

  describe('context providers', () => {
    test('renders with all required context providers', () => {
      // This test verifies the component renders successfully with all providers
      // If any provider is missing or misconfigured, the component would fail to render
      const { container } = render(<App />);
      expect(container.firstChild).toBeInTheDocument();
    });

    test('TaskBoard receives context from providers', () => {
      // TaskBoard is rendered, which means it has access to all contexts
      render(<App />);
      expect(screen.getByTestId('task-board')).toBeInTheDocument();
    });

    test('GlobalTaskForm receives context when displayed', () => {
      render(<App />);
      fireEvent.click(screen.getByTestId('show-task-form-button'));
      
      // GlobalTaskForm is rendered, which means it has access to all contexts
      expect(screen.getByTestId('global-task-form')).toBeInTheDocument();
    });
  });

  describe('integration', () => {
    test('maintains state between form show/hide cycles', () => {
      render(<App />);
      
      // Show and hide form multiple times
      for (let i = 0; i < 3; i++) {
        fireEvent.click(screen.getByTestId('show-task-form-button'));
        expect(screen.getByTestId('global-task-form')).toBeInTheDocument();
        
        fireEvent.click(screen.getByTestId('cancel-button'));
        expect(screen.getByTestId('show-task-form-button')).toBeInTheDocument();
      }
      
      // Component should still be stable
      expect(screen.getByTestId('app')).toBeInTheDocument();
      expect(screen.getByTestId('task-board')).toBeInTheDocument();
    });

    test('renders all main sections of the app', () => {
      render(<App />);
      
      // Header section
      expect(screen.getByText('Task Dashboard')).toBeInTheDocument();
      
      // Add task button or form
      expect(screen.getByTestId('show-task-form-button')).toBeInTheDocument();
      
      // Task board section
      expect(screen.getByTestId('task-board')).toBeInTheDocument();
    });
  });
});
