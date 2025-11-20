'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import StreetSelect from '@/components/StreetSelect';
import PlaceSelect from '@/components/PlaceSelect';

interface RecordFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  itemTypeFilter: string;
  onItemTypeFilterChange: (value: string) => void;
  streetFilter: string;
  onStreetFilterChange: (value: string) => void;
  placeFilter: string;
  onPlaceFilterChange: (value: string) => void;
  showSearch?: boolean;
}

export default function RecordFilters({
  searchTerm,
  onSearchChange,
  itemTypeFilter,
  onItemTypeFilterChange,
  streetFilter,
  onStreetFilterChange,
  placeFilter,
  onPlaceFilterChange,
  showSearch = true,
}: RecordFiltersProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  // Update parent when debounced value changes
  React.useEffect(() => {
    onSearchChange(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearchChange]);

  // Update local state when prop changes (for external updates)
  React.useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {showSearch && (
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search by name, father's name, mobile, or place..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      <Select value={itemTypeFilter} onValueChange={onItemTypeFilterChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="Gold">Gold</SelectItem>
          <SelectItem value="Silver">Silver</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative w-full sm:w-48">
        <StreetSelect
          value={streetFilter}
          onValueChange={onStreetFilterChange}
          placeholder="Filter by street"
          showClearButton={true}
          triggerClassName="pr-8"
        />
        {streetFilter && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-muted"
            onClick={() => onStreetFilterChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="relative w-full sm:w-48">
        <PlaceSelect
          value={placeFilter}
          onValueChange={onPlaceFilterChange}
          placeholder="Filter by place"
          showClearButton={true}
          triggerClassName="pr-8"
        />
        {placeFilter && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-muted"
            onClick={() => onPlaceFilterChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
