'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import RecordTable from '@/components/RecordTable';
import RecordFilters from '@/components/RecordFilters';
import RecordStats from '@/components/RecordStats';
import { TableShimmerLoader } from '@/components/ShimmerLoader';
import { Plus, Download, Star } from 'lucide-react';
import { toast } from 'sonner';
import EditRecordPanel from '@/components/EditRecordPanel';
import FloatingNewRecord from '@/components/FloatingNewRecord';
import NewRecordLauncher from '@/components/NewRecordLauncher';

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
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit state
  const [editRecord, setEditRecord] = useState<Record | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [currentPage, searchTerm, itemTypeFilter, sortBy, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemTypeFilter, sortBy, sortOrder]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: 'big',
        page: currentPage.toString(),
        limit: '10',
      });

      if (searchTerm) params.append('search', searchTerm);
      if (itemTypeFilter !== 'all') params.append('itemType', itemTypeFilter);
      if (sortBy !== 'date')
        params.append('sortBy', sortBy === 'date' ? 'createdAt' : sortBy);
      params.append('sortDir', sortOrder);

      const response = await fetch(`/api/records?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch big records');
      const data = await response.json();
      setRecords(data.data || []);
      setTotalPages(Math.ceil(data.total / 10));

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
    }
  };

  const handleMove = async (
    id: number,
    newCategory: 'active' | 'archived' | 'big'
  ) => {
    try {
      const response = await fetch(`/api/records/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemCategory: newCategory }),
      });
      if (!response.ok) throw new Error('Failed to move record');

      // Remove from current list and refresh
      setRecords(records.filter((record) => record.id !== id));
      toast.success(`Record moved to ${newCategory}`);
    } catch (err) {
      toast.error('Failed to move record');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this big record?')) return;

    try {
      const response = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete record');

      setRecords(records.filter((record) => record.id !== id));
      toast.success('Big record deleted successfully');
    } catch (err) {
      toast.error('Failed to delete big record');
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
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">Error: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-600" />
          <h1 className="text-base font-semibold sm:text-xl">Big Records</h1>
        </div>
        <div className="hidden flex-row gap-2 sm:flex">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <NewRecordLauncher onSuccess={fetchRecords} defaultCategory="big" />
        </div>
        <div className="flex items-center gap-2 sm:hidden">
          <Button variant="outline" className="flex-1" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <RecordStats
        {...stats}
        exclude={['activeRecords', 'archivedRecords', 'bigRecords']}
      />

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex-1">
          <RecordFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            itemTypeFilter={itemTypeFilter}
            onItemTypeFilterChange={setItemTypeFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />
        </div>
      </div>
      <FloatingNewRecord />

      {/* Table */}
      <Card className="mb-[calc(4rem+env(safe-area-inset-bottom))] sm:mb-0">
        <CardHeader>
          <CardTitle>Big Records ({filteredRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <RecordTable
            records={filteredRecords}
            onDelete={handleDelete}
            onEdit={setEditRecord}
            onMove={handleMove}
            variant="big"
          />
        </CardContent>
      </Card>
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
