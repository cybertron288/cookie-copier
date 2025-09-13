/**
 * Chrome API utilities for cookie operations
 */

import { CookieData, CookieError } from '@/types';

export class ChromeApiUtils {
  /**
   * Get current active tab domain
   */
  static async getCurrentDomain(): Promise<string> {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.url) {
        const url = new URL(tabs[0].url);
        return url.hostname;
      }
      throw new CookieError('No active tab found', 'NO_ACTIVE_TAB');
    } catch (error) {
      console.error('Error getting current domain:', error);
      throw new CookieError('Failed to get current domain', 'DOMAIN_ERROR', error);
    }
  }

  /**
   * Get all cookies for a specific domain
   */
  static async getCookiesForDomain(domain: string): Promise<CookieData[]> {
    try {
      const cookies = await chrome.cookies.getAll({ domain });
      return cookies.map(cookie => ({
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        expirationDate: cookie.expirationDate,
        sameSite: cookie.sameSite,
      }));
    } catch (error) {
      console.error('Error getting cookies:', error);
      throw new CookieError(
        `Failed to get cookies for domain: ${domain}`,
        'GET_COOKIES_ERROR',
        error
      );
    }
  }

  /**
   * Set a cookie for the current domain
   */
  static async setCookie(cookie: CookieData, targetDomain: string): Promise<void> {
    try {
      const protocol = cookie.secure ? 'https://' : 'http://';
      const url = `${protocol}${targetDomain}${cookie.path ?? '/'}`;

      const cookieDetails: chrome.cookies.SetDetails = {
        url,
        name: cookie.name,
        value: cookie.value,
        path: cookie.path ?? '/',
        secure: cookie.secure ?? false,
        httpOnly: cookie.httpOnly ?? false,
      };

      if (cookie.expirationDate) {
        cookieDetails.expirationDate = cookie.expirationDate;
      }

      if (cookie.sameSite) {
        cookieDetails.sameSite = cookie.sameSite;
      }

      const result = await chrome.cookies.set(cookieDetails);

      if (!result) {
        throw new CookieError(`Failed to set cookie: ${cookie.name}`, 'SET_COOKIE_ERROR');
      }
    } catch (error) {
      console.error('Error setting cookie:', error);
      throw new CookieError(`Failed to set cookie: ${cookie.name}`, 'SET_COOKIE_ERROR', error);
    }
  }

  /**
   * Set multiple cookies for a domain
   */
  static async setCookiesForDomain(
    cookies: CookieData[],
    targetDomain: string,
  ): Promise<{ success: number; errors: string[] }> {
    const results = { success: 0, errors: [] as string[] };

    for (const cookie of cookies) {
      try {
        await this.setCookie(cookie, targetDomain);
        results.success++;
      } catch (error) {
        const errorMessage =
          error instanceof CookieError ? error.message : `Failed to set cookie: ${cookie.name}`;
        results.errors.push(errorMessage);
      }
    }

    return results;
  }

  /**
   * Get storage data with type safety
   */
  static async getStorageData<T = any>(keys: string | string[]): Promise<T> {
    try {
      const result = await chrome.storage.local.get(keys);
      return result as T;
    } catch (error) {
      console.error('Error getting storage data:', error);
      throw new CookieError('Failed to get storage data', 'STORAGE_ERROR', error);
    }
  }

  /**
   * Set storage data
   */
  static async setStorageData(data: { [key: string]: any }): Promise<void> {
    try {
      await chrome.storage.local.set(data);
    } catch (error) {
      console.error('Error setting storage data:', error);
      throw new CookieError('Failed to set storage data', 'STORAGE_ERROR', error);
    }
  }

  /**
   * Clear all storage data
   */
  static async clearStorageData(): Promise<void> {
    try {
      await chrome.storage.local.clear();
    } catch (error) {
      console.error('Error clearing storage data:', error);
      throw new CookieError('Failed to clear storage data', 'STORAGE_ERROR', error);
    }
  }
}
