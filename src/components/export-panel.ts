/**
 * Export Panel Component
 */

import { ExportOptions } from '@/types';
import { CookieManager, downloadFile } from '@/utils';

export class ExportPanel {
  private panel: HTMLElement;
  private isVisible = false;

  constructor() {
    this.panel = document.getElementById('exportPanel')!;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Close button
    const closeButton = document.getElementById('closeExport');
    closeButton?.addEventListener('click', () => this.hide());

    // Download button
    const downloadButton = document.getElementById('downloadExport');
    downloadButton?.addEventListener('click', this.handleDownload.bind(this));

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

  private async handleDownload(): Promise<void> {
    try {
      const options = this.getExportOptions();
      const exportData = await CookieManager.exportCookies(options);

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `cookie-copier-export-${timestamp}.${options.format}`;

      let mimeType = 'text/plain';
      switch (options.format) {
        case 'json':
          mimeType = 'application/json';
          break;
        case 'csv':
          mimeType = 'text/csv';
          break;
        case 'netscape':
          mimeType = 'text/plain';
          break;
      }

      downloadFile(exportData, filename, mimeType);

      // Show success feedback
      this.showFeedback('Export downloaded successfully', 'success');
    } catch (error) {
      console.error('Error exporting cookies:', error);
      this.showFeedback('Failed to export cookies', 'error');
    }
  }

  private getExportOptions(): ExportOptions {
    const formatSelect = document.getElementById('exportFormat') as HTMLSelectElement;
    const includeSecureCheckbox = document.getElementById('includeSecure') as HTMLInputElement;
    const includeHttpOnlyCheckbox = document.getElementById('includeHttpOnly') as HTMLInputElement;

    return {
      format: (formatSelect?.value as 'json' | 'csv' | 'netscape') || 'json',
      includeSecure: includeSecureCheckbox?.checked || false,
      includeHttpOnly: includeHttpOnlyCheckbox?.checked || false,
      selectedDomains: [], // Export all domains by default
    };
  }

  private showFeedback(message: string, type: 'success' | 'error'): void {
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.className = `notification notification-${type}`;
    feedback.textContent = message;

    // Insert into panel
    const content = this.panel.querySelector('.settings-content');
    if (content) {
      content.insertBefore(feedback, content.firstChild);

      // Remove after 3 seconds
      setTimeout(() => {
        feedback.remove();
      }, 3000);
    }
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
