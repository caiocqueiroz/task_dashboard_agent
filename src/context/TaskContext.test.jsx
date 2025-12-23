import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { TaskProvider, useTaskContext } from './TaskContext';

// Mock the DataHydrationService
vi.mock('../common/utils/DataHydrationService', () => ({
  DataHydrationService: {
    shouldHydrate: vi.fn(() => false),
    getInitialTasks: vi.fn(() => [
      { id: 1, title: 'Test Task 1', isCompleted: false, tags: ['tag1'] },
      { id: 2, title: 'Test Task 2', isCompleted: true, tags: ['tag2'] }
    ])
  }
}));

// Import the mock to manipulate it in tests
import { DataHydrationService } from '../common/utils/DataHydrationService';

// Test component to access context values
const TestConsumer = ({ testFn }) => {
  const context = useTaskContext();
  testFn(context);
  return (
    <div>
      <span data-testid="total">{context.stats.total}</span>
      <span data-testid="completed">{context.stats.completed}</span>
      <span data-testid="remaining">{context.stats.remaining}</span>
      <span data-testid="tasks-count">{context.tasks.length}</span>
    </div>
  );
};

describe('TaskContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    DataHydrationService.shouldHydrate.mockReturnValue(false);
  });

  describe('TaskProvider', () => {
    test('renders children correctly', () => {
      render(
        <TaskProvider>
          <div data-testid="child">Child Component</div>
        </TaskProvider>
      );
      
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child Component')).toBeInTheDocument();
    });

    test('initializes with empty tasks when hydration is disabled', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(false);
      
      let contextValue;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      expect(contextValue.tasks).toEqual([]);
      expect(screen.getByTestId('tasks-count')).toHaveTextContent('0');
    });

    test('initializes with hydrated tasks when hydration is enabled', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(true);
      
      let contextValue;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      expect(contextValue.tasks.length).toBe(2);
      expect(DataHydrationService.getInitialTasks).toHaveBeenCalled();
    });

    test('provides initial stats values', () => {
      render(
        <TaskProvider>
          <TestConsumer testFn={() => {}} />
        </TaskProvider>
      );
      
      expect(screen.getByTestId('total')).toHaveTextContent('0');
      expect(screen.getByTestId('completed')).toHaveTextContent('0');
      expect(screen.getByTestId('remaining')).toHaveTextContent('0');
    });
  });

  describe('useTaskContext hook', () => {
    test('returns context values', () => {
      let contextValue;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      expect(contextValue).toHaveProperty('tasks');
      expect(contextValue).toHaveProperty('stats');
      expect(contextValue).toHaveProperty('addTask');
      expect(contextValue).toHaveProperty('toggleTask');
      expect(contextValue).toHaveProperty('deleteTask');
      expect(contextValue).toHaveProperty('completeAllTasks');
      expect(contextValue).toHaveProperty('deleteCompletedTasks');
      expect(contextValue).toHaveProperty('updateTasksWithEditedTag');
      expect(contextValue).toHaveProperty('updateTasksWithDeletedTag');
    });
  });

  describe('addTask', () => {
    test('adds a new task with unique ID', () => {
      let contextValue;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      act(() => {
        contextValue.addTask({
          title: 'New Task',
          description: 'Task description',
          isCompleted: false,
          tags: ['tag1']
        });
      });
      
      expect(contextValue.tasks.length).toBe(1);
      expect(contextValue.tasks[0].title).toBe('New Task');
      expect(contextValue.tasks[0].id).toBeDefined();
      expect(typeof contextValue.tasks[0].id).toBe('number');
    });

    test('returns the newly created task', () => {
      let contextValue;
      let newTask;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      act(() => {
        newTask = contextValue.addTask({
          title: 'Return Test Task',
          isCompleted: false,
          tags: []
        });
      });
      
      expect(newTask.title).toBe('Return Test Task');
      expect(newTask.id).toBeDefined();
    });
  });

  describe('toggleTask', () => {
    test('toggles task completion status', () => {
      let contextValue;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      // Add a task first
      act(() => {
        contextValue.addTask({
          title: 'Toggle Test',
          isCompleted: false,
          tags: []
        });
      });
      
      const taskId = contextValue.tasks[0].id;
      expect(contextValue.tasks[0].isCompleted).toBe(false);
      
      // Toggle to completed
      act(() => {
        contextValue.toggleTask(taskId);
      });
      
      expect(contextValue.tasks[0].isCompleted).toBe(true);
      
      // Toggle back to incomplete
      act(() => {
        contextValue.toggleTask(taskId);
      });
      
      expect(contextValue.tasks[0].isCompleted).toBe(false);
    });
  });

  describe('deleteTask', () => {
    test('removes a task by ID', () => {
      let contextValue;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      // Add first task
      act(() => {
        contextValue.addTask({ title: 'Task 1', isCompleted: false, tags: [] });
      });
      
      // Add second task
      act(() => {
        contextValue.addTask({ title: 'Task 2', isCompleted: false, tags: [] });
      });
      
      expect(contextValue.tasks.length).toBe(2);
      
      const taskIdToDelete = contextValue.tasks[0].id;
      
      act(() => {
        contextValue.deleteTask(taskIdToDelete);
      });
      
      expect(contextValue.tasks.length).toBe(1);
      expect(contextValue.tasks.find(t => t.id === taskIdToDelete)).toBeUndefined();
    });
  });

  describe('completeAllTasks', () => {
    test('completes all tasks when no IDs provided', () => {
      let contextValue;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      // Add tasks one by one
      act(() => {
        contextValue.addTask({ title: 'Task 1', isCompleted: false, tags: [] });
      });
      act(() => {
        contextValue.addTask({ title: 'Task 2', isCompleted: false, tags: [] });
      });
      act(() => {
        contextValue.addTask({ title: 'Task 3', isCompleted: false, tags: [] });
      });
      
      act(() => {
        contextValue.completeAllTasks();
      });
      
      expect(contextValue.tasks.every(t => t.isCompleted)).toBe(true);
    });

    test('completes only specific tasks when IDs provided', () => {
      let contextValue;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      // Add tasks one by one
      act(() => {
        contextValue.addTask({ title: 'Task 1', isCompleted: false, tags: [] });
      });
      act(() => {
        contextValue.addTask({ title: 'Task 2', isCompleted: false, tags: [] });
      });
      act(() => {
        contextValue.addTask({ title: 'Task 3', isCompleted: false, tags: [] });
      });
      
      const taskIdsToComplete = [contextValue.tasks[0].id, contextValue.tasks[1].id];
      
      act(() => {
        contextValue.completeAllTasks(taskIdsToComplete);
      });
      
      expect(contextValue.tasks[0].isCompleted).toBe(true);
      expect(contextValue.tasks[1].isCompleted).toBe(true);
      expect(contextValue.tasks[2].isCompleted).toBe(false);
    });
  });

  describe('deleteCompletedTasks', () => {
    test('deletes all completed tasks when no IDs provided', () => {
      let contextValue;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      // Add tasks one by one
      act(() => {
        contextValue.addTask({ title: 'Task 1', isCompleted: true, tags: [] });
      });
      act(() => {
        contextValue.addTask({ title: 'Task 2', isCompleted: false, tags: [] });
      });
      act(() => {
        contextValue.addTask({ title: 'Task 3', isCompleted: true, tags: [] });
      });
      
      act(() => {
        contextValue.deleteCompletedTasks();
      });
      
      expect(contextValue.tasks.length).toBe(1);
      expect(contextValue.tasks[0].title).toBe('Task 2');
    });

    test('deletes only specific tasks when IDs provided', () => {
      let contextValue;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      // Add tasks one by one
      act(() => {
        contextValue.addTask({ title: 'Task 1', isCompleted: true, tags: [] });
      });
      act(() => {
        contextValue.addTask({ title: 'Task 2', isCompleted: true, tags: [] });
      });
      act(() => {
        contextValue.addTask({ title: 'Task 3', isCompleted: true, tags: [] });
      });
      
      const taskIdToDelete = contextValue.tasks[0].id;
      
      act(() => {
        contextValue.deleteCompletedTasks([taskIdToDelete]);
      });
      
      expect(contextValue.tasks.length).toBe(2);
      expect(contextValue.tasks.find(t => t.id === taskIdToDelete)).toBeUndefined();
    });
  });

  describe('updateTasksWithEditedTag', () => {
    test('updates tags in tasks when a tag is edited', () => {
      let contextValue;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      // Add task with tags
      act(() => {
        contextValue.addTask({ 
          title: 'Task with tags', 
          isCompleted: false, 
          tags: ['oldTag', 'otherTag'] 
        });
      });
      
      act(() => {
        contextValue.updateTasksWithEditedTag('oldTag', 'newTag');
      });
      
      expect(contextValue.tasks[0].tags).toContain('newTag');
      expect(contextValue.tasks[0].tags).toContain('otherTag');
      expect(contextValue.tasks[0].tags).not.toContain('oldTag');
    });

    test('does not affect tasks without the edited tag', () => {
      let contextValue;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      // Add task without the tag to edit
      act(() => {
        contextValue.addTask({ 
          title: 'Task without target tag', 
          isCompleted: false, 
          tags: ['differentTag'] 
        });
      });
      
      act(() => {
        contextValue.updateTasksWithEditedTag('oldTag', 'newTag');
      });
      
      expect(contextValue.tasks[0].tags).toContain('differentTag');
      expect(contextValue.tasks[0].tags).not.toContain('newTag');
    });

    test('handles tasks without tags property', () => {
      let contextValue;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      // Add task without tags property
      act(() => {
        contextValue.addTask({ 
          title: 'Task without tags', 
          isCompleted: false
        });
      });
      
      // Should not throw
      act(() => {
        contextValue.updateTasksWithEditedTag('oldTag', 'newTag');
      });
      
      expect(contextValue.tasks[0].title).toBe('Task without tags');
    });
  });

  describe('updateTasksWithDeletedTag', () => {
    test('removes tag from tasks when a tag is deleted', () => {
      let contextValue;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      // Add task with tags
      act(() => {
        contextValue.addTask({ 
          title: 'Task with tags', 
          isCompleted: false, 
          tags: ['tagToDelete', 'keepTag'] 
        });
      });
      
      act(() => {
        contextValue.updateTasksWithDeletedTag('tagToDelete');
      });
      
      expect(contextValue.tasks[0].tags).not.toContain('tagToDelete');
      expect(contextValue.tasks[0].tags).toContain('keepTag');
    });

    test('does not affect tasks without the deleted tag', () => {
      let contextValue;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      // Add task without the tag to delete
      act(() => {
        contextValue.addTask({ 
          title: 'Task without target tag', 
          isCompleted: false, 
          tags: ['otherTag'] 
        });
      });
      
      act(() => {
        contextValue.updateTasksWithDeletedTag('tagToDelete');
      });
      
      expect(contextValue.tasks[0].tags).toContain('otherTag');
      expect(contextValue.tasks[0].tags.length).toBe(1);
    });
  });

  describe('stats calculation', () => {
    test('calculates stats correctly when tasks change', () => {
      let contextValue;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      // Add tasks one by one
      act(() => {
        contextValue.addTask({ title: 'Task 1', isCompleted: false, tags: [] });
      });
      act(() => {
        contextValue.addTask({ title: 'Task 2', isCompleted: true, tags: [] });
      });
      act(() => {
        contextValue.addTask({ title: 'Task 3', isCompleted: false, tags: [] });
      });
      
      expect(contextValue.stats.total).toBe(3);
      expect(contextValue.stats.completed).toBe(1);
      expect(contextValue.stats.remaining).toBe(2);
    });

    test('updates stats when task is toggled', () => {
      let contextValue;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      // Add incomplete task
      act(() => {
        contextValue.addTask({ title: 'Task 1', isCompleted: false, tags: [] });
      });
      
      expect(contextValue.stats.completed).toBe(0);
      
      act(() => {
        contextValue.toggleTask(contextValue.tasks[0].id);
      });
      
      expect(contextValue.stats.completed).toBe(1);
    });

    test('updates stats when task is deleted', () => {
      let contextValue;
      render(
        <TaskProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </TaskProvider>
      );
      
      // Add tasks one by one
      act(() => {
        contextValue.addTask({ title: 'Task 1', isCompleted: false, tags: [] });
      });
      act(() => {
        contextValue.addTask({ title: 'Task 2', isCompleted: false, tags: [] });
      });
      
      expect(contextValue.stats.total).toBe(2);
      
      act(() => {
        contextValue.deleteTask(contextValue.tasks[0].id);
      });
      
      expect(contextValue.stats.total).toBe(1);
    });
  });
});
