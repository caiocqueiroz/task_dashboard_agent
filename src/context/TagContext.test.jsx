import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { TagProvider, useTagContext } from './TagContext';
import { TaskProvider } from './TaskContext';

// Mock the DataHydrationService
vi.mock('../common/utils/DataHydrationService', () => ({
  DataHydrationService: {
    shouldHydrate: vi.fn(() => false),
    getInitialTags: vi.fn(() => ['tag1', 'tag2', 'tag3']),
    getInitialTasks: vi.fn(() => [])
  }
}));

// Import the mock to manipulate it in tests
import { DataHydrationService } from '../common/utils/DataHydrationService';

// Test component to access context values
const TestConsumer = ({ testFn }) => {
  const context = useTagContext();
  testFn(context);
  return (
    <div>
      <span data-testid="tags-count">{context.tags.length}</span>
      <span data-testid="tags-list">{context.tags.join(',')}</span>
    </div>
  );
};

// Wrapper to provide TaskContext since TagContext depends on it
const TestWrapper = ({ children }) => (
  <TaskProvider>
    {children}
  </TaskProvider>
);

describe('TagContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    DataHydrationService.shouldHydrate.mockReturnValue(false);
  });

  describe('TagProvider', () => {
    test('renders children correctly', () => {
      render(
        <TestWrapper>
          <TagProvider>
            <div data-testid="child">Child Component</div>
          </TagProvider>
        </TestWrapper>
      );
      
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child Component')).toBeInTheDocument();
    });

    test('initializes with empty tags when hydration is disabled', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(false);
      
      let contextValue;
      render(
        <TestWrapper>
          <TagProvider>
            <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
          </TagProvider>
        </TestWrapper>
      );
      
      expect(contextValue.tags).toEqual([]);
      expect(screen.getByTestId('tags-count')).toHaveTextContent('0');
    });

    test('initializes with hydrated tags when hydration is enabled', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(true);
      
      let contextValue;
      render(
        <TestWrapper>
          <TagProvider>
            <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
          </TagProvider>
        </TestWrapper>
      );
      
      expect(contextValue.tags.length).toBe(3);
      expect(DataHydrationService.getInitialTags).toHaveBeenCalled();
    });
  });

  describe('useTagContext hook', () => {
    test('returns context values', () => {
      let contextValue;
      render(
        <TestWrapper>
          <TagProvider>
            <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
          </TagProvider>
        </TestWrapper>
      );
      
      expect(contextValue).toHaveProperty('tags');
      expect(contextValue).toHaveProperty('addTag');
      expect(contextValue).toHaveProperty('editTag');
      expect(contextValue).toHaveProperty('deleteTag');
      expect(contextValue).toHaveProperty('handleManageTags');
    });
  });

  describe('addTag', () => {
    test('adds a new tag', () => {
      let contextValue;
      render(
        <TestWrapper>
          <TagProvider>
            <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
          </TagProvider>
        </TestWrapper>
      );
      
      act(() => {
        contextValue.addTag('newTag');
      });
      
      expect(contextValue.tags).toContain('newTag');
      expect(contextValue.tags.length).toBe(1);
    });

    test('does not add duplicate tag', () => {
      let contextValue;
      render(
        <TestWrapper>
          <TagProvider>
            <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
          </TagProvider>
        </TestWrapper>
      );
      
      act(() => {
        contextValue.addTag('uniqueTag');
      });
      
      act(() => {
        contextValue.addTag('uniqueTag');
      });
      
      expect(contextValue.tags.filter(t => t === 'uniqueTag').length).toBe(1);
    });
  });

  describe('editTag', () => {
    test('edits an existing tag', () => {
      let contextValue;
      render(
        <TestWrapper>
          <TagProvider>
            <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
          </TagProvider>
        </TestWrapper>
      );
      
      // Add a tag first
      act(() => {
        contextValue.addTag('oldTag');
      });
      
      // Edit the tag
      act(() => {
        contextValue.editTag('oldTag', 'newTag');
      });
      
      expect(contextValue.tags).toContain('newTag');
      expect(contextValue.tags).not.toContain('oldTag');
    });

    test('does not affect other tags when editing', () => {
      let contextValue;
      render(
        <TestWrapper>
          <TagProvider>
            <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
          </TagProvider>
        </TestWrapper>
      );
      
      // Add tags
      act(() => {
        contextValue.addTag('tagA');
      });
      act(() => {
        contextValue.addTag('tagB');
      });
      
      // Edit only one tag
      act(() => {
        contextValue.editTag('tagA', 'tagC');
      });
      
      expect(contextValue.tags).toContain('tagC');
      expect(contextValue.tags).toContain('tagB');
      expect(contextValue.tags).not.toContain('tagA');
    });
  });

  describe('deleteTag', () => {
    test('removes a tag', () => {
      let contextValue;
      render(
        <TestWrapper>
          <TagProvider>
            <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
          </TagProvider>
        </TestWrapper>
      );
      
      // Add a tag first
      act(() => {
        contextValue.addTag('tagToDelete');
      });
      
      expect(contextValue.tags).toContain('tagToDelete');
      
      // Delete the tag
      act(() => {
        contextValue.deleteTag('tagToDelete');
      });
      
      expect(contextValue.tags).not.toContain('tagToDelete');
    });

    test('does not affect other tags when deleting', () => {
      let contextValue;
      render(
        <TestWrapper>
          <TagProvider>
            <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
          </TagProvider>
        </TestWrapper>
      );
      
      // Add tags
      act(() => {
        contextValue.addTag('tagA');
      });
      act(() => {
        contextValue.addTag('tagB');
      });
      
      // Delete only one tag
      act(() => {
        contextValue.deleteTag('tagA');
      });
      
      expect(contextValue.tags).not.toContain('tagA');
      expect(contextValue.tags).toContain('tagB');
    });
  });

  describe('handleManageTags', () => {
    test('handles add operation', () => {
      let contextValue;
      render(
        <TestWrapper>
          <TagProvider>
            <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
          </TagProvider>
        </TestWrapper>
      );
      
      act(() => {
        contextValue.handleManageTags('add', 'managedTag');
      });
      
      expect(contextValue.tags).toContain('managedTag');
    });

    test('handles edit operation', () => {
      let contextValue;
      render(
        <TestWrapper>
          <TagProvider>
            <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
          </TagProvider>
        </TestWrapper>
      );
      
      // Add a tag first
      act(() => {
        contextValue.addTag('originalTag');
      });
      
      // Edit via handleManageTags
      act(() => {
        contextValue.handleManageTags('edit', 'originalTag', 'editedTag');
      });
      
      expect(contextValue.tags).toContain('editedTag');
      expect(contextValue.tags).not.toContain('originalTag');
    });

    test('handles delete operation', () => {
      let contextValue;
      render(
        <TestWrapper>
          <TagProvider>
            <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
          </TagProvider>
        </TestWrapper>
      );
      
      // Add a tag first
      act(() => {
        contextValue.addTag('tagToRemove');
      });
      
      // Delete via handleManageTags
      act(() => {
        contextValue.handleManageTags('delete', 'tagToRemove');
      });
      
      expect(contextValue.tags).not.toContain('tagToRemove');
    });

    test('handles unknown operation gracefully', () => {
      let contextValue;
      render(
        <TestWrapper>
          <TagProvider>
            <TestConsumer testFn={(ctx) => { contextValue = ctx; }} />
          </TagProvider>
        </TestWrapper>
      );
      
      // Add a tag first
      act(() => {
        contextValue.addTag('existingTag');
      });
      
      const initialTagsLength = contextValue.tags.length;
      
      // Unknown operation should not throw and should not change state
      act(() => {
        contextValue.handleManageTags('unknownOperation', 'existingTag');
      });
      
      expect(contextValue.tags.length).toBe(initialTagsLength);
    });
  });
});
