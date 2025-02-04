/**
 * Cookie management utilities
 */

import { CookieData, CookieEntry, ExportOptions, ExtensionSettings, FilterOptions } from '@/types';
import { ChromeApiUtils } from './chrome-api';

export class CookieManager {
  private static readonly MAX_HISTORY_ENTRIES = 10;
  private static readonly STORAGE_KEY_HISTORY = 'cookieHistory';
  private static readonly STORAGE_KEY_SETTINGS = 'settings';

  /**
   * Copy cookies from current domain to storage
   */
  static async copyCookiesFromCurrentDomain(): Promise<{ domain: string; count: number }> {
    const domain = await ChromeApiUtils.getCurrentDomain();
    const cookies = await ChromeApiUtils.getCookiesForDomain(domain);

    await this.storeCookieEntry({
      domain,
      cookies,
      timestamp: Date.now(),
    });

    return { domain, count: cookies.length };
  }

  /**
   * Store a cookie entry in history
   */
  static async storeCookieEntry(entry: CookieEntry): Promise<void> {
    const { cookieHistory = [] } = await ChromeApiUtils.getStorageData<{
      cookieHistory: CookieEntry[];
    }>([this.STORAGE_KEY_HISTORY]);

    // Remove existing entry for this domain
    const filteredHistory = cookieHistory.filter(existing => existing.domain !== entry.domain);

    // Add new entry at the beginning
    const updatedHistory = [entry, ...filteredHistory];

    // Keep only the most recent entries
    const settings = await this.getSettings();
    const maxEntries = settings.maxHistoryEntries || this.MAX_HISTORY_ENTRIES;
    const trimmedHistory = updatedHistory.slice(0, maxEntries);

    await ChromeApiUtils.setStorageData({ [this.STORAGE_KEY_HISTORY]: trimmedHistory });
  }

  /**
   * Get cookie history from storage
   */
  static async getCookieHistory(): Promise<CookieEntry[]> {
    const { cookieHistory = [] } = await ChromeApiUtils.getStorageData<{
      cookieHistory: CookieEntry[];
    }>([this.STORAGE_KEY_HISTORY]);
    return cookieHistory;
  }

  /**
   * Apply cookies from a stored entry to current domain
   */
  static async applyCookieEntry(index: number): Promise<{
    domain: string;
    targetDomain: string;
    results: { success: number; errors: string[] };
  }> {
    const history = await this.getCookieHistory();
    const entry = history[index];

    if (!entry) {
      throw new Error('Selected cookie entry not found');
    }

    const targetDomain = await ChromeApiUtils.getCurrentDomain();
    const results = await ChromeApiUtils.setCookiesForDomain(entry.cookies, targetDomain);

    return {
      domain: entry.domain,
      targetDomain,
      results,
    };
  }

  /**
   * Filter cookies based on criteria
   */
  static filterCookies(cookies: CookieData[], filter: FilterOptions): CookieData[] {
    return cookies.filter(cookie => {
      // Search term filter
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const matchesName = cookie.name.toLowerCase().includes(searchLower);
        const matchesValue = cookie.value.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesValue) {
          return false;
        }
      }

      // Security filters
      if (!filter.showSecure && cookie.secure) {
        return false;
      }
      if (!filter.showHttpOnly && cookie.httpOnly) {
        return false;
      }

      // Domain filter
      if (filter.domainFilter && cookie.domain && !cookie.domain.includes(filter.domainFilter)) {
        return false;
      }

      // Path filter
      if (filter.pathFilter && cookie.path && !cookie.path.includes(filter.pathFilter)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Export cookies in various formats
   */
  static async exportCookies(options: ExportOptions): Promise<string> {
    const history = await this.getCookieHistory();
    let allCookies: CookieData[] = [];

    // Collect cookies from selected domains
    for (const entry of history) {
      if (options.selectedDomains.length === 0 || options.selectedDomains.includes(entry.domain)) {
        let cookies = entry.cookies;

        // Apply filters
        if (!options.includeSecure) {
          cookies = cookies.filter(cookie => !cookie.secure);
        }
        if (!options.includeHttpOnly) {
          cookies = cookies.filter(cookie => !cookie.httpOnly);
        }

        allCookies = [...allCookies, ...cookies];
      }
    }

    switch (options.format) {
      case 'json':
        return this.exportAsJson(allCookies);
      case 'csv':
        return this.exportAsCsv(allCookies);
      case 'netscape':
        return this.exportAsNetscape(allCookies);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Get extension settings
   */
  static async getSettings(): Promise<ExtensionSettings> {
    const defaultSettings: ExtensionSettings = {
      theme: 'auto',
      maxHistoryEntries: this.MAX_HISTORY_ENTRIES,
      enableEncryption: false,
      showCookieDetails: true,
      autoCleanup: true,
      cleanupDays: 30,
    };

    const { settings = defaultSettings } = await ChromeApiUtils.getStorageData<{
      settings: ExtensionSettings;
    }>([this.STORAGE_KEY_SETTINGS]);
    return { ...defaultSettings, ...settings };
  }

  /**
   * Update extension settings
   */
  static async updateSettings(newSettings: Partial<ExtensionSettings>): Promise<ExtensionSettings> {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };

    await ChromeApiUtils.setStorageData({ [this.STORAGE_KEY_SETTINGS]: updatedSettings });
    return updatedSettings;
  }

  /**
   * Clear all cookie history
   */
  static async clearHistory(): Promise<void> {
    await ChromeApiUtils.setStorageData({ [this.STORAGE_KEY_HISTORY]: [] });
  }

  /**
   * Delete a specific cookie entry by index
   */
  static async deleteCookieEntry(index: number): Promise<void> {
    const history = await this.getCookieHistory();
    if (index >= 0 && index < history.length) {
      history.splice(index, 1);
      await ChromeApiUtils.setStorageData({ [this.STORAGE_KEY_HISTORY]: history });
    }
  }

  // Private export methods
  private static exportAsJson(cookies: CookieData[]): string {
    return JSON.stringify(cookies, null, 2);
  }

  private static exportAsCsv(cookies: CookieData[]): string {
    const headers = ['name', 'value', 'domain', 'path', 'secure', 'httpOnly', 'expirationDate'];
    const csvRows = [headers.join(',')];

    cookies.forEach(cookie => {
      const row = headers.map(header => {
        const value = cookie[header as keyof CookieData];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  private static exportAsNetscape(cookies: CookieData[]): string {
    let netscape = '# Netscape HTTP Cookie File\n';
    netscape += '# This is a generated file! Do not edit.\n\n';

    cookies.forEach(cookie => {
      const domain = cookie.domain ?? '';
      const isDomainCookie = domain.startsWith('.');
      const path = cookie.path ?? '/';
      const secure = cookie.secure ? 'TRUE' : 'FALSE';
      const expires = cookie.expirationDate ?? 0;

      netscape += `${domain}\t${isDomainCookie ? 'TRUE' : 'FALSE'}\t${path}\t${secure}\t${expires}\t${cookie.name}\t${cookie.value}\n`;
    });

    return netscape;
  }
}
