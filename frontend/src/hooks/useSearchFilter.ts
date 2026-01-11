import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

interface UseSearchFilterOptions {
  delay?: number;
  onSearch?: (term: string) => void;
}

interface UseSearchFilterReturn {
  searchTerm: string;
  debouncedSearch: string;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
}

/**
 * Custom hook for handling search with debouncing
 * Provides both immediate and debounced search terms
 *
 * @param options - Configuration options
 * @param options.delay - Debounce delay in milliseconds (default: 500)
 * @param options.onSearch - Optional callback when debounced search changes
 * @returns Object containing search state and handlers
 *
 * @example
 * ```tsx
 * const { searchTerm, debouncedSearch, setSearchTerm, clearSearch } = useSearchFilter({
 *   delay: 500,
 *   onSearch: (term) => console.log('Searching for:', term)
 * });
 *
 * return (
 *   <Input
 *     value={searchTerm}
 *     onChange={(e) => setSearchTerm(e.target.value)}
 *     placeholder="Search..."
 *   />
 * );
 * ```
 */
export function useSearchFilter(options: UseSearchFilterOptions = {}): UseSearchFilterReturn {
  const { delay = 500, onSearch } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, delay);

  // Call onSearch callback when debounced search changes
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch, onSearch]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  return {
    searchTerm,
    debouncedSearch,
    setSearchTerm,
    clearSearch,
  };
}
