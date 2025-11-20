'use client';

import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ChevronDown, X } from 'lucide-react';

interface AutocompleteInputProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  suggestions: string[];
  className?: string;
  disabled?: boolean;
}

export default function AutocompleteInput({
  value = '',
  onValueChange,
  placeholder = 'Type or select...',
  suggestions,
  className = '',
  disabled = false,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onValueChange?.(newValue);
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
            {filteredSuggestions.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                No suggestions found.
              </div>
            ) : (
              <div className="p-1">
                {filteredSuggestions.map((suggestion) => (
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
