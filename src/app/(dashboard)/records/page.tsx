'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import RecordTable from '@/components/RecordTable';
import { Plus, Download } from 'lucide-react';
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

export default function RecordsPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/records');
      if (!response.ok) throw new Error('Failed to fetch records');
      const data = await response.json();
      setRecords(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const response = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete record');

      setRecords(records.filter((record) => record.id !== id));
      toast.success('Record deleted successfully');
    } catch (err) {
      toast.error('Failed to delete record');
    }
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    toast.info('CSV export coming soon');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Records</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading records...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Records</h1>
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
        <h1 className="text-xl font-semibold">Records</h1>
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

      <Card>
        <CardHeader>
          <CardTitle>All Records ({records.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <RecordTable records={records} onDelete={handleDelete} />
        </CardContent>
      </Card>
    </div>
  );
}
