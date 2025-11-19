import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import RecordForm from '@/components/RecordForm';
import { ArrowLeft } from 'lucide-react';

export default function EditRecordPage({ params }: { params: { id: string } }) {
  // Mock data - will be replaced with API call
  const record = {
    id: params.id,
    date: '2024-01-15',
    name: 'John Doe',
    fatherName: 'Robert Doe',
    street: 'Main Street',
    place: 'Mumbai',
    weightGrams: 25.5,
    itemType: 'Gold' as const,
    amount: 150000,
    mobile: '9876543210',
    personImageUrl: '/placeholder-person.jpg',
    itemImageUrl: '/placeholder-item.jpg',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/records/${record.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Record
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Edit Record #{record.id}</h1>
        </div>
        <Link href="/records">
          <Button variant="outline">Back to Records</Button>
        </Link>
      </div>

      <RecordForm initialData={record} isEdit={true} recordId={record.id} />
    </div>
  );
}
