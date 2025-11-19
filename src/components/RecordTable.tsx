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
import { Eye, Edit, Trash2 } from 'lucide-react';

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
  return (
    <div className="rounded-md border">
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
                  variant={record.itemType === 'Gold' ? 'default' : 'secondary'}
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

      {records.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          No records found.
        </div>
      )}
    </div>
  );
}
