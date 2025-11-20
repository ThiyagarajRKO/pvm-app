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
  Loader2,
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
  exclude?: Array<'activeRecords' | 'archivedRecords' | 'bigRecords'>;
  loading?: boolean;
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
  exclude = [],
  loading = false,
}: RecordStatsProps) {
  const stats = [
    {
      key: 'totalRecords',
      title: 'Total Records',
      value: totalRecords.toLocaleString(),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      key: 'activeRecords',
      title: 'Active Records',
      value: activeRecords.toLocaleString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      key: 'archivedRecords',
      title: 'Archived Records',
      value: archivedRecords.toLocaleString(),
      icon: Archive,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      key: 'bigRecords',
      title: 'Big Records',
      value: bigRecords.toLocaleString(),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      key: 'totalWeight',
      title: 'Total Weight',
      value: `${totalWeight.toFixed(2)}g`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      key: 'totalAmount',
      title: 'Total Amount',
      value: `₹${totalAmount.toLocaleString()}`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      key: 'goldCount',
      title: 'Gold Items',
      value: goldCount.toLocaleString(),
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      key: 'silverCount',
      title: 'Silver Items',
      value: silverCount.toLocaleString(),
      icon: FileText,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
    },
  ];

  return (
    // Show stats in a responsive grid
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5">
      {stats
        .filter((s) => !exclude.includes(s.key as any))
        .map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium text-muted-foreground sm:text-sm">
                      {stat.title}
                    </p>
                    <p className={`text-lg font-bold ${stat.color}`}>
                      {loading ? (
                        <Loader2 className="inline h-5 w-5 animate-spin" />
                      ) : (
                        stat.value
                      )}
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
