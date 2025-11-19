import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

export default function RecordDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Mock data - will be replaced with API call
  const record = {
    id: params.id,
    date: '2024-01-15',
    name: 'John Doe',
    fatherName: 'Robert Doe',
    street: 'Main Street',
    place: 'Mumbai',
    weightGrams: 25.5,
    itemType: 'Gold',
    amount: 150000,
    mobile: '9876543210',
    personImageUrl: '/placeholder-person.jpg',
    itemImageUrl: '/placeholder-item.jpg',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/records">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Records
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Record #{record.id}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/records/${record.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
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
    </div>
  );
}
