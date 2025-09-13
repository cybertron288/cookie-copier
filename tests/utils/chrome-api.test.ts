/**
 * Tests for Chrome API utilities
 */

import { ChromeApiUtils } from '@/utils/chrome-api';
import { CookieError } from '@/types';

describe('ChromeApiUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentDomain', () => {
    it('should return domain from active tab URL', async () => {
      const mockTabs = [{ 
        id: 1, 
        url: 'https://example.com/path', 
        active: true 
      }];
      
      (chrome.tabs.query as jest.Mock).mockImplementation((queryInfo, callback) => {
        callback(mockTabs);
      });

      const domain = await ChromeApiUtils.getCurrentDomain();
      
      expect(domain).toBe('example.com');
      expect(chrome.tabs.query).toHaveBeenCalledWith(
        { active: true, currentWindow: true },
        expect.any(Function)
      );
    });

    it('should throw CookieError when no active tab found', async () => {
      (chrome.tabs.query as jest.Mock).mockImplementation((queryInfo, callback) => {
        callback([]);
      });

      await expect(ChromeApiUtils.getCurrentDomain()).rejects.toThrow(CookieError);
      await expect(ChromeApiUtils.getCurrentDomain()).rejects.toThrow('No active tab found');
    });

    it('should throw CookieError when tab has no URL', async () => {
      const mockTabs = [{ id: 1, active: true }]; // No URL
      
      (chrome.tabs.query as jest.Mock).mockImplementation((queryInfo, callback) => {
        callback(mockTabs);
      });

      await expect(ChromeApiUtils.getCurrentDomain()).rejects.toThrow(CookieError);
    });
  });

  describe('getCookiesForDomain', () => {
    it('should return formatted cookies for domain', async () => {
      const mockCookies = [
        {
          name: 'session',
          value: 'abc123',
          domain: 'example.com',
          path: '/',
          secure: true,
          httpOnly: false,
          expirationDate: 1234567890,
          sameSite: 'lax',
        },
      ];

      (chrome.cookies.getAll as jest.Mock).mockImplementation((details, callback) => {
        callback(mockCookies);
      });

      const cookies = await ChromeApiUtils.getCookiesForDomain('example.com');

      expect(cookies).toHaveLength(1);
      expect(cookies[0]).toBeValidCookieData();
      expect(cookies[0].name).toBe('session');
      expect(cookies[0].domain).toBe('example.com');
    });

    it('should handle empty cookie list', async () => {
      (chrome.cookies.getAll as jest.Mock).mockImplementation((details, callback) => {
        callback([]);
      });

      const cookies = await ChromeApiUtils.getCookiesForDomain('example.com');

      expect(cookies).toHaveLength(0);
    });

    it('should throw CookieError on API failure', async () => {
      (chrome.cookies.getAll as jest.Mock).mockImplementation((details, callback) => {
        throw new Error('API Error');
      });

      await expect(ChromeApiUtils.getCookiesForDomain('example.com')).rejects.toThrow(CookieError);
    });
  });

  describe('setCookie', () => {
    it('should set cookie with correct parameters', async () => {
      const mockCookie = {
        name: 'test',
        value: 'value',
        domain: 'example.com',
        path: '/test',
        secure: true,
        httpOnly: true,
        expirationDate: 1234567890,
      };

      (chrome.cookies.set as jest.Mock).mockImplementation((details, callback) => {
        callback({ name: details.name });
      });

      await ChromeApiUtils.setCookie(mockCookie, 'example.com');

      expect(chrome.cookies.set).toHaveBeenCalledWith({
        url: 'https://example.com/test',
        name: 'test',
        value: 'value',
        path: '/test',
        secure: true,
        httpOnly: true,
        expirationDate: 1234567890,
      }, expect.any(Function));
    });

    it('should use HTTP for non-secure cookies', async () => {
      const mockCookie = {
        name: 'test',
        value: 'value',
        secure: false,
      };

      (chrome.cookies.set as jest.Mock).mockImplementation((details, callback) => {
        callback({ name: details.name });
      });

      await ChromeApiUtils.setCookie(mockCookie, 'example.com');

      const expectedCall = (chrome.cookies.set as jest.Mock).mock.calls[0][0];
      expect(expectedCall.url).toBe('http://example.com/');
    });

    it('should throw CookieError when cookie set fails', async () => {
      const mockCookie = {
        name: 'test',
        value: 'value',
      };

      (chrome.cookies.set as jest.Mock).mockImplementation((details, callback) => {
        callback(null); // Indicates failure
      });

      await expect(ChromeApiUtils.setCookie(mockCookie, 'example.com')).rejects.toThrow(CookieError);
    });
  });

  describe('setCookiesForDomain', () => {
    it('should set multiple cookies and return success count', async () => {
      const mockCookies = [
        { name: 'cookie1', value: 'value1' },
        { name: 'cookie2', value: 'value2' },
        { name: 'cookie3', value: 'value3' },
      ];

      (chrome.cookies.set as jest.Mock).mockImplementation((details, callback) => {
        callback({ name: details.name });
      });

      const result = await ChromeApiUtils.setCookiesForDomain(mockCookies, 'example.com');

      expect(result.success).toBe(3);
      expect(result.errors).toHaveLength(0);
      expect(chrome.cookies.set).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures', async () => {
      const mockCookies = [
        { name: 'cookie1', value: 'value1' },
        { name: 'cookie2', value: 'value2' },
        { name: 'cookie3', value: 'value3' },
      ];

      (chrome.cookies.set as jest.Mock)
        .mockImplementationOnce((details, callback) => callback({ name: details.name }))
        .mockImplementationOnce((details, callback) => callback(null)) // Failure
        .mockImplementationOnce((details, callback) => callback({ name: details.name }));

      const result = await ChromeApiUtils.setCookiesForDomain(mockCookies, 'example.com');

      expect(result.success).toBe(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to set cookie: cookie2');
    });
  });

  describe('getStorageData', () => {
    it('should retrieve storage data by key', async () => {
      const mockData = { testKey: 'testValue' };
      
      (chrome.storage.local.get as jest.Mock).mockImplementation((keys, callback) => {
        callback(mockData);
      });

      const result = await ChromeApiUtils.getStorageData('testKey');

      expect(result).toEqual(mockData);
      expect(chrome.storage.local.get).toHaveBeenCalledWith('testKey');
    });

    it('should retrieve multiple storage keys', async () => {
      const mockData = { key1: 'value1', key2: 'value2' };
      
      (chrome.storage.local.get as jest.Mock).mockImplementation((keys, callback) => {
        callback(mockData);
      });

      const result = await ChromeApiUtils.getStorageData(['key1', 'key2']);

      expect(result).toEqual(mockData);
      expect(chrome.storage.local.get).toHaveBeenCalledWith(['key1', 'key2']);
    });
  });

  describe('setStorageData', () => {
    it('should set storage data', async () => {
      const testData = { testKey: 'testValue' };

      await ChromeApiUtils.setStorageData(testData);

      expect(chrome.storage.local.set).toHaveBeenCalledWith(testData);
    });
  });

  describe('clearStorageData', () => {
    it('should clear all storage data', async () => {
      await ChromeApiUtils.clearStorageData();

      expect(chrome.storage.local.clear).toHaveBeenCalled();
    });
  });
});