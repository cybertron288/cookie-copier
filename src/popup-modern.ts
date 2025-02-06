/**
 * Modern Minimal Popup Controller
 */

import { CookieEntry, UIState } from '@/types';
import { ChromeApiUtils, CookieManager, SimpleEventEmitter, debounce } from '@/utils';
import '@/styles/modern.css';

class ModernPopupController {
  private state: UIState = {
    isLoading: false,
    currentDomain: '',
    selectedCookieSet: null,
    showSettings: false,
    showExport: false,
    notification: {
      message: '',
      type: 'info',
      visible: false,
    },
  };

  private cookieHistory: CookieEntry[] = [];
  private eventEmitter = new SimpleEventEmitter();

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    this.initializeTheme();
    await this.loadCurrentDomain();
    await this.loadCookieHistory();
    this.setupEventListeners();
    this.initializeAccessibility();
    this.addPageTransitions();
  }

  private initializeTheme(): void {
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  private addPageTransitions(): void {
    // Add subtle fade-in animation to main elements
    const elements = document.querySelectorAll('.animate-fade-in');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('opacity-100');
      }, index * 50);
    });
  }

  private initializeAccessibility(): void {
    const exportModal = document.getElementById('exportModal');
    if (exportModal) {
      exportModal.setAttribute('aria-hidden', 'true');
    }
  }

  private async loadCurrentDomain(): Promise<void> {
    try {
      const domain = await ChromeApiUtils.getCurrentDomain();
      this.state.currentDomain = domain;
      
      const domainElement = document.getElementById('currentDomain');
      if (domainElement) {
        domainElement.textContent = domain;
      }

      // Load and display cookie count for current domain
      const cookies = await ChromeApiUtils.getCookiesForDomain(domain);
      const cookieCount = document.getElementById('cookieCount');
      if (cookieCount) {
        cookieCount.textContent = `${cookies.length} cookies`;
      }
    } catch (error) {
      this.showToast('Failed to get current domain', 'error');
    }
  }

  private async loadCookieHistory(): Promise<void> {
    try {
      const history = await CookieManager.getCookieHistory();
      this.cookieHistory = history;
      this.renderCookieHistory();
    } catch (error) {
      this.showToast('Failed to load history', 'error');
    }
  }

  private setupEventListeners(): void {
    // Primary actions
    document.getElementById('copyButton')?.addEventListener('click', () => this.copyCookies());
    document.getElementById('applyButton')?.addEventListener('click', () => this.applySelectedCookies());
    
    // Search
    document.getElementById('searchToggle')?.addEventListener('click', () => this.toggleSearch());
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    if (searchInput) {
      const debouncedSearch = debounce(() => this.handleSearch(searchInput.value), 300);
      searchInput.addEventListener('input', debouncedSearch);
      
      // Clear search on ESC
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchInput.value = '';
          this.handleSearch('');
          this.toggleSearch();
        }
      });
    }
    
    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());
    
    // Menu
    document.getElementById('menuButton')?.addEventListener('click', () => this.toggleMenu());
    
    // Click outside to close menu
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('settingsMenu');
      const menuButton = document.getElementById('menuButton');
      if (menu && !menu.contains(e.target as Node) && e.target !== menuButton) {
        menu.classList.add('hidden');
      }
    });
    
    // Export/Import
    document.getElementById('exportButton')?.addEventListener('click', () => this.showExportModal());
    document.getElementById('importButton')?.addEventListener('click', () => this.handleImport());
    document.getElementById('closeExport')?.addEventListener('click', () => this.hideExportModal());
    document.getElementById('downloadExport')?.addEventListener('click', () => this.downloadExport());
    
    // Clear all
    document.getElementById('clearAllButton')?.addEventListener('click', () => this.clearAllHistory());
    
    // Close modals on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideExportModal();
        const menu = document.getElementById('settingsMenu');
        if (menu) menu.classList.add('hidden');
      }
    });
  }

  private async copyCookies(): Promise<void> {
    const button = document.getElementById('copyButton');
    if (button) {
      button.classList.add('animate-pulse');
    }

    try {
      const cookies = await ChromeApiUtils.getCookiesForDomain(this.state.currentDomain);
      
      if (cookies.length === 0) {
        this.showToast('No cookies found', 'warning');
        return;
      }

      const entry: CookieEntry = {
        domain: this.state.currentDomain,
        cookies,
        timestamp: Date.now(),
      };

      await CookieManager.storeCookieEntry(entry);
      await this.loadCookieHistory();
      
      this.showToast(`Copied ${cookies.length} cookies`, 'success');
    } catch (error) {
      this.showToast('Failed to copy cookies', 'error');
    } finally {
      if (button) {
        button.classList.remove('animate-pulse');
      }
    }
  }

  private async applySelectedCookies(): Promise<void> {
    if (this.state.selectedCookieSet === null) {
      this.showToast('Select cookies to apply', 'warning');
      return;
    }

    const button = document.getElementById('applyButton');
    if (button) {
      button.classList.add('animate-pulse');
    }

    try {
      const entry = this.cookieHistory[this.state.selectedCookieSet];
      if (!entry) {
        throw new Error('Selected cookie set not found');
      }

      const results = await ChromeApiUtils.setCookiesForDomain(
        entry.cookies,
        this.state.currentDomain
      );

      if (results.errors.length > 0) {
        this.showToast(`Applied ${results.success} cookies with ${results.errors.length} errors`, 'warning');
      } else {
        this.showToast(`Applied ${results.success} cookies`, 'success');
      }
    } catch (error) {
      this.showToast('Failed to apply cookies', 'error');
    } finally {
      if (button) {
        button.classList.remove('animate-pulse');
      }
    }
  }

  private renderCookieHistory(): void {
    const historyList = document.getElementById('historyList');
    const emptyState = document.getElementById('emptyState');
    const applyButton = document.getElementById('applyButton') as HTMLButtonElement;

    if (!historyList) return;

    if (this.cookieHistory.length === 0) {
      historyList.classList.add('hidden');
      emptyState?.classList.remove('hidden');
      if (applyButton) applyButton.disabled = true;
      return;
    }

    historyList.classList.remove('hidden');
    emptyState?.classList.add('hidden');

    historyList.innerHTML = this.cookieHistory.map((entry, index) => {
      const timeAgo = this.getTimeAgo(entry.timestamp || Date.now());
      const isSelected = this.state.selectedCookieSet === index;
      
      return `
        <div class="cookie-card ${isSelected ? 'selected' : ''}" data-index="${index}">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-sm font-medium truncate">${entry.domain}</h3>
                ${entry.encrypted ? '<span class="text-xs px-1.5 py-0.5 bg-accent/10 text-accent rounded">🔐</span>' : ''}
              </div>
              <div class="flex items-center gap-3 text-xs text-muted-foreground">
                <span>${entry.cookies.length} cookies</span>
                <span>•</span>
                <span>${timeAgo}</span>
              </div>
            </div>
            <button class="delete-btn p-1.5 rounded-lg hover:bg-destructive/10 transition-colors duration-200 group" data-index="${index}">
              <svg class="w-3.5 h-3.5 text-muted-foreground group-hover:text-destructive transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Add event listeners
    historyList.querySelectorAll('.cookie-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.delete-btn')) {
          const index = parseInt(card.getAttribute('data-index') || '0');
          this.selectCookieSet(index);
        }
      });
    });

    historyList.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute('data-index') || '0');
        await this.deleteCookieEntry(index);
      });
    });
  }

  private selectCookieSet(index: number): void {
    this.state.selectedCookieSet = index;
    const applyButton = document.getElementById('applyButton') as HTMLButtonElement;
    if (applyButton) {
      applyButton.disabled = false;
      applyButton.classList.remove('bg-muted');
      applyButton.classList.add('bg-secondary');
    }
    this.renderCookieHistory();
  }

  private async deleteCookieEntry(index: number): Promise<void> {
    try {
      await CookieManager.deleteCookieEntry(index);
      await this.loadCookieHistory();
      
      if (this.state.selectedCookieSet === index) {
        this.state.selectedCookieSet = null;
        const applyButton = document.getElementById('applyButton') as HTMLButtonElement;
        if (applyButton) {
          applyButton.disabled = true;
          applyButton.classList.add('bg-muted');
          applyButton.classList.remove('bg-secondary');
        }
      }
      
      this.showToast('Entry deleted', 'success');
    } catch (error) {
      this.showToast('Failed to delete', 'error');
    }
  }

  private async clearAllHistory(): Promise<void> {
    if (!confirm('Delete all saved cookies?')) return;
    
    try {
      await CookieManager.clearHistory();
      await this.loadCookieHistory();
      this.showToast('History cleared', 'success');
    } catch (error) {
      this.showToast('Failed to clear history', 'error');
    }
  }

  private toggleSearch(): void {
    const container = document.getElementById('searchContainer');
    const input = document.getElementById('searchInput') as HTMLInputElement;
    
    if (container) {
      container.classList.toggle('hidden');
      if (!container.classList.contains('hidden')) {
        input?.focus();
      } else {
        input.value = '';
        this.handleSearch('');
      }
    }
  }

  private handleSearch(query: string): void {
    if (!query) {
      this.renderCookieHistory();
      return;
    }

    const filtered = this.cookieHistory.filter(entry => 
      entry.domain.toLowerCase().includes(query.toLowerCase()) ||
      entry.cookies.some(cookie => 
        cookie.name.toLowerCase().includes(query.toLowerCase())
      )
    );

    const temp = this.cookieHistory;
    this.cookieHistory = filtered;
    this.renderCookieHistory();
    this.cookieHistory = temp;
  }

  private toggleTheme(): void {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    
    // Add rotation animation to theme button
    const button = document.getElementById('themeToggle');
    if (button) {
      button.style.transform = 'rotate(180deg)';
      setTimeout(() => {
        button.style.transform = '';
      }, 200);
    }
  }

  private toggleMenu(): void {
    const menu = document.getElementById('settingsMenu');
    if (menu) {
      menu.classList.toggle('hidden');
    }
  }

  private showExportModal(): void {
    const modal = document.getElementById('exportModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.removeAttribute('aria-hidden');
      
      // Focus first input
      const firstInput = modal.querySelector('select, input');
      if (firstInput instanceof HTMLElement) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }

  private hideExportModal(): void {
    const modal = document.getElementById('exportModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  private async downloadExport(): Promise<void> {
    const formatSelect = document.getElementById('exportFormat') as HTMLSelectElement;
    const format = formatSelect?.value || 'json';
    
    try {
      const content = await CookieManager.exportCookies({
        format: format as 'json' | 'csv' | 'netscape',
        includeSecure: (document.getElementById('includeSecure') as HTMLInputElement)?.checked ?? true,
        includeHttpOnly: (document.getElementById('includeHttpOnly') as HTMLInputElement)?.checked ?? true,
        selectedDomains: [],
      });

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cookies-${Date.now()}.${format === 'csv' ? 'csv' : format === 'netscape' ? 'txt' : 'json'}`;
      a.click();
      URL.revokeObjectURL(url);

      this.showToast('Export downloaded', 'success');
      this.hideExportModal();
    } catch (error) {
      this.showToast('Export failed', 'error');
    }
  }

  private handleImport(): void {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // TODO: Implement import functionality
        this.showToast('Import coming soon', 'info');
      }
    };
    input.click();
  }

  private showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `
      min-w-[200px] max-w-[300px] px-4 py-3 rounded-lg shadow-lg 
      bg-card border border-border pointer-events-auto
      animate-slide-in flex items-center gap-3
    `;

    const icon = this.getToastIcon(type);
    const colorClass = this.getToastColorClass(type);

    toast.innerHTML = `
      <div class="${colorClass}">${icon}</div>
      <p class="text-sm">${message}</p>
    `;

    container.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);

    // Also update status bar
    const status = document.getElementById('status');
    if (status) {
      status.textContent = message;
      setTimeout(() => {
        status.textContent = 'Ready';
      }, 3000);
    }
  }

  private getToastIcon(type: string): string {
    const icons: Record<string, string> = {
      success: '✓',
      error: '✕',
      warning: '!',
      info: 'i',
    };
    return icons[type] || icons.info;
  }

  private getToastColorClass(type: string): string {
    const colors: Record<string, string> = {
      success: 'text-success',
      error: 'text-destructive',
      warning: 'text-warning',
      info: 'text-primary',
    };
    return colors[type] || colors.info;
  }

  private getTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ModernPopupController();
});