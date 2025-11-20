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
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Eye,
  Edit,
  Trash2,
  Star,
  Archive as ArchiveIcon,
  CheckCircle,
  MoreHorizontal,
  ArrowRight,
  AlertTriangle,
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
  itemCategory: 'active' | 'archived' | 'big';
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
  onEdit?: (record: Record) => void;
  onMove?: (id: number, newCategory: 'active' | 'archived' | 'big') => void;
  variant?: 'default' | 'active' | 'archived' | 'big';
}

export default function RecordTable({
  records,
  onDelete,
  onEdit,
  onMove,
  variant = 'default',
}: RecordTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<Record | null>(null);

  const handleDeleteClick = (record: Record) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (recordToDelete) {
      onDelete?.(recordToDelete.id);
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  const getMoveOptions = (currentVariant: string) => {
    const options = [];
    if (currentVariant !== 'active')
      options.push({ label: 'Move to Active', value: 'active' as const });
    if (currentVariant !== 'archived')
      options.push({ label: 'Move to Archived', value: 'archived' as const });
    if (currentVariant !== 'big')
      options.push({ label: 'Move to Big', value: 'big' as const });
    return options;
  };

  const moveOptions = getMoveOptions(variant);
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/records/${record.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit?.(record)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(record)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                      {moveOptions.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          {moveOptions.map((option) => (
                            <DropdownMenuItem
                              key={option.value}
                              onClick={() => onMove?.(record.id, option.value)}
                            >
                              <ArrowRight className="mr-2 h-4 w-4" />
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                      <p className="truncate text-base font-medium sm:text-lg">
                        {record.name}
                      </p>
                      <p className="text-sm text-muted-foreground sm:text-base">
                        {record.place} • {record.mobile}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-semibold sm:text-lg">
                        {variant === 'big' ? (
                          <span className="mr-1 text-yellow-500">★</span>
                        ) : null}
                        ₹{record.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground sm:text-sm">
                        {record.weightGrams}g
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-shrink-0 flex-col items-end gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/records/${record.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit?.(record)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(record)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                      {moveOptions.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          {moveOptions.map((option) => (
                            <DropdownMenuItem
                              key={option.value}
                              onClick={() => onMove?.(record.id, option.value)}
                            >
                              <ArrowRight className="mr-2 h-4 w-4" />
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <AlertDialogTitle>Delete Record</AlertDialogTitle>
                <AlertDialogDescription className="mt-2">
                  Are you sure you want to delete this record? This action
                  cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          {recordToDelete && (
            <div className="my-4 rounded-lg border bg-muted/50 p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">
                    Name:
                  </span>
                  <p className="font-medium">{recordToDelete.name}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Mobile:
                  </span>
                  <p className="font-medium">{recordToDelete.mobile}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Item Type:
                  </span>
                  <Badge
                    variant={
                      recordToDelete.itemType === 'Gold'
                        ? 'default'
                        : 'secondary'
                    }
                    className="text-xs"
                  >
                    {recordToDelete.itemType}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Amount:
                  </span>
                  <p className="font-medium">
                    ₹{recordToDelete.amount.toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-muted-foreground">
                    Place:
                  </span>
                  <p className="font-medium">{recordToDelete.place}</p>
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
