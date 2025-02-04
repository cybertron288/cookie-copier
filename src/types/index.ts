/**
 * Type definitions for Cookie Copier Extension
 */

export interface CookieData {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  expirationDate?: number;
  sameSite?: chrome.cookies.SameSiteStatus;
  url?: string;
}

export interface CookieEntry {
  domain: string;
  cookies: CookieData[];
  timestamp?: number;
  encrypted?: boolean;
}

export interface StorageData {
  cookieHistory: CookieEntry[];
  settings: ExtensionSettings;
}

export interface ExtensionSettings {
  theme: 'light' | 'dark' | 'auto';
  maxHistoryEntries: number;
  enableEncryption: boolean;
  showCookieDetails: boolean;
  autoCleanup: boolean;
  cleanupDays: number;
}

export interface FilterOptions {
  searchTerm: string;
  showSecure: boolean;
  showHttpOnly: boolean;
  domainFilter: string;
  pathFilter: string;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'netscape';
  includeSecure: boolean;
  includeHttpOnly: boolean;
  selectedDomains: string[];
}

export interface UIState {
  isLoading: boolean;
  currentDomain: string;
  selectedCookieSet: number | null;
  showSettings: boolean;
  showExport: boolean;
  notification: {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
  };
}

// Chrome extension specific types
export interface ChromeTab {
  id?: number;
  url?: string;
  title?: string;
  active?: boolean;
  windowId?: number;
}

export interface ChromeStorageResult {
  [key: string]: any;
}

// Error types
export class CookieError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'CookieError';
  }
}

export type EventCallback<T = any> = (data: T) => void;

export interface EventEmitter {
  on(event: string, callback: EventCallback): void;
  off(event: string, callback: EventCallback): void;
  emit(event: string, data?: any): void;
}
