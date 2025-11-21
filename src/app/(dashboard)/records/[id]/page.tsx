'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  ArrowLeft,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  Loader2,
  User,
  Package,
} from 'lucide-react';
import EditRecordPanel from '@/components/EditRecordPanel';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
  daysOld: number;
  amountToBePaid: number | null;
  isReturned?: boolean;
  returnedAmount?: number;
  returnedDate?: string;
}

export default function RecordDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [record, setRecord] = useState<Record | null>(null);
  const [personImageLoading, setPersonImageLoading] = useState(true);
  const [itemImageLoading, setItemImageLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await api.get<Record>(`/records/${params.id}`);
        if (response.error || !response.data) {
          throw new Error(response.error || 'No data received');
        }
        setRecord(response.data);
      } catch (error) {
        console.error('Failed to fetch record:', error);
        toast.error('Failed to load record');
        // Only redirect for non-auth errors (API client handles auth redirects)
        // if (
        //   !error.message?.includes('Authentication') &&
        //   !error.message?.includes('Access denied')
        // ) {
        //   router.push('/records/active');
        // }
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [params.id, router]);

  const handleBackClick = () => {
    router.back();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/records/${params.id}`);
      toast.success('Record deleted successfully');
      router.push('/records/active');
    } catch (error) {
      console.error('Failed to delete record:', error);
      toast.error('Failed to delete record');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleEditClick = () => {
    setEditPanelOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Record not found</p>
      </div>
    );
  }

  return (
    <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-0">
      {/* Mobile Header */}
      <div className="mb-4 block md:hidden">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Record #{record.id}</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-1">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleEditClick}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                {!record.isReturned && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="mb-4 hidden items-center justify-between md:flex">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBackClick}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Records
          </Button>
          <h1 className="text-xl font-semibold">Record #{record.id}</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50">
            <DropdownMenuItem onSelect={handleEditClick}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {!record.isReturned && (
              <DropdownMenuItem
                onSelect={handleDeleteClick}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="mb-4">
                  <Label className="text-sm font-medium text-muted-foreground">
                    SL No
                  </Label>
                  <p className="text-sm font-medium">{record.slNo}</p>
                </div>
                <div className="mb-4">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Name
                  </Label>
                  <p className="text-sm">{record.name}</p>
                </div>
                <div className="mb-4">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Father Name
                  </Label>
                  <p className="text-sm">{record.fatherName}</p>
                </div>
                <div className="mb-4">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Street
                  </Label>
                  <p className="text-sm">{record.street}</p>
                </div>
                <div className="mb-4">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Place
                  </Label>
                  <p className="text-sm">{record.place}</p>
                </div>
                <div className="mb-4">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Mobile
                  </Label>
                  <p className="text-sm">{record.mobile}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Date
                  </Label>
                  <p className="text-sm">
                    {format(new Date(record.date), 'dd-MMM-yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="mb-4">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Item Type
                  </Label>
                  <div
                    className={`flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      record.itemType === 'Gold'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-400 text-white'
                    }`}
                  >
                    {record.itemType}
                  </div>
                </div>
                <div className="mb-4">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Weight (grams)
                  </Label>
                  <p className="text-sm">{record.weightGrams}g</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Amount
                  </Label>
                  <p className="text-sm">₹{record.amount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {record.isReturned ? (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Returned Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="mb-4">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Interest Amount
                    </Label>
                    <p className="text-sm font-medium">
                      ₹
                      {(() => {
                        const months = Math.floor(record.daysOld / 30);
                        const interestMonths = months <= 1 ? 1 : months - 1;
                        return (
                          ((record.amount * record.interest) / 100) *
                          interestMonths
                        ).toLocaleString();
                      })()}
                    </p>
                  </div>
                  <div className="mb-4">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Returned Date
                    </Label>
                    <p className="text-sm">
                      {record.returnedDate
                        ? format(new Date(record.returnedDate), 'dd-MMM-yyyy')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Returned Amount
                    </Label>
                    <p className="text-sm font-medium text-green-600">
                      ₹{record.returnedAmount?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Calculated Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="mb-4">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Interest Percentage
                    </Label>
                    <p className="text-sm font-medium">{record.interest}%</p>
                  </div>
                  <div className="mb-4">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Record Age
                    </Label>
                    <p className="text-sm">
                      {record.daysOld} days / {(record.daysOld / 30).toFixed(1)}{' '}
                      month
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Amount to be Paid
                    </Label>
                    {record.amountToBePaid !== null ? (
                      <p className="text-sm font-medium text-green-600">
                        ₹{record.amountToBePaid.toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Available after 30 days
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Person Image</CardTitle>
            </CardHeader>
            <CardContent>
              {record.personImageUrl ? (
                <div className="relative">
                  {personImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-md bg-muted">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  <img
                    src={record.personImageUrl}
                    alt="Person"
                    className="h-48 w-full rounded-md object-cover"
                    onLoad={() => setPersonImageLoading(false)}
                    onError={() => setPersonImageLoading(false)}
                  />
                </div>
              ) : (
                <div className="flex h-48 w-full items-center justify-center rounded-md bg-muted">
                  <div className="text-center">
                    <User className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No person image
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Item Image</CardTitle>
            </CardHeader>
            <CardContent>
              {record.itemImageUrl ? (
                <div className="relative">
                  {itemImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-md bg-muted">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  <img
                    src={record.itemImageUrl}
                    alt="Item"
                    className="h-48 w-full rounded-md object-cover"
                    onLoad={() => setItemImageLoading(false)}
                    onError={() => setItemImageLoading(false)}
                  />
                </div>
              ) : (
                <div className="flex h-48 w-full items-center justify-center rounded-md bg-muted">
                  <div className="text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No item image
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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

          <div className="my-4 rounded-lg border bg-muted/50 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Name:</span>
                <p className="font-medium">{record.name}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Mobile:
                </span>
                <p className="font-medium">{record.mobile}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Item Type:
                </span>
                <div
                  className={`flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    record.itemType === 'Gold'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-400 text-white'
                  }`}
                >
                  {record.itemType}
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Amount:
                </span>
                <p className="font-medium">₹{record.amount.toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-muted-foreground">
                  Place:
                </span>
                <p className="font-medium">{record.place}</p>
              </div>
            </div>
          </div>

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

      {/* Edit Record Panel */}
      {editPanelOpen && (
        <EditRecordPanel
          record={record}
          onClose={() => setEditPanelOpen(false)}
          onSuccess={() => {
            setEditPanelOpen(false);
            // Refresh record data after successful edit
            const fetchRecord = async () => {
              try {
                const response = await api.get<Record>(`/records/${params.id}`);
                if (response.error || !response.data) {
                  throw new Error(response.error || 'No data received');
                }
                setRecord(response.data);
              } catch (error) {
                console.error('Failed to refresh record:', error);
              }
            };
            fetchRecord();
          }}
        />
      )}
    </div>
  );
}
