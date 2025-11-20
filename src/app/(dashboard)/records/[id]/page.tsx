'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
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
  RotateCcw,
} from 'lucide-react';
import EditRecordPanel from '@/components/EditRecordPanel';

export default function RecordDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // TODO: Implement delete functionality
    console.log('Delete record:', params.id);
    setDeleteDialogOpen(false);
  };

  const handleEditClick = () => {
    setEditPanelOpen(true);
  };

  const handleReturnItemClick = () => {
    console.log('Return item for record:', params.id);
    // TODO: Implement return item functionality
  };

  // Mock data - will be replaced with API call
  const record = {
    id: Number(params.id),
    slNo: 'SL001',
    date: '2024-01-15',
    name: 'John Doe',
    fatherName: 'Robert Doe',
    street: 'Main Street',
    place: 'Mumbai',
    weightGrams: 25.5,
    itemType: 'Gold' as const,
    itemCategory: 'active' as const,
    amount: 150000,
    mobile: '9876543210',
    personImageUrl: '/placeholder-person.jpg',
    itemImageUrl: '/placeholder-item.jpg',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  };

  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="block md:hidden">
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
                <Button
                  variant="ghost"
                  className="w-full justify-start text-green-600 hover:text-green-600"
                  onClick={handleReturnItemClick}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Return Item
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden items-center justify-between md:flex">
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
            <DropdownMenuItem
              onSelect={handleReturnItemClick}
              className="text-green-600 focus:text-green-600"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Return Item
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={handleDeleteClick}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    SL No
                  </Label>
                  <p className="text-sm font-medium">{record.slNo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Name
                  </Label>
                  <p className="text-sm">{record.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Father Name
                  </Label>
                  <p className="text-sm">{record.fatherName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Street
                  </Label>
                  <p className="text-sm">{record.street}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Place
                  </Label>
                  <p className="text-sm">{record.place}</p>
                </div>
                <div>
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
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Item Type
                  </Label>
                  <Badge
                    variant={
                      record.itemType === 'Gold' ? 'default' : 'secondary'
                    }
                  >
                    {record.itemType}
                  </Badge>
                </div>
                <div>
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
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Person Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={record.personImageUrl}
                alt="Person"
                className="h-48 w-full rounded-md object-cover"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Item Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={record.itemImageUrl}
                alt="Item"
                className="h-48 w-full rounded-md object-cover"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Return Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="returnImage">Upload Return Image</Label>
              <Input id="returnImage" type="file" accept="image/*" />
              <Button className="w-full">Upload Return Image</Button>
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
                <Badge
                  variant={record.itemType === 'Gold' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {record.itemType}
                </Badge>
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
            // TODO: Refresh record data after successful edit
          }}
        />
      )}
    </div>
  );
}
