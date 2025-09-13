/**
 * Settings Panel Component
 */

import { ExtensionSettings } from '@/types';
import { CookieManager } from '@/utils';

export class SettingsPanel {
  private panel: HTMLElement;
  private isVisible = false;

  constructor() {
    this.panel = document.getElementById('settingsPanel')!;
    this.setupEventListeners();
    this.loadSettings();
  }

  private setupEventListeners(): void {
    // Close button
    const closeButton = document.getElementById('closeSettings');
    closeButton?.addEventListener('click', () => this.hide());

    // Theme select
    const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;
    themeSelect?.addEventListener('change', this.handleThemeChange.bind(this));

    // Max history entries
    const maxHistoryInput = document.getElementById('maxHistoryEntries') as HTMLInputElement;
    maxHistoryInput?.addEventListener('change', this.handleMaxHistoryChange.bind(this));

    // Show cookie details checkbox
    const showDetailsCheckbox = document.getElementById('showCookieDetails') as HTMLInputElement;
    showDetailsCheckbox?.addEventListener('change', this.handleShowDetailsChange.bind(this));

    // Auto cleanup checkbox
    const autoCleanupCheckbox = document.getElementById('autoCleanup') as HTMLInputElement;
    autoCleanupCheckbox?.addEventListener('change', this.handleAutoCleanupChange.bind(this));

    // ESC key to close
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });

    // Click outside to close
    this.panel.addEventListener('click', event => {
      if (event.target === this.panel) {
        this.hide();
      }
    });
  }

  private async loadSettings(): Promise<void> {
    try {
      const settings = await CookieManager.getSettings();
      this.updateUI(settings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  private updateUI(settings: ExtensionSettings): void {
    const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;
    if (themeSelect) {
      themeSelect.value = settings.theme;
    }

    const maxHistoryInput = document.getElementById('maxHistoryEntries') as HTMLInputElement;
    if (maxHistoryInput) {
      maxHistoryInput.value = settings.maxHistoryEntries.toString();
    }

    const showDetailsCheckbox = document.getElementById('showCookieDetails') as HTMLInputElement;
    if (showDetailsCheckbox) {
      showDetailsCheckbox.checked = settings.showCookieDetails;
    }

    const autoCleanupCheckbox = document.getElementById('autoCleanup') as HTMLInputElement;
    if (autoCleanupCheckbox) {
      autoCleanupCheckbox.checked = settings.autoCleanup;
    }
  }

  private async handleThemeChange(event: Event): Promise<void> {
    const target = event.target as HTMLSelectElement;
    const theme = target.value as 'light' | 'dark' | 'auto';

    try {
      await CookieManager.updateSettings({ theme });
      this.applyTheme(theme);
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  }

  private async handleMaxHistoryChange(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const maxHistoryEntries = parseInt(target.value, 10);

    if (isNaN(maxHistoryEntries) || maxHistoryEntries < 1) {
      target.value = '10';
      return;
    }

    try {
      await CookieManager.updateSettings({ maxHistoryEntries });
    } catch (error) {
      console.error('Error updating max history entries:', error);
    }
  }

  private async handleShowDetailsChange(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const showCookieDetails = target.checked;

    try {
      await CookieManager.updateSettings({ showCookieDetails });
    } catch (error) {
      console.error('Error updating show cookie details:', error);
    }
  }

  private async handleAutoCleanupChange(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const autoCleanup = target.checked;

    try {
      await CookieManager.updateSettings({ autoCleanup });
    } catch (error) {
      console.error('Error updating auto cleanup:', error);
    }
  }

  private applyTheme(theme: 'light' | 'dark' | 'auto'): void {
    const body = document.body;
    body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
    body.classList.add(`theme-${theme}`);
  }

  show(): void {
    this.isVisible = true;
    this.panel.classList.add('show');
    this.panel.setAttribute('aria-hidden', 'false');

    // Focus management for accessibility
    const firstInput = this.panel.querySelector('select, input') as HTMLElement;
    firstInput?.focus();
  }

  hide(): void {
    this.isVisible = false;
    this.panel.classList.remove('show');
    this.panel.setAttribute('aria-hidden', 'true');
  }

  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
}
