import React from 'react';
import EditRecordPanel from '@/components/EditRecordPanel';

interface Record {
  id: number;
  date: string;
  name: string;
  fatherName: string;
  street: string;
  place: string;
  itemType: 'Gold' | 'Silver' | 'Both';
  itemCategory: 'active' | 'archived' | 'big';
  amount: number;
  mobile: string;
  personImageUrl?: string;
  itemImageUrl?: string;
  itemReturnImageUrl?: string;
}

export default async function EditRecordPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch record data
  const response = await fetch(
    `http://localhost:3000/api/records/${params.id}`,
    {
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch record');
  }

  const record: Record = await response.json();

  return <EditRecordPanel record={record} />;
}
