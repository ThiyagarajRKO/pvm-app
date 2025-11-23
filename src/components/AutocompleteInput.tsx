'use client';

import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ChevronDown, X } from 'lucide-react';
import { useDebouncedCallback, useDebounce } from '@/hooks/use-debounce';

interface AutocompleteInputProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  fetchSuggestions?: (query: string) => Promise<string[]>;
  suggestions?: string[];
  className?: string;
  disabled?: boolean;
}

export default function AutocompleteInput({
  value = '',
  onValueChange,
  placeholder = 'Type or select...',
  fetchSuggestions,
  suggestions: staticSuggestions = [],
  className = '',
  disabled = false,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounce the input value
  const debouncedInput = useDebounce(inputValue, 300);

  // Fetch suggestions when debounced input changes or when opened
  useEffect(() => {
    if (open) {
      const query = debouncedInput.trim();
      if (fetchSuggestions) {
        fetchSuggestions(query)
          .then((fetched) => {
            setSuggestions(fetched);
          })
          .catch((error) => {
            console.error('Failed to fetch suggestions:', error);
            setSuggestions([]);
          });
      } else {
        // Use static suggestions, filter by query
        const filtered = staticSuggestions.filter((suggestion) =>
          suggestion.toLowerCase().includes(query.toLowerCase())
        );
        setSuggestions(filtered);
      }
    }
  }, [debouncedInput, open, fetchSuggestions, staticSuggestions]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    if (!open) setOpen(true);
  };

  const handleSelect = (selectedValue: string) => {
    setInputValue(selectedValue);
    onValueChange?.(selectedValue);
    setOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    onValueChange?.('');
    setOpen(false);
  };

  const handleFocus = () => {
    setOpen(true);
  };

  const handleBlur = () => {
    // Reset to prop value if not selected
    setInputValue(value);
    // Delay closing to allow for suggestion clicks
    setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="relative w-full">
      <Input
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted"
          onClick={() => setOpen(!open)}
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>

      {open && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-0 shadow-md">
          <div className="max-h-48 overflow-y-auto">
            {suggestions.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                No suggestions found.
              </div>
            ) : (
              <div className="p-1">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="w-full rounded px-2 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleSelect(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
