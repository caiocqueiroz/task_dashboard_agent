import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { ListProvider, useListContext } from './ListContext';

// Mock the DataHydrationService
vi.mock('../common/utils/DataHydrationService', () => ({
  DataHydrationService: {
    shouldHydrate: vi.fn(() => false),
    getInitialTaskLists: vi.fn(() => [
      { id: 'default', title: 'All Tasks', filters: [] },
      { id: 'list-1', title: 'Work Tasks', filters: [{ type: 'tag', value: 'work' }] }
    ])
  }
}));

// Import the mock to manipulate it in tests
import { DataHydrationService } from '../common/utils/DataHydrationService';

// Test component to access context values
const TestConsumer = ({ testFn }) => {
  const context = useListContext();
  testFn(context);
  return (
    <div>
      <span data-testid="lists-count">{context.taskLists.length}</span>
      <span data-testid="lists-titles">{context.taskLists.map(l => l.title).join(',')}</span>
    </div>
  );
};

describe('ListContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    DataHydrationService.shouldHydrate.mockReturnValue(false);
  });

  describe('ListProvider', () => {
    test('renders children correctly', () => {
      render(
        <ListProvider>
          <div data-testid="child">Child Component</div>
        </ListProvider>
      );
      
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child Component')).toBeInTheDocument();
    });

    test('initializes with default list when hydration is disabled', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(false);
      
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      expect(contextValue.taskLists.length).toBe(1);
      expect(contextValue.taskLists[0].id).toBe('default');
      expect(contextValue.taskLists[0].title).toBe('All Tasks');
      expect(contextValue.taskLists[0].filters).toEqual([]);
    });

    test('initializes with hydrated lists when hydration is enabled', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(true);
      
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      expect(contextValue.taskLists.length).toBe(2);
      expect(DataHydrationService.getInitialTaskLists).toHaveBeenCalled();
    });
  });

  describe('useListContext hook', () => {
    test('returns context values', () => {
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      expect(contextValue).toHaveProperty('taskLists');
      expect(contextValue).toHaveProperty('addTaskList');
      expect(contextValue).toHaveProperty('updateTaskList');
      expect(contextValue).toHaveProperty('deleteTaskList');
      expect(contextValue).toHaveProperty('getFilteredTasks');
    });
  });

  describe('addTaskList', () => {
    test('creates a new list with unique ID', () => {
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      act(() => {
        contextValue.addTaskList();
      });
      
      expect(contextValue.taskLists.length).toBe(2);
      // New list should have a unique ID starting with 'list-'
      const newList = contextValue.taskLists[1];
      expect(newList.id).toMatch(/^list-\d+$/);
      expect(newList.title).toBe('New List');
      expect(newList.filters).toEqual([]);
    });

    test('returns the newly created list', () => {
      let contextValue;
      let newList;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      act(() => {
        newList = contextValue.addTaskList();
      });
      
      expect(newList).toBeDefined();
      expect(newList.title).toBe('New List');
      expect(newList.id).toBeDefined();
    });
  });

  describe('updateTaskList', () => {
    test('updates list title', () => {
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      act(() => {
        contextValue.updateTaskList('default', { title: 'Updated Title' });
      });
      
      expect(contextValue.taskLists[0].title).toBe('Updated Title');
    });

    test('updates list filters', () => {
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      const newFilters = [{ type: 'tag', value: 'urgent' }];
      
      act(() => {
        contextValue.updateTaskList('default', { filters: newFilters });
      });
      
      expect(contextValue.taskLists[0].filters).toEqual(newFilters);
    });

    test('updates multiple properties at once', () => {
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      act(() => {
        contextValue.updateTaskList('default', { 
          title: 'New Title',
          filters: [{ type: 'completed', value: true }]
        });
      });
      
      expect(contextValue.taskLists[0].title).toBe('New Title');
      expect(contextValue.taskLists[0].filters).toEqual([{ type: 'completed', value: true }]);
    });

    test('preserves original list properties not being updated', () => {
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      const originalFilters = contextValue.taskLists[0].filters;
      
      act(() => {
        contextValue.updateTaskList('default', { title: 'Only Title Changed' });
      });
      
      expect(contextValue.taskLists[0].filters).toEqual(originalFilters);
    });
  });

  describe('deleteTaskList', () => {
    test('removes a non-default list', () => {
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      // Add a new list first
      act(() => {
        contextValue.addTaskList();
      });
      
      expect(contextValue.taskLists.length).toBe(2);
      
      const newListId = contextValue.taskLists[1].id;
      
      act(() => {
        contextValue.deleteTaskList(newListId);
      });
      
      expect(contextValue.taskLists.length).toBe(1);
      expect(contextValue.taskLists.find(l => l.id === newListId)).toBeUndefined();
    });

    test('does not remove the default list', () => {
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      expect(contextValue.taskLists.length).toBe(1);
      
      act(() => {
        contextValue.deleteTaskList('default');
      });
      
      // Default list should still exist
      expect(contextValue.taskLists.length).toBe(1);
      expect(contextValue.taskLists[0].id).toBe('default');
    });
  });

  describe('getFilteredTasks', () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', isCompleted: false, tags: ['work'] },
      { id: 2, title: 'Task 2', isCompleted: true, tags: ['personal'] },
      { id: 3, title: 'Task 3', isCompleted: false, tags: ['work', 'urgent'] },
      { id: 4, title: 'Task 4', isCompleted: true, tags: ['work'] }
    ];

    test('returns all tasks when no filters', () => {
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      const result = contextValue.getFilteredTasks([], mockTasks);
      
      expect(result.length).toBe(4);
    });

    test('returns all tasks when filterConfig is null', () => {
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      const result = contextValue.getFilteredTasks(null, mockTasks);
      
      expect(result.length).toBe(4);
    });

    test('filters tasks by tag', () => {
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      const filters = [{ type: 'tag', value: 'work' }];
      const result = contextValue.getFilteredTasks(filters, mockTasks);
      
      expect(result.length).toBe(3);
      expect(result.every(t => t.tags.includes('work'))).toBe(true);
    });

    test('filters tasks by completed status (true)', () => {
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      const filters = [{ type: 'completed', value: true }];
      const result = contextValue.getFilteredTasks(filters, mockTasks);
      
      expect(result.length).toBe(2);
      expect(result.every(t => t.isCompleted === true)).toBe(true);
    });

    test('filters tasks by completed status (false)', () => {
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      const filters = [{ type: 'completed', value: false }];
      const result = contextValue.getFilteredTasks(filters, mockTasks);
      
      expect(result.length).toBe(2);
      expect(result.every(t => t.isCompleted === false)).toBe(true);
    });

    test('applies multiple filters with AND logic', () => {
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      const filters = [
        { type: 'tag', value: 'work' },
        { type: 'completed', value: false }
      ];
      const result = contextValue.getFilteredTasks(filters, mockTasks);
      
      expect(result.length).toBe(2);
      expect(result.every(t => t.tags.includes('work') && t.isCompleted === false)).toBe(true);
    });

    test('returns empty array when no tasks match filters', () => {
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      const filters = [{ type: 'tag', value: 'nonexistent' }];
      const result = contextValue.getFilteredTasks(filters, mockTasks);
      
      expect(result.length).toBe(0);
    });

    test('handles tasks without tags when filtering by tag', () => {
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      const tasksWithoutTags = [
        { id: 1, title: 'Task without tags', isCompleted: false },
        { id: 2, title: 'Task with tags', isCompleted: false, tags: ['work'] }
      ];
      
      const filters = [{ type: 'tag', value: 'work' }];
      const result = contextValue.getFilteredTasks(filters, tasksWithoutTags);
      
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2);
    });

    test('handles unknown filter type gracefully', () => {
      let contextValue;
      render(
        <ListProvider>
          <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
        </ListProvider>
      );
      
      const filters = [{ type: 'unknownType', value: 'something' }];
      const result = contextValue.getFilteredTasks(filters, mockTasks);
      
      // Unknown filter type should return true (pass through)
      expect(result.length).toBe(4);
    });
  });
});
