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
import { RotateCcw, Download, Search, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';
import StreetSelect from '@/components/StreetSelect';
import PlaceSelect from '@/components/PlaceSelect';
import MobileBottomSheet from '@/components/MobileBottomSheet';
import EditRecordPanel from '@/components/EditRecordPanel';
import ReturnItemModal from '@/components/ReturnItemModal';
import { api } from '@/lib/api-client';

interface Record {
  id: number;
  slNo: string;
  date: string;
  name: string;
  fatherName: string;
  street: string;
  place: string;
  itemType: 'Gold' | 'Silver' | 'Both';
  itemCategory: 'active' | 'archived' | 'big';
  amount: number;
  interest: number;
  isReturned: boolean;
  returnedAmount?: number;
  returnedDate?: string;
  mobile: string;
  personImageUrl?: string;
  itemImageUrl?: string;
  itemReturnImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  daysOld: number;
  monthsOld?: number;
  calculatedInterestAmount?: number;
  calculatedTotalAmount?: number;
  interestMonths?: number;
}

interface Stats {
  totalRecords: number;
  totalWeight: number;
  totalAmount: number;
  totalReturnedAmount: number;
  goldCount: number;
  silverCount: number;
  goldWeight: number;
  goldAmount: number;
  silverWeight: number;
  silverAmount: number;
}

export default function ReturnedRecordsPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRecords: 0,
    totalWeight: 0,
    totalAmount: 0,
    totalReturnedAmount: 0,
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Edit state
  const [editRecord, setEditRecord] = useState<Record | null>(null);
  const [editRecordPanel, setEditRecordPanel] = useState<Record | null>(null);

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
          status: 'returned',
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

        // Calculate stats for returned records
        const returnedRecords = data.data || [];
        const totalRecords = data.total;
        const totalWeight = data.stats.totalWeight;
        const totalAmount = data.stats.totalAmount;
        const totalReturnedAmount = returnedRecords.reduce(
          (sum: number, record: Record) => sum + (record.returnedAmount || 0),
          0
        );
        const goldCount = data.stats.goldCount;
        const silverCount = data.stats.silverCount;

        setStats({
          totalRecords,
          totalWeight,
          totalAmount,
          totalReturnedAmount,
          goldCount,
          silverCount,
          goldWeight: data.stats.goldWeight,
          goldAmount: data.stats.goldAmount,
          silverWeight: data.stats.silverWeight,
          silverAmount: data.stats.silverAmount,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch returned records'
        );
        toast.error('Failed to load returned records');
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

  const handleExport = () => {
    // TODO: Implement CSV export
    toast.info('CSV export coming soon');
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await api.delete(`/records/${id}`);
      if (response.error) throw new Error(response.error);

      setRecords(records.filter((record) => record.id !== id));
      toast.success('Returned record deleted successfully');
    } catch (err) {
      toast.error('Failed to delete returned record');
    }
  };

  const handleMove = async (
    id: number,
    newCategory: 'active' | 'archived' | 'big'
  ) => {
    try {
      const response = await api.put(`/records/${id}`, {
        itemCategory: newCategory,
        isReturned: false,
        returnedAmount: 0, // Clear the returned amount when moving back
        returnedDate: null, // Clear the returned date when moving back
      });
      if (response.error) throw new Error(response.error);

      // Remove the record from the current list and refresh
      setRecords(records.filter((record) => record.id !== id));
      toast.success(`Record moved to ${newCategory} successfully`);

      // Refresh the data to get updated stats
      fetchRecords(false);
    } catch (err) {
      toast.error('Failed to move record');
    }
  };

  const handleEditReturnedAmount = async (returnedAmount: number) => {
    if (!editRecord) return;

    try {
      const response = await api.put('/records', {
        id: editRecord.id,
        returnedAmount,
      });
      if (response.error) throw new Error(response.error);

      // Refresh the records and stats after successful update
      await fetchRecords();
      toast.success('Returned amount updated successfully');
    } catch (err) {
      console.error('Edit returned amount error:', err);
      toast.error('Failed to update returned amount');
    }
  };

  const handleRevert = async (id: number) => {
    try {
      const response = await api.put(`/records/${id}`, {
        isReturned: false,
        returnedAmount: 0,
        returnedDate: null,
      });
      if (response.error) throw new Error(response.error);

      // Remove the record from the current list and refresh
      setRecords(records.filter((record) => record.id !== id));
      toast.success('Record reverted successfully');

      // Refresh the data to get updated stats
      fetchRecords(false);
    } catch (err) {
      toast.error('Failed to revert record');
    }
  };

  // Filter and sort records - now handled server-side
  const filteredRecords = records;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-green-600" />
            <h1 className="text-xl font-semibold">Returned Records</h1>
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
            <RotateCcw className="h-5 w-5 text-green-600" />
            <h1 className="text-xl font-semibold">Returned Records</h1>
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
            <RotateCcw className="h-5 w-5 text-green-600" />
            <h1 className="text-base font-semibold sm:text-xl">
              Returned Records
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
        totalAmount={stats.totalReturnedAmount}
        activeRecords={0}
        archivedRecords={0}
        bigRecords={0}
        exclude={['activeRecords', 'archivedRecords', 'bigRecords']}
        loading={filtering}
        totalAmountLabel="Total Returned Amount"
      />

      {/* Active Filters Indicator */}
      {(searchTerm ||
        itemTypeFilter !== 'all' ||
        streetFilter ||
        placeFilter) && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Active Filters:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {searchTerm && (
              <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Search: "{searchTerm}"
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-blue-200 dark:hover:bg-blue-800"
                  onClick={() => {
                    setSearchTerm('');
                    setLocalSearchTerm('');
                    setCurrentPage(1);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {itemTypeFilter !== 'all' && (
              <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                Type: {itemTypeFilter}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-green-200 dark:hover:bg-green-800"
                  onClick={() => {
                    setItemTypeFilter('all');
                    setCurrentPage(1);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {streetFilter && (
              <div className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Street: {streetFilter}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-purple-200 dark:hover:bg-purple-800"
                  onClick={() => {
                    setStreetFilter('');
                    setCurrentPage(1);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {placeFilter && (
              <div className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                Place: {placeFilter}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-orange-200 dark:hover:bg-orange-800"
                  onClick={() => {
                    setPlaceFilter('');
                    setCurrentPage(1);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="ml-2 h-7 text-xs"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

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
                            <label className="text-sm font-medium">
                              Item Type
                            </label>
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
                              <SelectItem value="Both">Both</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                              Street
                            </label>
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
          onEditRecord={setEditRecordPanel}
          onMove={handleMove}
          onRevert={handleRevert}
          variant="default"
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

      {/* Mobile Filter Bottom Sheet */}
      <MobileBottomSheet
        open={isMobileFilterOpen}
        onDismiss={() => setIsMobileFilterOpen(false)}
        onAfterDismiss={() => setIsMobileFilterOpen(false)}
        title="Filters"
        description="Filter returned records"
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

      {/* Edit Returned Amount Modal */}
      {editRecord && (
        <ReturnItemModal
          isOpen={!!editRecord}
          onClose={() => setEditRecord(null)}
          onConfirm={handleEditReturnedAmount}
          record={editRecord}
          mode="edit"
        />
      )}

      {/* Edit Record Panel */}
      {editRecordPanel && (
        <EditRecordPanel
          record={editRecordPanel}
          onClose={() => setEditRecordPanel(null)}
          onSuccess={() => {
            setEditRecordPanel(null);
            fetchRecords(false);
          }}
        />
      )}
    </div>
  );
}
