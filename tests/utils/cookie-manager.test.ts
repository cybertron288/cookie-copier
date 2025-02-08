/**
 * Tests for Cookie Manager utilities
 */

import { CookieManager } from '@/utils/cookie-manager';
import { ChromeApiUtils } from '@/utils/chrome-api';
import { CookieData, CookieEntry } from '@/types';

// Mock ChromeApiUtils
jest.mock('@/utils/chrome-api');
const mockChromeApiUtils = ChromeApiUtils as jest.Mocked<typeof ChromeApiUtils>;

describe('CookieManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockChromeApiUtils.getCurrentDomain.mockResolvedValue('example.com');
    mockChromeApiUtils.getCookiesForDomain.mockResolvedValue([
      {
        name: 'session',
        value: 'abc123',
        domain: 'example.com',
        path: '/',
        secure: true,
        httpOnly: false,
      },
    ]);
    mockChromeApiUtils.getStorageData.mockResolvedValue({ cookieHistory: [] });
    mockChromeApiUtils.setStorageData.mockResolvedValue(undefined);
  });

  describe('copyCookiesFromCurrentDomain', () => {
    it('should copy cookies and store them', async () => {
      const result = await CookieManager.copyCookiesFromCurrentDomain();

      expect(result.domain).toBe('example.com');
      expect(result.count).toBe(1);
      expect(mockChromeApiUtils.getCurrentDomain).toHaveBeenCalled();
      expect(mockChromeApiUtils.getCookiesForDomain).toHaveBeenCalledWith('example.com');
      expect(mockChromeApiUtils.setStorageData).toHaveBeenCalled();
    });

    it('should handle empty cookie list', async () => {
      mockChromeApiUtils.getCookiesForDomain.mockResolvedValue([]);

      const result = await CookieManager.copyCookiesFromCurrentDomain();

      expect(result.count).toBe(0);
      expect(result.domain).toBe('example.com');
    });
  });

  describe('storeCookieEntry', () => {
    it('should store new cookie entry', async () => {
      const entry: CookieEntry = {
        domain: 'test.com',
        cookies: [{ name: 'test', value: 'value' }],
        timestamp: Date.now(),
      };

      await CookieManager.storeCookieEntry(entry);

      expect(mockChromeApiUtils.setStorageData).toHaveBeenCalledWith({
        cookieHistory: [entry],
      });
    });

    it('should replace existing entry for same domain', async () => {
      const existingEntries = [
        {
          domain: 'test.com',
          cookies: [{ name: 'old', value: 'old' }],
          timestamp: Date.now() - 1000,
        },
      ];

      mockChromeApiUtils.getStorageData.mockResolvedValue({
        cookieHistory: existingEntries,
      });

      const newEntry: CookieEntry = {
        domain: 'test.com',
        cookies: [{ name: 'new', value: 'new' }],
        timestamp: Date.now(),
      };

      await CookieManager.storeCookieEntry(newEntry);

      const setStorageCall = mockChromeApiUtils.setStorageData.mock.calls[0][0];
      expect(setStorageCall.cookieHistory).toHaveLength(1);
      expect(setStorageCall.cookieHistory[0].cookies[0].name).toBe('new');
    });

    it('should limit history entries based on settings', async () => {
      // Create array with many entries
      const manyEntries = Array.from({ length: 15 }, (_, i) => ({
        domain: `test${i}.com`,
        cookies: [{ name: 'test', value: 'value' }],
        timestamp: Date.now() - i * 1000,
      }));

      mockChromeApiUtils.getStorageData
        .mockResolvedValueOnce({ cookieHistory: manyEntries })
        .mockResolvedValueOnce({ settings: { maxHistoryEntries: 5 } });

      const newEntry: CookieEntry = {
        domain: 'new.com',
        cookies: [{ name: 'new', value: 'new' }],
        timestamp: Date.now(),
      };

      await CookieManager.storeCookieEntry(newEntry);

      const setStorageCall = mockChromeApiUtils.setStorageData.mock.calls[0][0];
      expect(setStorageCall.cookieHistory).toHaveLength(5); // Should be limited to 5
    });
  });

  describe('getCookieHistory', () => {
    it('should return cookie history', async () => {
      const mockHistory = [
        {
          domain: 'example.com',
          cookies: [{ name: 'test', value: 'value' }],
          timestamp: Date.now(),
        },
      ];

      mockChromeApiUtils.getStorageData.mockResolvedValue({
        cookieHistory: mockHistory,
      });

      const history = await CookieManager.getCookieHistory();

      expect(history).toEqual(mockHistory);
      expect(mockChromeApiUtils.getStorageData).toHaveBeenCalledWith(['cookieHistory']);
    });

    it('should return empty array when no history', async () => {
      mockChromeApiUtils.getStorageData.mockResolvedValue({});

      const history = await CookieManager.getCookieHistory();

      expect(history).toEqual([]);
    });
  });

  describe('applyCookieEntry', () => {
    beforeEach(() => {
      const mockHistory = [
        {
          domain: 'source.com',
          cookies: [
            { name: 'cookie1', value: 'value1' },
            { name: 'cookie2', value: 'value2' },
          ],
          timestamp: Date.now(),
        },
      ];

      mockChromeApiUtils.getStorageData.mockResolvedValue({
        cookieHistory: mockHistory,
      });
      mockChromeApiUtils.getCurrentDomain.mockResolvedValue('target.com');
      mockChromeApiUtils.setCookiesForDomain.mockResolvedValue({
        success: 2,
        errors: [],
      });
    });

    it('should apply cookies from selected entry', async () => {
      const result = await CookieManager.applyCookieEntry(0);

      expect(result.domain).toBe('source.com');
      expect(result.targetDomain).toBe('target.com');
      expect(result.results.success).toBe(2);
      expect(result.results.errors).toHaveLength(0);

      expect(mockChromeApiUtils.setCookiesForDomain).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'cookie1' }),
          expect.objectContaining({ name: 'cookie2' }),
        ]),
        'target.com'
      );
    });

    it('should throw error when entry index is invalid', async () => {
      await expect(CookieManager.applyCookieEntry(10)).rejects.toThrow(
        'Selected cookie entry not found'
      );
    });

    it('should handle partial application failures', async () => {
      mockChromeApiUtils.setCookiesForDomain.mockResolvedValue({
        success: 1,
        errors: ['Failed to set cookie: cookie2'],
      });

      const result = await CookieManager.applyCookieEntry(0);

      expect(result.results.success).toBe(1);
      expect(result.results.errors).toHaveLength(1);
    });
  });

  describe('filterCookies', () => {
    const sampleCookies: CookieData[] = [
      {
        name: 'session',
        value: 'abc123',
        domain: 'example.com',
        path: '/',
        secure: true,
        httpOnly: false,
      },
      {
        name: 'theme',
        value: 'dark',
        domain: 'example.com',
        path: '/app',
        secure: false,
        httpOnly: false,
      },
      {
        name: 'auth-token',
        value: 'xyz789',
        domain: 'api.example.com',
        path: '/',
        secure: true,
        httpOnly: true,
      },
    ];

    it('should filter by search term', () => {
      const filter = {
        searchTerm: 'session',
        showSecure: true,
        showHttpOnly: true,
        domainFilter: '',
        pathFilter: '',
      };

      const filtered = CookieManager.filterCookies(sampleCookies, filter);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('session');
    });

    it('should filter out secure cookies when showSecure is false', () => {
      const filter = {
        searchTerm: '',
        showSecure: false,
        showHttpOnly: true,
        domainFilter: '',
        pathFilter: '',
      };

      const filtered = CookieManager.filterCookies(sampleCookies, filter);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('theme');
    });

    it('should filter by domain', () => {
      const filter = {
        searchTerm: '',
        showSecure: true,
        showHttpOnly: true,
        domainFilter: 'api',
        pathFilter: '',
      };

      const filtered = CookieManager.filterCookies(sampleCookies, filter);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].domain).toBe('api.example.com');
    });

    it('should filter by path', () => {
      const filter = {
        searchTerm: '',
        showSecure: true,
        showHttpOnly: true,
        domainFilter: '',
        pathFilter: '/app',
      };

      const filtered = CookieManager.filterCookies(sampleCookies, filter);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].path).toBe('/app');
    });
  });

  describe('exportCookies', () => {
    beforeEach(() => {
      const mockHistory = [
        {
          domain: 'example.com',
          cookies: [
            { name: 'cookie1', value: 'value1', secure: false, httpOnly: false },
            { name: 'cookie2', value: 'value2', secure: true, httpOnly: true },
          ],
          timestamp: Date.now(),
        },
      ];

      mockChromeApiUtils.getStorageData.mockResolvedValue({
        cookieHistory: mockHistory,
      });
    });

    it('should export as JSON format', async () => {
      const options = {
        format: 'json' as const,
        includeSecure: true,
        includeHttpOnly: true,
        selectedDomains: [],
      };

      const exported = await CookieManager.exportCookies(options);

      expect(() => JSON.parse(exported)).not.toThrow();
      const parsed = JSON.parse(exported);
      expect(parsed).toHaveLength(2);
    });

    it('should export as CSV format', async () => {
      const options = {
        format: 'csv' as const,
        includeSecure: true,
        includeHttpOnly: true,
        selectedDomains: [],
      };

      const exported = await CookieManager.exportCookies(options);

      expect(exported).toContain('name,value,domain');
      expect(exported).toContain('cookie1');
      expect(exported).toContain('cookie2');
    });

    it('should filter out secure cookies when includeSecure is false', async () => {
      const options = {
        format: 'json' as const,
        includeSecure: false,
        includeHttpOnly: true,
        selectedDomains: [],
      };

      const exported = await CookieManager.exportCookies(options);
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('cookie1');
    });
  });

  describe('settings management', () => {
    it('should return default settings when none stored', async () => {
      mockChromeApiUtils.getStorageData.mockResolvedValue({});

      const settings = await CookieManager.getSettings();

      expect(settings).toMatchObject({
        theme: 'auto',
        maxHistoryEntries: 10,
        enableEncryption: false,
        showCookieDetails: true,
        autoCleanup: true,
        cleanupDays: 30,
      });
    });

    it('should merge stored settings with defaults', async () => {
      mockChromeApiUtils.getStorageData.mockResolvedValue({
        settings: { theme: 'dark', maxHistoryEntries: 5 },
      });

      const settings = await CookieManager.getSettings();

      expect(settings.theme).toBe('dark');
      expect(settings.maxHistoryEntries).toBe(5);
      expect(settings.showCookieDetails).toBe(true); // Should use default
    });

    it('should update settings', async () => {
      const currentSettings = {
        theme: 'auto' as const,
        maxHistoryEntries: 10,
        enableEncryption: false,
        showCookieDetails: true,
        autoCleanup: true,
        cleanupDays: 30,
      };

      mockChromeApiUtils.getStorageData.mockResolvedValue({
        settings: currentSettings,
      });

      const updatedSettings = await CookieManager.updateSettings({
        theme: 'dark',
        maxHistoryEntries: 15,
      });

      expect(updatedSettings.theme).toBe('dark');
      expect(updatedSettings.maxHistoryEntries).toBe(15);
      expect(mockChromeApiUtils.setStorageData).toHaveBeenCalledWith({
        settings: expect.objectContaining({
          theme: 'dark',
          maxHistoryEntries: 15,
        }),
      });
    });
  });
});