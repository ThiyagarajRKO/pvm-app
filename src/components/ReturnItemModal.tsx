'use client';

import React, { useState } from 'react';
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
  } | null;
}

export default function ReturnItemModal({
  isOpen,
  onClose,
  onConfirm,
  record,
}: ReturnItemModalProps) {
  const [returnedAmount, setReturnedAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      toast.success('Item returned successfully');
      onClose();
      setReturnedAmount('');
    } catch (error) {
      toast.error('Failed to return item. Please try again.');
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <RotateCcw className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <DialogTitle>Return Item</DialogTitle>
              <DialogDescription>
                Enter the amount returned for this item.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {record && (
          <div className="my-4 rounded-lg border bg-muted/50 p-4">
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
                <span
                  className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    record.itemType === 'Gold'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-400 text-white'
                  }`}
                >
                  {record.itemType}
                </span>
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
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
