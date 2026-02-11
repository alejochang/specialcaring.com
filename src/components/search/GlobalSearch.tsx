import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { useChild } from '@/contexts/ChildContext';
import { searchAll, SearchResult, getSearchSuggestions } from '@/lib/search';

/**
 * Global Search Component
 *
 * Provides a command palette interface for searching across all data.
 * Triggered by clicking the search button or pressing Cmd/Ctrl+K.
 */

interface GlobalSearchProps {
  onSelect?: (result: SearchResult) => void;
}

export function GlobalSearch({ onSelect }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const navigate = useNavigate();
  const { activeChild } = useChild();
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Search query
  const { data: results, isLoading } = useQuery({
    queryKey: ['search', activeChild?.id, debouncedQuery],
    queryFn: () => searchAll(activeChild?.id || '', debouncedQuery),
    enabled: !!activeChild?.id && debouncedQuery.length >= 2,
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Handle result selection
  const handleSelect = useCallback(
    (result: SearchResult) => {
      setOpen(false);
      setQuery('');

      if (onSelect) {
        onSelect(result);
      } else {
        navigate(result.url);
      }
    },
    [navigate, onSelect]
  );

  // Group results by type
  const groupedResults = results?.reduce((groups, result) => {
    const type = result.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(result);
    return groups;
  }, {} as Record<string, SearchResult[]>);

  const typeLabels: Record<string, string> = {
    medication: 'Medications',
    contact: 'Medical Contacts',
    protocol: 'Emergency Protocols',
    log: 'Daily Logs',
    supplier: 'Suppliers',
    info: 'Information',
  };

  return (
    <>
      {/* Search trigger button */}
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput
            ref={inputRef}
            placeholder="Search medications, contacts, protocols..."
            value={query}
            onValueChange={setQuery}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <CommandList>
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && debouncedQuery.length >= 2 && (!results || results.length === 0) && (
            <CommandEmpty>
              <div className="flex flex-col items-center py-6">
                <p className="text-sm text-muted-foreground">No results found.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching for a medication name, doctor, or condition.
                </p>
              </div>
            </CommandEmpty>
          )}

          {/* Suggestions when no query */}
          {!debouncedQuery && (
            <CommandGroup heading="Suggestions">
              {getSearchSuggestions().map((suggestion) => (
                <CommandItem
                  key={suggestion}
                  onSelect={() => setQuery(suggestion)}
                  className="cursor-pointer"
                >
                  <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                  {suggestion}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Results grouped by type */}
          {!isLoading &&
            groupedResults &&
            Object.entries(groupedResults).map(([type, items]) => (
              <CommandGroup key={type} heading={typeLabels[type] || type}>
                {items.map((result) => (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <span className="mr-2 text-lg">{result.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{result.title}</span>
                      {result.subtitle && (
                        <span className="text-xs text-muted-foreground">
                          {result.subtitle}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
        </CommandList>

        <div className="flex items-center border-t px-3 py-2">
          <span className="text-xs text-muted-foreground">
            Press{' '}
            <kbd className="rounded border bg-muted px-1 py-0.5 text-xs">↵</kbd>{' '}
            to select,{' '}
            <kbd className="rounded border bg-muted px-1 py-0.5 text-xs">↑↓</kbd>{' '}
            to navigate,{' '}
            <kbd className="rounded border bg-muted px-1 py-0.5 text-xs">esc</kbd>{' '}
            to close
          </span>
        </div>
      </CommandDialog>
    </>
  );
}
