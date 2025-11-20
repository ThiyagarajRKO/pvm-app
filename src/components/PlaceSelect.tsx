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

interface PlaceSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  // Optional className to apply to the dropdown content (e.g., max-h-* for height)
  contentClassName?: string;
}

const DEFAULT_PLACES = [
  'Villupuram',
  'Tindivanam',
  'Gingee',
  'Ulundurpet',
  'Vikravandi',
  'Vanur',
  'Marakkanam',
  'Membar',
  'Melmalaiyanur',
  'Kallakurichi',
];

export default function PlaceSelect({
  value,
  onValueChange,
  placeholder = 'Select place',
  contentClassName = 'max-h-56',
}: PlaceSelectProps) {
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEFAULT_PLACES;
    return DEFAULT_PLACES.filter((p) => p.toLowerCase().includes(q));
  }, [query]);

  React.useEffect(() => {
    if (open) {
      // Focus the search input when the dropdown opens
      setTimeout(() => searchRef.current?.focus(), 10);
    }
  }, [open]);

  return (
    <Select value={value} onValueChange={onValueChange} onOpenChange={setOpen}>
      <SelectTrigger className="text-left">
        <div className="w-full text-left">
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent
        className={contentClassName}
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
              placeholder="Search places..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full"
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <div className="p-2">
            {filtered.length === 0 && (
              <div className="p-2 text-sm text-muted-foreground">
                No results
              </div>
            )}
            {filtered.map((p) => (
              <SelectItem key={p} value={p} className="text-left">
                {p}
              </SelectItem>
            ))}
          </div>
        </div>
      </SelectContent>
    </Select>
  );
}
