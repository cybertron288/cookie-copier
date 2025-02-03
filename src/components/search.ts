/**
 * Search Component
 */

import { CookieEntry, FilterOptions } from '@/types';
import { debounce } from '@/utils';

export class SearchComponent {
  private container: HTMLElement;
  private input: HTMLInputElement;
  private isVisible = false;
  private onFilterChange: (entries: CookieEntry[]) => void;
  private allEntries: CookieEntry[] = [];

  constructor(onFilterChange: (entries: CookieEntry[]) => void) {
    this.container = document.getElementById('searchContainer')!;
    this.input = document.getElementById('searchInput') as HTMLInputElement;
    this.onFilterChange = onFilterChange;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Debounced search
    const debouncedSearch = debounce(this.handleSearch.bind(this), 300);
    this.input.addEventListener('input', debouncedSearch);

    // Clear search on ESC
    this.input.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        this.clearSearch();
      }
    });

    // Toggle button
    const toggleButton = document.getElementById('searchToggle');
    toggleButton?.addEventListener('click', () => this.toggle());
  }

  private async handleSearch(): Promise<void> {
    const searchTerm = this.input.value.trim();

    if (!searchTerm) {
      // No search term, show all entries
      this.onFilterChange(this.allEntries);
      return;
    }

    try {
      const filtered = this.filterEntries(this.allEntries, {
        searchTerm,
        showSecure: true,
        showHttpOnly: true,
        domainFilter: '',
        pathFilter: '',
      });

      this.onFilterChange(filtered);
    } catch (error) {
      console.error('Error filtering entries:', error);
    }
  }

  private filterEntries(entries: CookieEntry[], filter: FilterOptions): CookieEntry[] {
    return entries.filter(entry => {
      // Check domain name
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const domainMatches = entry.domain.toLowerCase().includes(searchLower);

        // Also search within cookies
        const cookieMatches = entry.cookies.some(
          cookie =>
            cookie.name.toLowerCase().includes(searchLower) ||
            cookie.value.toLowerCase().includes(searchLower)
        );

        if (!domainMatches && !cookieMatches) {
          return false;
        }
      }

      return true;
    });
  }

  private clearSearch(): void {
    this.input.value = '';
    this.onFilterChange(this.allEntries);
    this.input.blur();
  }

  updateEntries(entries: CookieEntry[]): void {
    this.allEntries = entries;

    // If we have an active search, re-apply the filter
    if (this.input.value.trim()) {
      this.handleSearch();
    }
  }

  show(): void {
    this.isVisible = true;
    this.container.classList.remove('hidden');
    this.input.focus();
  }

  hide(): void {
    this.isVisible = false;
    this.container.classList.add('hidden');
    this.clearSearch();
  }

  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  get visible(): boolean {
    return this.isVisible;
  }
}
