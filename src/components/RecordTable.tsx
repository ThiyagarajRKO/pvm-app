'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { Eye, Edit, Trash2, Search, Filter } from 'lucide-react';

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

interface RecordTableProps {
  records: Record[];
  onDelete?: (id: number) => void;
}

export default function RecordTable({ records, onDelete }: RecordTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search by name, mobile, or place..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Gold">Gold</SelectItem>
            <SelectItem value="Silver">Silver</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('date')}
              >
                Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('name')}
              >
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Place</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('itemType')}
              >
                Type{' '}
                {sortBy === 'itemType' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                className="cursor-pointer text-right hover:bg-muted/50"
                onClick={() => handleSort('weightGrams')}
              >
                Weight{' '}
                {sortBy === 'weightGrams' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                className="cursor-pointer text-right hover:bg-muted/50"
                onClick={() => handleSort('amount')}
              >
                Amount{' '}
                {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {new Date(record.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium">{record.name}</TableCell>
                <TableCell>{record.mobile}</TableCell>
                <TableCell>{record.place}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      record.itemType === 'Gold' ? 'default' : 'secondary'
                    }
                  >
                    {record.itemType}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {record.weightGrams}g
                </TableCell>
                <TableCell className="text-right">
                  ₹{record.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/records/${record.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/records/${record.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete?.(record.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredRecords.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          No records found matching your criteria.
        </div>
      )}
    </div>
  );
}
