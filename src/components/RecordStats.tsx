'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  CheckCircle,
  Archive,
  Star,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface RecordStatsProps {
  totalRecords: number;
  activeRecords: number;
  archivedRecords: number;
  bigRecords: number;
  totalWeight: number;
  totalAmount: number;
  goldCount: number;
  silverCount: number;
}

export default function RecordStats({
  totalRecords,
  activeRecords,
  archivedRecords,
  bigRecords,
  totalWeight,
  totalAmount,
  goldCount,
  silverCount,
}: RecordStatsProps) {
  const stats = [
    {
      title: 'Total Records',
      value: totalRecords.toLocaleString(),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Records',
      value: activeRecords.toLocaleString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Archived Records',
      value: archivedRecords.toLocaleString(),
      icon: Archive,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      title: 'Big Records',
      value: bigRecords.toLocaleString(),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Total Weight',
      value: `${totalWeight.toFixed(2)}g`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Amount',
      value: `₹${totalAmount.toLocaleString()}`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Gold Items',
      value: goldCount.toLocaleString(),
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Silver Items',
      value: silverCount.toLocaleString(),
      icon: FileText,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
