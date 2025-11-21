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
  Loader2,
  MessageCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import ReturnItemModal from './ReturnItemModal';

interface Record {
  id: number;
  slNo: string;
  date: string;
  name: string;
  fatherName: string;
  street: string;
  place: string;
  item?: string | null;
  weightGrams: number;
  itemType: 'Gold' | 'Silver';
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

interface RecordTableProps {
  records: Record[];
  onDelete?: (id: number) => void;
  onEdit?: (record: Record) => void;
  onEditRecord?: (record: Record) => void;
  onReturnItem?: (id: number, returnedAmount?: number) => void;
  onMove?: (id: number, newCategory: 'active' | 'archived' | 'big') => void;
  onRevert?: (id: number) => void;
  variant?: 'default' | 'active' | 'archived' | 'big';
  loading?: boolean;
}

export default function RecordTable({
  records,
  onDelete,
  onEdit,
  onEditRecord,
  onReturnItem,
  onMove,
  onRevert,
  variant = 'default',
  loading = false,
}: RecordTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<Record | null>(null);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [recordToMove, setRecordToMove] = useState<Record | null>(null);
  const [moveTargetCategory, setMoveTargetCategory] = useState<
    'active' | 'archived' | 'big' | null
  >(null);
  const [moveLoading, setMoveLoading] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [recordToReturn, setRecordToReturn] = useState<Record | null>(null);
  const [revertDialogOpen, setRevertDialogOpen] = useState(false);
  const [recordToRevert, setRecordToRevert] = useState<Record | null>(null);

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

  const handleMoveClick = (
    record: Record,
    targetCategory: 'active' | 'archived' | 'big'
  ) => {
    setRecordToMove(record);
    setMoveTargetCategory(targetCategory);
    setMoveDialogOpen(true);
  };

  const handleMoveConfirm = async () => {
    if (recordToMove && moveTargetCategory) {
      setMoveLoading(true);
      try {
        await onMove?.(recordToMove.id, moveTargetCategory);
        setMoveDialogOpen(false);
        setRecordToMove(null);
        setMoveTargetCategory(null);
      } catch (error) {
        // Error handling is done in the parent component
        console.error('Move operation failed:', error);
      } finally {
        setMoveLoading(false);
      }
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

  const handleWhatsAppClick = (mobile: string) => {
    // Remove any non-numeric characters and ensure it starts with country code
    const cleanNumber = mobile.replace(/\D/g, '');
    // If number doesn't start with country code, assume India (+91)
    const whatsappNumber = cleanNumber.startsWith('91')
      ? cleanNumber
      : `91${cleanNumber}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleReturnItemClick = (record: Record) => {
    setRecordToReturn(record);
    setReturnModalOpen(true);
  };

  const handleReturnConfirm = async (returnedAmount: number) => {
    if (recordToReturn) {
      await onReturnItem?.(recordToReturn.id, returnedAmount);
      setReturnModalOpen(false);
      setRecordToReturn(null);
    }
  };

  const handleRevertClick = (record: Record) => {
    setRecordToRevert(record);
    setRevertDialogOpen(true);
  };

  const handleRevertConfirm = () => {
    if (recordToRevert) {
      onRevert?.(recordToRevert.id);
      setRevertDialogOpen(false);
      setRecordToRevert(null);
    }
  };
  return (
    <div className="w-full overflow-x-auto">
      <div className="rounded-md border sm:mx-0">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[60px]">SL No</TableHead>
              <TableHead className="min-w-[80px]">Date</TableHead>
              <TableHead className="min-w-[100px]">Name</TableHead>
              <TableHead className="min-w-[100px]">Mobile</TableHead>
              <TableHead className="hidden min-w-[80px] sm:table-cell">
                Place
              </TableHead>
              <TableHead className="min-w-[60px]">Type</TableHead>
              <TableHead className="min-w-[70px] text-right">Weight</TableHead>
              <TableHead className="min-w-[90px] text-right">Amount</TableHead>
              <TableHead className="hidden min-w-[60px] text-right md:table-cell">
                Interest
              </TableHead>
              <TableHead className="min-w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? // Show loading skeleton rows
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell className="min-w-[60px]">
                      <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                    </TableCell>
                    <TableCell className="hidden min-w-[80px] sm:table-cell">
                      <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                    </TableCell>
                    <TableCell className="min-w-[60px]">
                      <div className="h-4 w-12 animate-pulse rounded bg-muted"></div>
                    </TableCell>
                    <TableCell className="min-w-[70px] text-right">
                      <div className="ml-auto h-4 w-14 animate-pulse rounded bg-muted"></div>
                    </TableCell>
                    <TableCell className="min-w-[90px] text-right">
                      <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted"></div>
                    </TableCell>
                    <TableCell className="hidden min-w-[60px] text-right md:table-cell">
                      <div className="ml-auto h-4 w-14 animate-pulse rounded bg-muted"></div>
                    </TableCell>
                    <TableCell className="min-w-[80px] text-right">
                      <div className="ml-auto h-4 w-8 animate-pulse rounded bg-muted"></div>
                    </TableCell>
                  </TableRow>
                ))
              : records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="min-w-[60px] font-medium">
                      {record.slNo}
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      {format(new Date(record.date), 'dd-MMM-yyyy')}
                    </TableCell>
                    <TableCell className="min-w-[100px] font-medium">
                      {record.name}
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <div className="flex items-center gap-2">
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
                        <button
                          onClick={() => handleWhatsAppClick(record.mobile)}
                          className="text-green-600 transition-colors hover:text-green-800"
                          title="Send WhatsApp message"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="hidden min-w-[80px] sm:table-cell">
                      {record.place}
                    </TableCell>
                    <TableCell className="min-w-[60px]">
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
                    <TableCell className="min-w-[70px] text-right">
                      {record.weightGrams}g
                    </TableCell>
                    <TableCell className="min-w-[90px] text-right">
                      ₹{record.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden min-w-[60px] text-right md:table-cell">
                      {record.interest}%
                    </TableCell>
                    <TableCell className="min-w-[80px] text-right">
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
                          {record.isReturned ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => onEditRecord?.(record)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Record
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onEdit?.(record)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Return
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRevertClick(record)}
                                className="text-orange-600 focus:text-orange-600"
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Revert
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem onClick={() => onEdit?.(record)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {!record.isReturned && (
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(record)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                          {!record.isReturned && <DropdownMenuSeparator />}
                          {!record.isReturned && (
                            <DropdownMenuItem
                              onClick={() => handleReturnItemClick(record)}
                              className="text-green-600 focus:text-green-600"
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Return Item
                            </DropdownMenuItem>
                          )}
                          {!record.isReturned && moveOptions.length > 0 && (
                            <>
                              <DropdownMenuSeparator />
                              {moveOptions.map((option) => (
                                <DropdownMenuItem
                                  key={option.value}
                                  onClick={() =>
                                    handleMoveClick(record, option.value)
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
                    <div className="mt-1 flex items-center gap-2">
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
                      <button
                        onClick={() =>
                          handleWhatsAppClick(recordToDelete.mobile)
                        }
                        className="text-green-600 transition-colors hover:text-green-800"
                        title="Send WhatsApp message"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Item:
                    </span>
                    <p className="font-medium">{recordToDelete.item || '-'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Item Type:
                    </span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          recordToDelete.itemType === 'Gold'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-400 text-white'
                        }`}
                      >
                        {recordToDelete.itemType}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Weight:
                    </span>
                    <p className="font-medium">{recordToDelete.weightGrams}g</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Amount:
                    </span>
                    <p className="font-medium">
                      ₹{recordToDelete.amount.toLocaleString()}
                    </p>
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

        {/* Move Confirmation Dialog */}
        <AlertDialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
          <AlertDialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 sm:h-10 sm:w-10">
                  <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <AlertDialogTitle className="text-base sm:text-lg">
                    Move Record
                  </AlertDialogTitle>
                  <AlertDialogDescription className="mt-1 text-sm sm:mt-2">
                    Are you sure you want to move this record to{' '}
                    <span className="font-semibold capitalize">
                      {moveTargetCategory}
                    </span>
                    ?
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>

            {recordToMove && (
              <div className="my-2 rounded-lg border bg-muted/50 p-3 sm:my-4 sm:p-4">
                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 sm:gap-4">
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Name:
                    </span>
                    <p className="font-medium">{recordToMove.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Mobile:
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() => handleCopyMobile(recordToMove.mobile)}
                        className="flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                        title="Click to copy mobile number"
                      >
                        <Phone className="h-3 w-3" />
                        <a
                          href={`tel:${recordToMove.mobile}`}
                          className="hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {recordToMove.mobile}
                        </a>
                        {copiedNumber === recordToMove.mobile && (
                          <Copy className="h-3 w-3 text-green-600" />
                        )}
                      </button>
                      <button
                        onClick={() => handleWhatsAppClick(recordToMove.mobile)}
                        className="text-green-600 transition-colors hover:text-green-800"
                        title="Send WhatsApp message"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Item Type:
                    </span>
                    <span
                      className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        recordToMove.itemType === 'Gold'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-400 text-white'
                      }`}
                    >
                      {recordToMove.itemType}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Amount:
                    </span>
                    <p className="font-medium">
                      ₹{recordToMove.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-medium text-muted-foreground">
                      Current Category:
                    </span>
                    <span className="ml-2 font-medium capitalize text-blue-600">
                      {recordToMove.itemCategory}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-medium text-muted-foreground">
                      Moving to:
                    </span>
                    <span className="ml-2 font-medium capitalize text-green-600">
                      {moveTargetCategory}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <AlertDialogFooter className="flex-col gap-1 pt-2 sm:flex-row sm:gap-2 sm:pt-0">
              <AlertDialogCancel
                disabled={moveLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleMoveConfirm}
                disabled={moveLoading}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
              >
                {moveLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                {moveLoading ? 'Moving...' : 'Move Record'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Return Item Modal */}
        <ReturnItemModal
          isOpen={returnModalOpen}
          onClose={() => setReturnModalOpen(false)}
          onConfirm={handleReturnConfirm}
          record={recordToReturn}
        />

        {/* Revert Confirmation Dialog */}
        <AlertDialog open={revertDialogOpen} onOpenChange={setRevertDialogOpen}>
          <AlertDialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20 sm:h-10 sm:w-10">
                  <RotateCcw className="h-4 w-4 text-orange-600 dark:text-orange-400 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <AlertDialogTitle className="text-base sm:text-lg">
                    Revert Record
                  </AlertDialogTitle>
                  <AlertDialogDescription className="mt-1 text-sm sm:mt-2">
                    Are you sure you want to revert this record? This will
                    remove the return status and allow the record to be returned
                    again.
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>

            {recordToRevert && (
              <div className="my-2 rounded-lg border bg-muted/50 p-3 sm:my-4 sm:p-4">
                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 sm:gap-4">
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Name:
                    </span>
                    <p className="font-medium">{recordToRevert.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Mobile:
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() => handleCopyMobile(recordToRevert.mobile)}
                        className="flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                        title="Click to copy mobile number"
                      >
                        <Phone className="h-3 w-3" />
                        <a
                          href={`tel:${recordToRevert.mobile}`}
                          className="hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {recordToRevert.mobile}
                        </a>
                        {copiedNumber === recordToRevert.mobile && (
                          <Copy className="h-3 w-3 text-green-600" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleWhatsAppClick(recordToRevert.mobile)
                        }
                        className="text-green-600 transition-colors hover:text-green-800"
                        title="Send WhatsApp message"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Item Type:
                    </span>
                    <p>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          recordToRevert.itemType === 'Gold'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-400 text-white'
                        }`}
                      >
                        {recordToRevert.itemType}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Amount:
                    </span>
                    <p className="font-medium">
                      ₹{recordToRevert.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Returned Amount:
                    </span>
                    <p className="font-medium text-green-600">
                      ₹
                      {recordToRevert.returnedAmount?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Returned Date:
                    </span>
                    <p className="font-medium">
                      {recordToRevert.returnedDate
                        ? format(
                            new Date(recordToRevert.returnedDate),
                            'dd-MMM-yyyy'
                          )
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <AlertDialogFooter className="flex-col gap-1 pt-2 sm:flex-row sm:gap-2 sm:pt-0">
              <AlertDialogCancel className="w-full sm:w-auto">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRevertConfirm}
                className="w-full bg-orange-600 text-white hover:bg-orange-700 sm:w-auto"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Revert Record
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
