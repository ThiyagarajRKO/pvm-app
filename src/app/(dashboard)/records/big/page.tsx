'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import RecordTable from '@/components/RecordTable';
import RecordStats from '@/components/RecordStats';
import { TableShimmerLoader } from '@/components/ShimmerLoader';
import { Plus, Download, Star, Search, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import EditRecordPanel from '@/components/EditRecordPanel';
import FloatingNewRecord from '@/components/FloatingNewRecord';
import NewRecordLauncher from '@/components/NewRecordLauncher';
import { useDebounce } from '@/hooks/use-debounce';
import StreetSelect from '@/components/StreetSelect';
import PlaceSelect from '@/components/PlaceSelect';
import MobileBottomSheet from '@/components/MobileBottomSheet';
import { api } from '@/lib/api-client';

interface Record {
  id: number;
  slNo: string;
  date: string;
  name: string;
  fatherName: string;
  street: string;
  place: string;
  weightGrams: number;
  itemType: 'Gold' | 'Silver';
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
}

export default function BigRecordsPage() {
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
          status: 'big',
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

        // Calculate stats for big records
        const bigRecords = data.data || [];
        const totalRecords = data.total;
        const activeRecords = bigRecords.filter(
          (r: Record) => r.amount > 100000
        ).length;
        const totalWeight = data.stats.totalWeight;
        const totalAmount = data.stats.totalAmount;
        const goldCount = data.stats.goldCount;
        const silverCount = data.stats.silverCount;

        setStats({
          totalRecords,
          activeRecords: 0,
          archivedRecords: 0,
          bigRecords: totalRecords,
          totalWeight,
          totalAmount,
          goldCount,
          silverCount,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch big records'
        );
        toast.error('Failed to load big records');
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
      toast.success('Big record deleted successfully');
    } catch (err) {
      toast.error('Failed to delete big record');
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

      setRecords(records.filter((record) => record.id !== id));
      toast.success('Item returned successfully');
    } catch (err) {
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
            <Star className="h-5 w-5 text-yellow-600" />
            <h1 className="text-xl font-semibold">Big Records</h1>
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
            <Star className="h-5 w-5 text-yellow-600" />
            <h1 className="text-xl font-semibold">Big Records</h1>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-center text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-0">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <h1 className="text-base font-semibold sm:text-xl">Big Records</h1>
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
        {/* Mobile Layout */}
        <div className="mb-4 flex flex-col gap-4 sm:hidden">
          <div className="flex items-center justify-between">
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
          <div className="relative w-full">
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

        {/* Desktop Layout */}
        <div className="mb-4 hidden flex-row items-center justify-between gap-4 sm:flex">
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
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium leading-none">Filters</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="h-8 px-2 text-xs"
                    >
                      Reset All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Item Type</label>
                        {itemTypeFilter !== 'all' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-muted"
                            onClick={() => {
                              setItemTypeFilter('all');
                              setCurrentPage(1);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <Select
                        value={itemTypeFilter}
                        onValueChange={setItemTypeFilter}
                      >
                        <SelectTrigger className="mt-1 w-full">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Gold">Gold</SelectItem>
                          <SelectItem value="Silver">Silver</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Street</label>
                        {streetFilter && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-muted"
                            onClick={() => {
                              setStreetFilter('');
                              setCurrentPage(1);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <StreetSelect
                        value={streetFilter}
                        onValueChange={setStreetFilter}
                        placeholder="Filter by street"
                        showClearButton={false}
                        triggerClassName="mt-1"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Place</label>
                        {placeFilter && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-muted"
                            onClick={() => {
                              setPlaceFilter('');
                              setCurrentPage(1);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <PlaceSelect
                        value={placeFilter}
                        onValueChange={setPlaceFilter}
                        placeholder="Filter by place"
                        showClearButton={false}
                        triggerClassName="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <div className="relative w-80">
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
            <NewRecordLauncher onSuccess={fetchRecords} defaultCategory="big" />
          </div>
        </div>
        <RecordTable
          records={filteredRecords as any}
          onDelete={handleDelete}
          onEdit={setEditRecord}
          onMove={handleMove}
          onReturnItem={handleReturnItem}
          variant="big"
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
        description="Filter big records"
        descriptionIcon={<Filter className="h-5 w-5" />}
        initialSnapPct={0.65}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium leading-none">Filters</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetFilters();
                setIsMobileFilterOpen(false);
              }}
              className="h-8 px-2 text-xs"
            >
              Reset All
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Item Type</label>
                {itemTypeFilter !== 'all' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={() => {
                      setItemTypeFilter('all');
                      setCurrentPage(1);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Street</label>
                {streetFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={() => {
                      setStreetFilter('');
                      setCurrentPage(1);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <StreetSelect
                value={streetFilter}
                onValueChange={setStreetFilter}
                placeholder="Filter by street"
                showClearButton={false}
                triggerClassName="mt-1"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Place</label>
                {placeFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={() => {
                      setPlaceFilter('');
                      setCurrentPage(1);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <PlaceSelect
                value={placeFilter}
                onValueChange={setPlaceFilter}
                placeholder="Filter by place"
                showClearButton={false}
                triggerClassName="mt-1"
              />
            </div>
          </div>
        </div>
      </MobileBottomSheet>
    </div>
  );
}
