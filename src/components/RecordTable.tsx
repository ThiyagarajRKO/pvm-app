'use client';

import React from 'react';
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
import Link from 'next/link';
import {
  Eye,
  Edit,
  Trash2,
  Star,
  Archive as ArchiveIcon,
  CheckCircle,
} from 'lucide-react';

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
  variant?: 'default' | 'active' | 'archived' | 'big';
}

export default function RecordTable({
  records,
  onDelete,
  variant = 'default',
}: RecordTableProps) {
  return (
    <div className="rounded-md border">
      {/* Desktop / tablet table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Place</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Weight</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
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

      {records.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          No records found.
        </div>
      )}
      {/* Mobile: collapsed card view */}
      <div className="block md:hidden">
        <ul className="divide-y">
          {records.map((record) => (
            <li key={record.id} className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {new Date(record.date).toLocaleDateString()}
                    </p>
                    <span className="text-xs text-gray-400">•</span>
                    <Badge
                      variant={
                        record.itemType === 'Gold' ? 'default' : 'secondary'
                      }
                    >
                      {record.itemType}
                    </Badge>
                    {variant === 'active' && (
                      <div className="ml-1 flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs">Active</span>
                      </div>
                    )}
                    {variant === 'archived' && (
                      <div className="ml-1 flex items-center gap-1 text-gray-500">
                        <ArchiveIcon className="h-4 w-4" />
                        <span className="text-xs">Archived</span>
                      </div>
                    )}
                    {variant === 'big' && (
                      <div className="ml-1 flex items-center gap-1 text-yellow-600">
                        <Star className="h-4 w-4" />
                        <span className="text-xs">High value</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-1 flex items-center justify-between">
                    <div>
                      <p className="truncate font-medium">{record.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.place} • {record.mobile}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {variant === 'big' ? (
                          <span className="mr-1 text-yellow-500">★</span>
                        ) : null}
                        ₹{record.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {record.weightGrams}g
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-shrink-0 flex-col items-end gap-1">
                  <Link href={`/records/${record.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <div className="flex gap-1">
                    <Link href={`/records/${record.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete?.(record.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
