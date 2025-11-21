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
  isReturned: boolean;
  returnedAmount?: number;
  mobile: string;
  personImageUrl?: string;
  itemImageUrl?: string;
  itemReturnImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalRecords: number;
  totalWeight: number;
  totalAmount: number;
  totalReturnedAmount: number;
  goldCount: number;
  silverCount: number;
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
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border bg-card p-3 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Records
              </p>
              <p className="text-lg font-bold text-blue-600">
                {stats.totalRecords.toLocaleString()}
              </p>
            </div>
            <RotateCcw className="h-5 w-5 text-blue-600" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-3 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Weight
              </p>
              <p className="text-lg font-bold text-yellow-600">
                {stats.totalWeight.toFixed(1)}g
              </p>
            </div>
            <div className="h-5 w-5 rounded bg-yellow-100 p-1">
              <div className="h-full w-full rounded bg-yellow-600"></div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-3 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Original Amount
              </p>
              <p className="text-lg font-bold text-green-600">
                ₹{stats.totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="h-5 w-5 rounded bg-green-100 p-1">
              <div className="h-full w-full rounded bg-green-600"></div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-3 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Returned Amount
              </p>
              <p className="text-lg font-bold text-red-600">
                ₹{stats.totalReturnedAmount.toLocaleString()}
              </p>
            </div>
            <div className="h-5 w-5 rounded bg-red-100 p-1">
              <div className="h-full w-full rounded bg-red-600"></div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-3 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Gold Items
              </p>
              <p className="text-lg font-bold text-yellow-600">
                {stats.goldCount}
              </p>
            </div>
            <div className="h-5 w-5 rounded bg-yellow-100 p-1">
              <div className="h-full w-full rounded bg-yellow-600"></div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-3 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Silver Items
              </p>
              <p className="text-lg font-bold text-gray-600">
                {stats.silverCount}
              </p>
            </div>
            <div className="h-5 w-5 rounded bg-gray-100 p-1">
              <div className="h-full w-full rounded bg-gray-600"></div>
            </div>
          </div>
        </div>
      </div>

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

        {/* Custom Table for Returned Records */}
        <div className="w-full overflow-x-auto">
          <div className="rounded-md border sm:mx-0">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    SL No
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Mobile
                  </th>
                  <th className="hidden h-12 px-4 text-left align-middle font-medium text-muted-foreground sm:table-cell">
                    Place
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Weight
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Original Amount
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Returned Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtering
                  ? // Loading skeleton
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={`loading-${index}`}>
                        <td className="p-4">
                          <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                        </td>
                        <td className="p-4">
                          <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                        </td>
                        <td className="p-4">
                          <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                        </td>
                        <td className="p-4">
                          <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                        </td>
                        <td className="hidden p-4 sm:table-cell">
                          <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                        </td>
                        <td className="p-4">
                          <div className="h-4 w-12 animate-pulse rounded bg-muted"></div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="ml-auto h-4 w-14 animate-pulse rounded bg-muted"></div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted"></div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted"></div>
                        </td>
                      </tr>
                    ))
                  : filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b">
                        <td className="p-4 font-medium">{record.slNo}</td>
                        <td className="p-4">
                          {new Date(record.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="p-4 font-medium">{record.name}</td>
                        <td className="p-4">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(record.mobile);
                              toast.success('Mobile number copied');
                            }}
                            className="flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                          >
                            📞 {record.mobile}
                          </button>
                        </td>
                        <td className="hidden p-4 sm:table-cell">
                          {record.place}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              record.itemType === 'Gold'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-400 text-white'
                            }`}
                          >
                            {record.itemType}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {record.weightGrams}g
                        </td>
                        <td className="p-4 text-right">
                          ₹{record.amount.toLocaleString()}
                        </td>
                        <td className="p-4 text-right font-semibold text-green-600">
                          ₹{(record.returnedAmount || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>

            {filteredRecords.length === 0 && !filtering && (
              <div className="py-8 text-center text-muted-foreground">
                No returned records found.
              </div>
            )}
          </div>
        </div>

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
