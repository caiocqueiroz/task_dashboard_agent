import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { DataHydrationService } from './DataHydrationService';

describe('DataHydrationService', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = import.meta.env.VITE_ENABLE_DATA_HYDRATION;
  });

  afterEach(() => {
    // Restore original environment
    import.meta.env.VITE_ENABLE_DATA_HYDRATION = originalEnv;
  });

  describe('getInitialTaskLists', () => {
    test('returns an array of task lists', () => {
      const lists = DataHydrationService.getInitialTaskLists();
      expect(Array.isArray(lists)).toBe(true);
      expect(lists.length).toBeGreaterThan(0);
    });

    test('task lists have required properties', () => {
      const lists = DataHydrationService.getInitialTaskLists();
      lists.forEach(list => {
        expect(list).toHaveProperty('id');
        expect(list).toHaveProperty('title');
        expect(list).toHaveProperty('filters');
        expect(typeof list.id).toBe('string');
        expect(typeof list.title).toBe('string');
        expect(Array.isArray(list.filters)).toBe(true);
      });
    });

    test('includes default "All Tasks" list', () => {
      const lists = DataHydrationService.getInitialTaskLists();
      const defaultList = lists.find(list => list.id === 'default');
      expect(defaultList).toBeDefined();
      expect(defaultList.title).toBe('All Tasks');
    });
  });

  describe('getInitialTags', () => {
    test('returns an array of tags', () => {
      const tags = DataHydrationService.getInitialTags();
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThan(0);
    });

    test('tags are strings', () => {
      const tags = DataHydrationService.getInitialTags();
      tags.forEach(tag => {
        expect(typeof tag).toBe('string');
        expect(tag.length).toBeGreaterThan(0);
      });
    });

    test('tags are unique', () => {
      const tags = DataHydrationService.getInitialTags();
      const uniqueTags = [...new Set(tags)];
      expect(tags.length).toBe(uniqueTags.length);
    });
  });

  describe('getInitialTasks', () => {
    test('returns an array of tasks', () => {
      const tasks = DataHydrationService.getInitialTasks();
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThan(0);
    });

    test('tasks have required properties', () => {
      const tasks = DataHydrationService.getInitialTasks();
      tasks.forEach(task => {
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

    test('tasks have description property', () => {
      const tasks = DataHydrationService.getInitialTasks();
      tasks.forEach(task => {
        expect(task).toHaveProperty('description');
        expect(typeof task.description).toBe('string');
      });
    });
  });

  describe('shouldHydrate', () => {
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

    test('returns false when VITE_ENABLE_DATA_HYDRATION is any other string', () => {
      import.meta.env.VITE_ENABLE_DATA_HYDRATION = 'yes';
      const result = DataHydrationService.shouldHydrate();
      expect(result).toBe(false);
    });
  });
});
