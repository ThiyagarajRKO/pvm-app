'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Link from 'next/link';
import RecordTable from '@/components/RecordTable';
import RecordStats from '@/components/RecordStats';
import { TableShimmerLoader } from '@/components/ShimmerLoader';
import { Plus, Download, CheckCircle, Search, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import FloatingNewRecord from '@/components/FloatingNewRecord';
import NewRecordLauncher from '@/components/NewRecordLauncher';
import EditRecordPanel from '@/components/EditRecordPanel';
import { useDebounce } from '@/hooks/use-debounce';
import { api } from '@/lib/api-client';
import AutocompleteInput from '@/components/AutocompleteInput';
import MobileBottomSheet from '@/components/MobileBottomSheet';
interface Record {
  id: number;
  slNo: string;
  date: string;
  name: string;
  fatherName: string;
  street: string;
  place: string;
  weightGrams: number;
  itemType: 'Gold' | 'Silver' | 'Both';
  itemCategory: 'active' | 'archived' | 'big';
  amount: number;
  mobile: string;
  personImageUrl?: string;
  itemImageUrl?: string;
  itemReturnImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalRecords: number;
  activeRecords: number;
  archivedRecords: number;
  bigRecords: number;
  totalWeight: number;
  totalAmount: number;
  goldCount: number;
  silverCount: number;
  goldWeight: number;
  goldAmount: number;
  silverWeight: number;
  silverAmount: number;
}

export default function ActiveRecordsPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRecords: 0,
    activeRecords: 0,
    archivedRecords: 0,
    bigRecords: 0,
    totalWeight: 0,
    totalAmount: 0,
    goldCount: 0,
    silverCount: 0,
    goldWeight: 0,
    goldAmount: 0,
    silverWeight: 0,
    silverAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('all');
  const [streetFilter, setStreetFilter] = useState<string>('');
  const [placeFilter, setPlaceFilter] = useState<string>('');

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit state
  const [editRecord, setEditRecord] = useState<Record | null>(null);

  // Mobile filter state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);

  // Local filter states for desktop popover
  const [localItemTypeFilter, setLocalItemTypeFilter] =
    useState(itemTypeFilter);
  const [localStreetFilter, setLocalStreetFilter] = useState(streetFilter);
  const [localPlaceFilter, setLocalPlaceFilter] = useState(placeFilter);

  // Local filter states for mobile bottom sheet
  const [mobileItemTypeFilter, setMobileItemTypeFilter] =
    useState(itemTypeFilter);
  const [mobileStreetFilter, setMobileStreetFilter] = useState(streetFilter);
  const [mobilePlaceFilter, setMobilePlaceFilter] = useState(placeFilter);

  // Sync local filters when opening desktop popover
  useEffect(() => {
    if (isDesktopFilterOpen) {
      setLocalItemTypeFilter(itemTypeFilter);
      setLocalStreetFilter(streetFilter);
      setLocalPlaceFilter(placeFilter);
    }
  }, [isDesktopFilterOpen, itemTypeFilter, streetFilter, placeFilter]);

  // Sync local filters when opening mobile bottom sheet
  useEffect(() => {
    if (isMobileFilterOpen) {
      setMobileItemTypeFilter(itemTypeFilter);
      setMobileStreetFilter(streetFilter);
      setMobilePlaceFilter(placeFilter);
    }
  }, [isMobileFilterOpen, itemTypeFilter, streetFilter, placeFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setItemTypeFilter('all');
    setStreetFilter('');
    setPlaceFilter('');
    setLocalSearchTerm('');
    setCurrentPage(1);
  };

  const fetchRecords = useCallback(
    async (isInitialLoad = false) => {
      try {
        if (!isInitialLoad) setFiltering(true);
        const params = new URLSearchParams({
          status: 'active',
          page: currentPage.toString(),
          limit: pageSize.toString(),
        });

        if (searchTerm) params.append('search', searchTerm);
        if (itemTypeFilter !== 'all') params.append('itemType', itemTypeFilter);
        if (streetFilter) params.append('street', streetFilter);
        if (placeFilter) params.append('place', placeFilter);

        const response = await api.get(`/records?${params.toString()}`);
        if (response.error) throw new Error(response.error);
        const data = response.data;
        setRecords(data.data || []);
        setTotalPages(Math.ceil(data.total / pageSize));
        setTotalRecords(data.total);

        // Calculate stats for active records
        const activeRecords = data.data || [];
        const totalRecords = data.total;
        const bigRecords = activeRecords.filter(
          (r: Record) => r.amount > 100000
        ).length;
        const totalWeight = data.stats.totalWeight;
        const totalAmount = data.stats.totalAmount;
        const goldCount = data.stats.goldCount;
        const silverCount = data.stats.silverCount;
        const goldWeight = data.stats.goldWeight;
        const goldAmount = data.stats.goldAmount;
        const silverWeight = data.stats.silverWeight;
        const silverAmount = data.stats.silverAmount;

        setStats({
          totalRecords,
          activeRecords: totalRecords,
          archivedRecords: 0,
          bigRecords,
          totalWeight,
          totalAmount,
          goldCount,
          silverCount,
          goldWeight,
          goldAmount,
          silverWeight,
          silverAmount,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch active records'
        );
        toast.error('Failed to load active records');
      } finally {
        setLoading(false);
        setFiltering(false);
      }
    },
    [
      currentPage,
      searchTerm,
      itemTypeFilter,
      streetFilter,
      placeFilter,
      pageSize,
    ]
  );

  useEffect(() => {
    fetchRecords(true);
  }, []); // Only run on mount

  useEffect(() => {
    fetchRecords(false);
  }, [
    currentPage,
    searchTerm,
    itemTypeFilter,
    streetFilter,
    placeFilter,
    fetchRecords,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemTypeFilter, streetFilter, placeFilter, pageSize]);

  // Fetch suggestions for filters
  const fetchStreets = useCallback(async (query: string) => {
    try {
      const response = await api.get<string[]>(
        `/records/unique-streets?q=${encodeURIComponent(query)}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch streets:', error);
      return [];
    }
  }, []);

  const fetchPlaces = useCallback(async (query: string) => {
    try {
      const response = await api.get<string[]>(
        `/records/unique-places?q=${encodeURIComponent(query)}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch places:', error);
      return [];
    }
  }, []);

  const handleMove = async (
    id: number,
    newCategory: 'active' | 'archived' | 'big'
  ) => {
    try {
      const response = await api.put(`/records/${id}`, {
        itemCategory: newCategory,
      });
      if (response.error) throw new Error(response.error);

      // Remove from current list and refresh
      setRecords(records.filter((record) => record.id !== id));
      toast.success(`Record moved to ${newCategory}`);
    } catch (err) {
      toast.error('Failed to move record');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await api.delete(`/records/${id}`);
      if (response.error) throw new Error(response.error);

      setRecords(records.filter((record) => record.id !== id));
      toast.success('Active record deleted successfully');
    } catch (err) {
      toast.error('Failed to delete active record');
    }
  };

  const handleReturnItem = async (id: number, returnedAmount?: number) => {
    if (!returnedAmount) {
      toast.error('Returned amount is required');
      return;
    }

    try {
      const response = await api.put('/records', {
        id,
        returnedAmount,
      });
      if (response.error) throw new Error(response.error);

      // Refresh the records and stats after successful return
      await fetchRecords();
      toast.success('Item returned successfully');
    } catch (err) {
      console.error('Return item error:', err);
      toast.error('Failed to return item');
    }
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    toast.info('CSV export coming soon');
  };

  // Filter and sort records - now handled server-side
  const filteredRecords = records;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h1 className="text-xl font-semibold">Active Records</h1>
          </div>
        </div>
        <TableShimmerLoader
          columnStructure={[
            { width: 'w-28', align: 'left' },
            { width: 'w-48', align: 'left' },
            { width: 'w-28', align: 'left' },
            { width: 'w-32', align: 'left' },
            { width: 'w-20', align: 'left' },
            { width: 'w-20', align: 'right' },
            { width: 'w-28', align: 'right' },
            { width: 'w-24', align: 'right' },
          ]}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h1 className="text-xl font-semibold">Active Records</h1>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-center text-red-500">Error: {error}</div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-0">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h1 className="text-base font-semibold sm:text-xl">
              Active Records
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 sm:hidden"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <div className="hidden flex-row gap-2 sm:flex">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <RecordStats
        {...stats}
        exclude={['activeRecords', 'archivedRecords', 'bigRecords']}
        loading={filtering}
      />

      <FloatingNewRecord />

      {/* Table */}
      <div className="mb-[calc(4rem+env(safe-area-inset-bottom))] mt-8 sm:mb-0">
        <div className="mb-4 flex flex-col gap-4">
          <div className="flex items-center justify-between sm:hidden">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={() => setIsMobileFilterOpen(true)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-center">
              <div className="hidden sm:block">
                <Popover
                  open={isDesktopFilterOpen}
                  onOpenChange={setIsDesktopFilterOpen}
                >
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium leading-none">Filters</h4>
                        <div className="flex gap-2">
                          {(localItemTypeFilter !== 'all' ||
                            localStreetFilter ||
                            localPlaceFilter) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setItemTypeFilter('all');
                                  setStreetFilter('');
                                  setPlaceFilter('');
                                  setCurrentPage(1);
                                  setIsDesktopFilterOpen(false);
                                }}
                                className="h-8 px-2 text-xs"
                              >
                                Reset All
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setItemTypeFilter(localItemTypeFilter);
                                  setStreetFilter(localStreetFilter);
                                  setPlaceFilter(localPlaceFilter);
                                  setCurrentPage(1);
                                  setIsDesktopFilterOpen(false);
                                }}
                                className="h-8 px-2 text-xs"
                              >
                                Apply
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                              Item Type
                            </label>
                            {localItemTypeFilter !== 'all' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-muted"
                                onClick={() => {
                                  setLocalItemTypeFilter('all');
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <Select
                            value={localItemTypeFilter}
                            onValueChange={setLocalItemTypeFilter}
                          >
                            <SelectTrigger className="mt-1 w-full">
                              <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="Gold">Gold</SelectItem>
                              <SelectItem value="Silver">Silver</SelectItem>
                              <SelectItem value="Both">Both</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                              Street
                            </label>
                            {localStreetFilter && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-muted"
                                onClick={() => {
                                  setLocalStreetFilter('');
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <AutocompleteInput
                            value={localStreetFilter}
                            onValueChange={setLocalStreetFilter}
                            placeholder="Filter by street"
                            fetchSuggestions={fetchStreets}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Place</label>
                            {localPlaceFilter && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-muted"
                                onClick={() => {
                                  setLocalPlaceFilter('');
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <AutocompleteInput
                            value={localPlaceFilter}
                            onValueChange={setLocalPlaceFilter}
                            placeholder="Filter by place"
                            fetchSuggestions={fetchPlaces}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  placeholder="Search by name, father's name, mobile, or place..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {localSearchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-muted"
                    onClick={() => {
                      setLocalSearchTerm('');
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="hidden sm:block">
                <NewRecordLauncher
                  onSuccess={fetchRecords}
                  defaultCategory="active"
                />
              </div>
            </div>
          </div>
          <div className="relative flex-1 sm:hidden">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search by name, father's name, mobile, or place..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {localSearchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-muted"
                onClick={() => {
                  setLocalSearchTerm('');
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <RecordTable
          records={filteredRecords as any}
          onDelete={handleDelete}
          onEdit={setEditRecord}
          onReturnItem={handleReturnItem}
          onMove={handleMove}
          variant="active"
          loading={filtering}
        />

        {/* Pagination Info */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing{' '}
            {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}{' '}
            to {Math.min(currentPage * pageSize, totalRecords)} of{' '}
            {totalRecords} entries
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
      {editRecord && (
        <EditRecordPanel
          record={editRecord}
          onClose={() => setEditRecord(null)}
          onBeginClose={() => setEditRecord(null)}
          onSuccess={() => {
            setEditRecord(null);
            fetchRecords();
          }}
        />
      )}

      {/* Mobile Filter Bottom Sheet */}
      <MobileBottomSheet
        open={isMobileFilterOpen}
        onDismiss={() => setIsMobileFilterOpen(false)}
        onAfterDismiss={() => setIsMobileFilterOpen(false)}
        title="Filters"
        description="Filter active records"
        descriptionIcon={<Filter className="h-5 w-5" />}
        initialSnapPct={0.65}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium leading-none">Filters</h4>
            {(mobileItemTypeFilter !== 'all' ||
              mobileStreetFilter ||
              mobilePlaceFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setItemTypeFilter('all');
                  setStreetFilter('');
                  setPlaceFilter('');
                  setCurrentPage(1);
                  setIsMobileFilterOpen(false);
                }}
                className="h-8 px-2 text-xs"
              >
                Reset All
              </Button>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Item Type</label>
                {mobileItemTypeFilter !== 'all' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={() => {
                      setMobileItemTypeFilter('all');
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Select
                value={mobileItemTypeFilter}
                onValueChange={setMobileItemTypeFilter}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Street</label>
                {mobileStreetFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={() => {
                      setMobileStreetFilter('');
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <AutocompleteInput
                value={mobileStreetFilter}
                onValueChange={setMobileStreetFilter}
                placeholder="Filter by street"
                fetchSuggestions={fetchStreets}
                className="mt-1"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Place</label>
                {mobilePlaceFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={() => {
                      setMobilePlaceFilter('');
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <AutocompleteInput
                value={mobilePlaceFilter}
                onValueChange={setMobilePlaceFilter}
                placeholder="Filter by place"
                fetchSuggestions={fetchPlaces}
                className="mt-1"
              />
            </div>
          </div>
          {(mobileItemTypeFilter !== 'all' ||
            mobileStreetFilter ||
            mobilePlaceFilter) && (
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="default"
                onClick={() => {
                  setItemTypeFilter(mobileItemTypeFilter);
                  setStreetFilter(mobileStreetFilter);
                  setPlaceFilter(mobilePlaceFilter);
                  setCurrentPage(1);
                  setIsMobileFilterOpen(false);
                }}
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      </MobileBottomSheet>
    </div>
  );
}
