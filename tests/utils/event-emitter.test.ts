/**
 * Tests for Event Emitter utility
 */

import { SimpleEventEmitter } from '@/utils/event-emitter';

describe('SimpleEventEmitter', () => {
  let emitter: SimpleEventEmitter;

  beforeEach(() => {
    emitter = new SimpleEventEmitter();
  });

  describe('on', () => {
    it('should add event listener', () => {
      const callback = jest.fn();
      
      emitter.on('test-event', callback);
      
      expect(emitter.getListenerCount('test-event')).toBe(1);
    });

    it('should add multiple listeners for same event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      emitter.on('test-event', callback1);
      emitter.on('test-event', callback2);
      
      expect(emitter.getListenerCount('test-event')).toBe(2);
    });

    it('should handle multiple different events', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      emitter.on('event1', callback1);
      emitter.on('event2', callback2);
      
      expect(emitter.getListenerCount('event1')).toBe(1);
      expect(emitter.getListenerCount('event2')).toBe(1);
    });
  });

  describe('emit', () => {
    it('should call registered listeners', () => {
      const callback = jest.fn();
      
      emitter.on('test-event', callback);
      emitter.emit('test-event', 'test-data');
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('test-data');
    });

    it('should call multiple listeners for same event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      emitter.on('test-event', callback1);
      emitter.on('test-event', callback2);
      emitter.emit('test-event', 'test-data');
      
      expect(callback1).toHaveBeenCalledWith('test-data');
      expect(callback2).toHaveBeenCalledWith('test-data');
    });

    it('should not call listeners for different events', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      emitter.on('event1', callback1);
      emitter.on('event2', callback2);
      emitter.emit('event1', 'data');
      
      expect(callback1).toHaveBeenCalledWith('data');
      expect(callback2).not.toHaveBeenCalled();
    });

    it('should handle events with no listeners', () => {
      expect(() => {
        emitter.emit('non-existent-event', 'data');
      }).not.toThrow();
    });

    it('should continue calling listeners even if one throws error', () => {
      const callback1 = jest.fn(() => {
        throw new Error('Test error');
      });
      const callback2 = jest.fn();
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      emitter.on('test-event', callback1);
      emitter.on('test-event', callback2);
      emitter.emit('test-event', 'data');
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith('data');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in event callback'),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('off', () => {
    it('should remove specific listener', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      emitter.on('test-event', callback1);
      emitter.on('test-event', callback2);
      emitter.off('test-event', callback1);
      
      expect(emitter.getListenerCount('test-event')).toBe(1);
      
      emitter.emit('test-event', 'data');
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith('data');
    });

    it('should handle removing non-existent listener', () => {
      const callback = jest.fn();
      
      expect(() => {
        emitter.off('test-event', callback);
      }).not.toThrow();
      
      expect(emitter.getListenerCount('test-event')).toBe(0);
    });

    it('should handle removing from non-existent event', () => {
      const callback = jest.fn();
      
      expect(() => {
        emitter.off('non-existent', callback);
      }).not.toThrow();
    });
  });

  describe('removeAllListeners', () => {
    beforeEach(() => {
      emitter.on('event1', jest.fn());
      emitter.on('event1', jest.fn());
      emitter.on('event2', jest.fn());
    });

    it('should remove all listeners for specific event', () => {
      emitter.removeAllListeners('event1');
      
      expect(emitter.getListenerCount('event1')).toBe(0);
      expect(emitter.getListenerCount('event2')).toBe(1);
    });

    it('should remove all listeners for all events when no event specified', () => {
      emitter.removeAllListeners();
      
      expect(emitter.getListenerCount('event1')).toBe(0);
      expect(emitter.getListenerCount('event2')).toBe(0);
    });
  });

  describe('getListenerCount', () => {
    it('should return correct listener count', () => {
      expect(emitter.getListenerCount('test-event')).toBe(0);
      
      emitter.on('test-event', jest.fn());
      expect(emitter.getListenerCount('test-event')).toBe(1);
      
      emitter.on('test-event', jest.fn());
      expect(emitter.getListenerCount('test-event')).toBe(2);
    });

    it('should return 0 for non-existent events', () => {
      expect(emitter.getListenerCount('non-existent')).toBe(0);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex event flow', () => {
      const callbacks = {
        start: jest.fn(),
        progress: jest.fn(),
        complete: jest.fn(),
        error: jest.fn(),
      };

      // Set up listeners
      emitter.on('start', callbacks.start);
      emitter.on('progress', callbacks.progress);
      emitter.on('complete', callbacks.complete);
      emitter.on('error', callbacks.error);

      // Simulate event flow
      emitter.emit('start', { task: 'processing' });
      emitter.emit('progress', { percent: 50 });
      emitter.emit('progress', { percent: 100 });
      emitter.emit('complete', { result: 'success' });

      expect(callbacks.start).toHaveBeenCalledTimes(1);
      expect(callbacks.progress).toHaveBeenCalledTimes(2);
      expect(callbacks.complete).toHaveBeenCalledTimes(1);
      expect(callbacks.error).not.toHaveBeenCalled();

      expect(callbacks.start).toHaveBeenCalledWith({ task: 'processing' });
      expect(callbacks.progress).toHaveBeenLastCalledWith({ percent: 100 });
      expect(callbacks.complete).toHaveBeenCalledWith({ result: 'success' });
    });

    it('should handle cleanup properly', () => {
      const callback = jest.fn();
      
      emitter.on('test', callback);
      emitter.emit('test', 'data1');
      
      emitter.off('test', callback);
      emitter.emit('test', 'data2');
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('data1');
    });
  });
});