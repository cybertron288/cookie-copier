/**
 * Background Script for Cookie Copier Extension
 * Handles extension lifecycle, storage, and Chrome API interactions
 */

import { CookieEntry, ExtensionSettings } from '@/types';

class BackgroundService {
  private defaultSettings: ExtensionSettings = {
    theme: 'auto',
    maxHistoryEntries: 10,
    enableEncryption: false,
    showCookieDetails: true,
    autoCleanup: true,
    cleanupDays: 30,
  };

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // Initialize extension settings on install
    chrome.runtime.onInstalled.addListener(this.handleInstalled.bind(this));

    // Handle extension startup
    chrome.runtime.onStartup.addListener(this.handleStartup.bind(this));

    // Set up periodic cleanup
    this.setupPeriodicCleanup();
  }

  private async handleInstalled(details: chrome.runtime.InstalledDetails): Promise<void> {
    if (details.reason === 'install') {
      // Initialize default settings
      await chrome.storage.local.set({
        settings: this.defaultSettings,
        cookieHistory: [],
      });

      console.log('Cookie Copier extension installed successfully');
    } else if (details.reason === 'update') {
      // Handle extension update
      await this.handleUpdate(details.previousVersion);
    }
  }

  private async handleStartup(): Promise<void> {
    console.log('Cookie Copier extension started');

    // Perform any startup cleanup or maintenance
    await this.cleanupExpiredEntries();
  }

  private async handleUpdate(previousVersion?: string): Promise<void> {
    console.log(
      `Cookie Copier updated from ${previousVersion} to ${chrome.runtime.getManifest().version}`,
    );

    // Handle migration logic if needed
    const result = await chrome.storage.local.get(['settings']);
    const currentSettings = { ...this.defaultSettings, ...result.settings };

    await chrome.storage.local.set({ settings: currentSettings });
  }

  private setupPeriodicCleanup(): void {
    // Clean up expired entries every 24 hours
    setInterval(
      async () => {
        await this.cleanupExpiredEntries();
      },
      24 * 60 * 60 * 1000
    );
  }

  private async cleanupExpiredEntries(): Promise<void> {
    const result = await chrome.storage.local.get(['cookieHistory', 'settings']);
    const settings: ExtensionSettings = result.settings || this.defaultSettings;

    if (!settings.autoCleanup) {return;}

    const history: CookieEntry[] = result.cookieHistory || [];
    const now = Date.now();
    const maxAge = settings.cleanupDays * 24 * 60 * 60 * 1000;

    const filteredHistory = history.filter(entry => {
      const entryAge = now - (entry.timestamp || 0);
      return entryAge < maxAge;
    });

    if (filteredHistory.length !== history.length) {
      await chrome.storage.local.set({ cookieHistory: filteredHistory });
      console.log(`Cleaned up ${history.length - filteredHistory.length} expired cookie entries`);
    }
  }
}

// Initialize background service
new BackgroundService();
