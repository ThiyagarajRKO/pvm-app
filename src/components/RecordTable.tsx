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
  RotateCcw,
  Phone,
  Copy,
} from 'lucide-react';

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
  interest: number;
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
  onReturnItem?: (id: number) => void;
  onMove?: (id: number, newCategory: 'active' | 'archived' | 'big') => void;
  variant?: 'default' | 'active' | 'archived' | 'big';
  loading?: boolean;
}

export default function RecordTable({
  records,
  onDelete,
  onEdit,
  onReturnItem,
  onMove,
  variant = 'default',
  loading = false,
}: RecordTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<Record | null>(null);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

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

  const handleCopyMobile = async (mobile: string) => {
    try {
      await navigator.clipboard.writeText(mobile);
      setCopiedNumber(mobile);
      setTimeout(() => setCopiedNumber(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy mobile number:', err);
    }
  };
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SL No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Place</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Weight</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Interest</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? // Show loading skeleton rows
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell>
                    <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-12 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto h-4 w-14 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto h-4 w-14 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto h-4 w-8 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                </TableRow>
              ))
            : records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.slNo}</TableCell>
                  <TableCell>
                    {new Date(record.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">{record.name}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleCopyMobile(record.mobile)}
                      className="flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                      title="Click to copy mobile number"
                    >
                      <Phone className="h-3 w-3" />
                      <a
                        href={`tel:${record.mobile}`}
                        className="hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {record.mobile}
                      </a>
                      {copiedNumber === record.mobile && (
                        <Copy className="h-3 w-3 text-green-600" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>{record.place}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        record.itemType === 'Gold'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-400 text-white'
                      }`}
                    >
                      {record.itemType}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {record.weightGrams}g
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{record.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {record.interest}%
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onReturnItem?.(record.id)}
                          className="text-green-600 focus:text-green-600"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Return Item
                        </DropdownMenuItem>
                        {moveOptions.length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            {moveOptions.map((option) => (
                              <DropdownMenuItem
                                key={option.value}
                                onClick={() =>
                                  onMove?.(record.id, option.value)
                                }
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

      {records.length === 0 && !loading && (
        <div className="py-8 text-center text-muted-foreground">
          No records found.
        </div>
      )}

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
                  <p className="font-medium">
                    <button
                      onClick={() => handleCopyMobile(recordToDelete.mobile)}
                      className="flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                      title="Click to copy mobile number"
                    >
                      <Phone className="h-3 w-3" />
                      <a
                        href={`tel:${recordToDelete.mobile}`}
                        className="hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {recordToDelete.mobile}
                      </a>
                      {copiedNumber === recordToDelete.mobile && (
                        <Copy className="h-3 w-3 text-green-600" />
                      )}
                    </button>
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Item Type:
                  </span>
                  <span
                    className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      recordToDelete.itemType === 'Gold'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-400 text-white'
                    }`}
                  >
                    {recordToDelete.itemType}
                  </span>
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
