import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import RecordForm from '@/components/RecordForm';

export default function NewRecordPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Create New Record</h1>
        <Link href="/records">
          <Button variant="outline">Back to Records</Button>
        </Link>
      </div>

      <RecordForm />
    </div>
  );
}
