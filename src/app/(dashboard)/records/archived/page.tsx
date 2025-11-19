'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import RecordTable from '@/components/RecordTable';
import RecordFilters from '@/components/RecordFilters';
import RecordStats from '@/components/RecordStats';
import { TableShimmerLoader } from '@/components/ShimmerLoader';
import { Plus, Download, Archive } from 'lucide-react';
import { toast } from 'sonner';

interface Record {
  id: number;
  date: string;
  name: string;
  fatherName: string;
  street: string;
  place: string;
  weightGrams: number;
  itemType: 'Gold' | 'Silver';
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

export default function ArchivedRecordsPage() {
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

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/records?status=archived');
      if (!response.ok) throw new Error('Failed to fetch archived records');
      const data = await response.json();
      setRecords(data.data || []);

      // Calculate stats for archived records
      const archivedRecords = data.data || [];
      const totalRecords = archivedRecords.length;
      const bigRecords = archivedRecords.filter(
        (r: Record) => r.amount > 100000
      ).length;
      const totalWeight = archivedRecords.reduce(
        (sum: number, r: Record) => sum + r.weightGrams,
        0
      );
      const totalAmount = archivedRecords.reduce(
        (sum: number, r: Record) => sum + r.amount,
        0
      );
      const goldCount = archivedRecords.filter(
        (r: Record) => r.itemType === 'Gold'
      ).length;
      const silverCount = archivedRecords.filter(
        (r: Record) => r.itemType === 'Silver'
      ).length;

      setStats({
        totalRecords,
        activeRecords: 0,
        archivedRecords: totalRecords,
        bigRecords,
        totalWeight,
        totalAmount,
        goldCount,
        silverCount,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch archived records'
      );
      toast.error('Failed to load archived records');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this archived record?'))
      return;

    try {
      const response = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete record');

      setRecords(records.filter((record) => record.id !== id));
      toast.success('Archived record deleted successfully');
    } catch (err) {
      toast.error('Failed to delete archived record');
    }
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    toast.info('CSV export coming soon');
  };

  // Filter and sort records
  const filteredRecords = records
    .filter((record) => {
      const matchesSearch =
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.mobile.includes(searchTerm) ||
        record.place.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        itemTypeFilter === 'all' || record.itemType === itemTypeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof Record];
      let bValue: any = b[sortBy as keyof Record];

      if (sortBy === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-gray-600" />
            <h1 className="text-xl font-semibold">Archived Records</h1>
          </div>
        </div>
        <TableShimmerLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-gray-600" />
            <h1 className="text-xl font-semibold">Archived Records</h1>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-gray-600" />
          <h1 className="text-xl font-semibold">Archived Records</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Link href="/records/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Record
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <RecordStats {...stats} />

      {/* Search and Filters */}
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

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Archived Records ({filteredRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <RecordTable records={filteredRecords} onDelete={handleDelete} />
        </CardContent>
      </Card>
    </div>
  );
}
