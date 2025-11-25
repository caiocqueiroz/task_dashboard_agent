import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { DataHydrationService } from './DataHydrationService';

// Mock the initial data
vi.mock('../../data/initialData.json', () => ({
  default: {
    taskLists: [
      { id: 'default', title: 'All Tasks', filters: [] },
      { id: 'list-1', title: 'Work', filters: [{ type: 'tag', value: 'work' }] }
    ],
    tags: ['work', 'personal', 'urgent'],
    tasks: [
      { id: 1, title: 'Test Task 1', isCompleted: false, tags: ['work'] },
      { id: 2, title: 'Test Task 2', isCompleted: true, tags: ['personal'] }
    ]
  }
}));

describe('DataHydrationService', () => {
  describe('getInitialTaskLists', () => {
    test('returns array of task lists', () => {
      const result = DataHydrationService.getInitialTaskLists();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    test('returned task lists have correct structure', () => {
      const result = DataHydrationService.getInitialTaskLists();
      
      result.forEach(list => {
        expect(list).toHaveProperty('id');
        expect(list).toHaveProperty('title');
        expect(list).toHaveProperty('filters');
        expect(Array.isArray(list.filters)).toBe(true);
      });
    });

    test('includes default list', () => {
      const result = DataHydrationService.getInitialTaskLists();
      
      const defaultList = result.find(list => list.id === 'default');
      expect(defaultList).toBeDefined();
      expect(defaultList.title).toBe('All Tasks');
    });
  });

  describe('getInitialTags', () => {
    test('returns array of tags', () => {
      const result = DataHydrationService.getInitialTags();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
    });

    test('returned tags are strings', () => {
      const result = DataHydrationService.getInitialTags();
      
      result.forEach(tag => {
        expect(typeof tag).toBe('string');
      });
    });

    test('contains expected tags', () => {
      const result = DataHydrationService.getInitialTags();
      
      expect(result).toContain('work');
      expect(result).toContain('personal');
      expect(result).toContain('urgent');
    });
  });

  describe('getInitialTasks', () => {
    test('returns array of tasks', () => {
      const result = DataHydrationService.getInitialTasks();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    test('returned tasks have correct structure', () => {
      const result = DataHydrationService.getInitialTasks();
      
      result.forEach(task => {
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('isCompleted');
        expect(task).toHaveProperty('tags');
        expect(typeof task.id).toBe('number');
        expect(typeof task.title).toBe('string');
        expect(typeof task.isCompleted).toBe('boolean');
        expect(Array.isArray(task.tags)).toBe(true);
      });
    });
  });

  describe('shouldHydrate', () => {
    const originalEnv = import.meta.env.VITE_ENABLE_DATA_HYDRATION;

    afterEach(() => {
      // Reset the environment variable after each test
      import.meta.env.VITE_ENABLE_DATA_HYDRATION = originalEnv;
    });

    test('returns true when VITE_ENABLE_DATA_HYDRATION is "true"', () => {
      import.meta.env.VITE_ENABLE_DATA_HYDRATION = 'true';
      
      const result = DataHydrationService.shouldHydrate();
      
      expect(result).toBe(true);
    });

    test('returns false when VITE_ENABLE_DATA_HYDRATION is "false"', () => {
      import.meta.env.VITE_ENABLE_DATA_HYDRATION = 'false';
      
      const result = DataHydrationService.shouldHydrate();
      
      expect(result).toBe(false);
    });

    test('returns false when VITE_ENABLE_DATA_HYDRATION is undefined', () => {
      delete import.meta.env.VITE_ENABLE_DATA_HYDRATION;
      
      const result = DataHydrationService.shouldHydrate();
      
      expect(result).toBe(false);
    });

    test('returns false when VITE_ENABLE_DATA_HYDRATION is empty string', () => {
      import.meta.env.VITE_ENABLE_DATA_HYDRATION = '';
      
      const result = DataHydrationService.shouldHydrate();
      
      expect(result).toBe(false);
    });

    test('returns false when VITE_ENABLE_DATA_HYDRATION is any other value', () => {
      import.meta.env.VITE_ENABLE_DATA_HYDRATION = 'yes';
      
      const result = DataHydrationService.shouldHydrate();
      
      expect(result).toBe(false);
    });
  });
});
