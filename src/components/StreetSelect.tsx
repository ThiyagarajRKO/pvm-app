'use client';

import React from 'react';
import { Input } from './ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from './ui/select';
import { Loader2 } from 'lucide-react';
import { DEFAULT_STREETS } from '@/lib/constants';

interface StreetSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  // Optional className to apply to the dropdown content (e.g., max-h-* for height)
  contentClassName?: string;
  // Optional className for the trigger
  triggerClassName?: string;
  // Whether to show extra padding for clear button
  showClearButton?: boolean;
}

export default function StreetSelect({
  value,
  onValueChange,
  placeholder = 'Select street',
  contentClassName = 'max-h-56',
  triggerClassName = '',
  showClearButton = false,
}: StreetSelectProps) {
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [streets, setStreets] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const searchRef = React.useRef<HTMLInputElement | null>(null);

  // Fetch streets from API
  React.useEffect(() => {
    const fetchStreets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/records/unique-streets');
        if (!response.ok) {
          throw new Error('Failed to fetch streets');
        }
        const data = await response.json();
        setStreets(data);
      } catch (err) {
        console.error('Error fetching streets:', err);
        setError('Failed to load streets');
        // Fallback to default streets
        setStreets(DEFAULT_STREETS);
      } finally {
        setLoading(false);
      }
    };

    fetchStreets();
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return streets;
    return streets.filter((s) => s.toLowerCase().includes(q));
  }, [query, streets]);

  React.useEffect(() => {
    if (open) {
      // Focus the search input when the dropdown opens
      setTimeout(() => searchRef.current?.focus(), 10);
    }
  }, [open]);

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectTrigger className={`text-left ${triggerClassName}`}>
        <div className="flex w-full items-center justify-between">
          <div className="flex-1 text-left">
            <SelectValue placeholder={placeholder} />
          </div>
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </SelectTrigger>
      <SelectContent
        className={`${contentClassName} z-[10000]`}
        showScrollUp={false}
        showScrollDown={true}
      >
        <div className="p-0">
          {/*
            Search box is made sticky to ensure it stays visible while list scrolls.
            The SelectPrimitive.Viewport (inside SelectContent) provides the scrolling area,
            so `position: sticky` will pin the search box to the top of that viewport.
          */}
          <div className="sticky top-0 z-10 bg-popover p-2">
            <Input
              ref={searchRef}
              placeholder="Search streets..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full"
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <div className="p-2">
            {loading && (
              <div className="p-2 text-sm text-muted-foreground">
                Loading...
              </div>
            )}
            {error && <div className="p-2 text-sm text-red-500">{error}</div>}
            {!loading && !error && filtered.length === 0 && (
              <div className="p-2 text-sm text-muted-foreground">
                No results
              </div>
            )}
            {!loading &&
              !error &&
              filtered.map((s) => (
                <SelectItem key={s} value={s} className="text-left">
                  {s}
                </SelectItem>
              ))}
          </div>
        </div>
      </SelectContent>
    </Select>
  );
}
