'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import MobileBottomSheet from './MobileBottomSheet';

interface ReturnItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (returnedAmount: number) => Promise<void>;
  record: {
    id: number;
    name: string;
    item?: string | null;
    itemType: 'Gold' | 'Silver';
    amount: number;
    weightGrams: number;
    interest: number;
    daysOld: number;
    monthsOld?: number;
    calculatedInterestAmount?: number;
    calculatedTotalAmount?: number;
    interestMonths?: number;
    isReturned?: boolean;
    returnedAmount?: number;
  } | null;
  mode?: 'return' | 'edit';
}

export default function ReturnItemModal({
  isOpen,
  onClose,
  onConfirm,
  record,
  mode = 'return',
}: ReturnItemModalProps) {
  const [returnedAmount, setReturnedAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Use the calculated amounts from the backend API
  const calculateAmounts = () => {
    if (!record)
      return {
        months: 0,
        interestMonths: 0,
        interestAmount: 0,
        totalAmount: 0,
      };

    return {
      months: Math.floor(record.daysOld / 30),
      interestMonths: record.interestMonths || 0,
      interestAmount: record.calculatedInterestAmount || 0,
      totalAmount: record.calculatedTotalAmount || 0,
    };
  };

  const amounts = calculateAmounts();

  // Pre-fill the returned amount
  useEffect(() => {
    if (record) {
      if (mode === 'edit' && record.returnedAmount) {
        // For editing, use existing returned amount
        setReturnedAmount(record.returnedAmount.toString());
      } else if (mode === 'return' && amounts.totalAmount > 0) {
        // For returning, use calculated total amount
        setReturnedAmount(amounts.totalAmount.toString());
      }
    }
  }, [record, amounts.totalAmount, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!returnedAmount.trim()) {
      toast.error('Please enter the returned amount');
      return;
    }

    const amount = parseFloat(returnedAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(amount);
      toast.success(
        mode === 'edit'
          ? 'Returned amount updated successfully'
          : 'Item returned successfully'
      );
      onClose();
      setReturnedAmount('');
    } catch (error) {
      toast.error(
        mode === 'edit'
          ? 'Failed to update returned amount'
          : 'Failed to return item. Please try again.'
      );
      console.error('Return item error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setReturnedAmount('');
    }
  };

  const modalContent = (
    <>
      {record && (
        <div className="space-y-4">
          {mode === 'return' && (
            /* Calculated Amounts - only show for return mode */
            <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-900/10">
              <h4 className="mb-3 text-sm font-medium text-blue-800 dark:text-blue-200">
                Calculated Return Amount
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">
                    Interest Rate & Months:
                  </span>
                  <p className="font-medium">
                    {record.interest}% for {amounts.interestMonths} month
                    {amounts.interestMonths !== 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Record Age:
                  </span>
                  <p className="font-medium">
                    {record.daysOld} days / {(record.daysOld / 30).toFixed(1)}{' '}
                    months
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Interest Amount:
                  </span>
                  <p className="font-medium text-green-600">
                    ₹{amounts.interestAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Total Amount to Pay:
                  </span>
                  <p className="font-bold text-blue-600">
                    ₹{amounts.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {mode === 'edit' && record.returnedAmount && (
            /* Current Returned Amount - only show for edit mode */
            <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-900/10">
              <h4 className="mb-3 text-sm font-medium text-green-800 dark:text-green-200">
                Current Returned Amount
              </h4>
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">
                  Previously Returned:
                </span>
                <p className="font-bold text-green-600">
                  ₹{record.returnedAmount.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Record Info */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-3 text-sm font-medium">Record Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Name:</span>
                <p className="font-medium">{record.name}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Item:</span>
                <p className="font-medium">{record.item || '-'}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Type:</span>
                <p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      record.itemType === 'Gold'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-400 text-white'
                    }`}
                  >
                    {record.itemType}
                  </span>
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Weight:
                </span>
                <p className="font-medium">{record.weightGrams}g</p>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-muted-foreground">
                  Original Amount:
                </span>
                <p className="font-medium">₹{record.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const formFooter = (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="returnedAmount">Returned Amount (₹)</Label>
          <Input
            id="returnedAmount"
            type="number"
            step="0.01"
            placeholder="Enter returned amount"
            value={returnedAmount}
            onChange={(e) => setReturnedAmount(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'edit' ? 'Updating...' : 'Returning...'}
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                {mode === 'edit' ? 'Update Amount' : 'Return Item'}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <MobileBottomSheet
        open={isOpen}
        onDismiss={handleClose}
        title={mode === 'edit' ? 'Edit Returned Amount' : 'Return Item'}
        description={
          mode === 'edit'
            ? 'Update the returned amount for this item.'
            : 'Enter the amount returned for this item.'
        }
        descriptionIcon={
          <RotateCcw className="h-5 w-5 text-green-600 dark:text-green-400" />
        }
        footer={formFooter}
      >
        {modalContent}
      </MobileBottomSheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-[425px]">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <RotateCcw className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <DialogTitle>
                {mode === 'edit' ? 'Edit Returned Amount' : 'Return Item'}
              </DialogTitle>
              <DialogDescription>
                {mode === 'edit'
                  ? 'Update the returned amount for this item.'
                  : 'Enter the amount returned for this item.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {record && (
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {/* Calculated Amounts */}
            <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-900/10">
              <h4 className="mb-3 text-sm font-medium text-blue-800 dark:text-blue-200">
                Calculated Return Amount
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">
                    Interest Rate & Months:
                  </span>
                  <p className="font-medium">
                    {record.interest}% for {amounts.interestMonths} month
                    {amounts.interestMonths !== 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Record Age:
                  </span>
                  <p className="font-medium">
                    {record.daysOld} days / {(record.daysOld / 30).toFixed(1)}{' '}
                    months
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Interest Amount:
                  </span>
                  <p className="font-medium text-green-600">
                    ₹{amounts.interestAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Total Amount to Pay:
                  </span>
                  <p className="font-bold text-blue-600">
                    ₹{amounts.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Record Info */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-3 text-sm font-medium">Record Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">
                    Name:
                  </span>
                  <p className="font-medium">{record.name}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Item:
                  </span>
                  <p className="font-medium">{record.item || '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Type:
                  </span>
                  <p>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        record.itemType === 'Gold'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-400 text-white'
                      }`}
                    >
                      {record.itemType}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Weight:
                  </span>
                  <p className="font-medium">{record.weightGrams}g</p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-muted-foreground">
                    Original Amount:
                  </span>
                  <p className="font-medium">
                    ₹{record.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-shrink-0">
          <div className="grid gap-4 py-4 pt-1">
            <div className="grid gap-2">
              <Label htmlFor="returnedAmount">Returned Amount (₹)</Label>
              <Input
                id="returnedAmount"
                type="number"
                step="0.01"
                placeholder="Enter returned amount"
                value={returnedAmount}
                onChange={(e) => setReturnedAmount(e.target.value)}
                disabled={isSubmitting}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Returning...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Return Item
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
