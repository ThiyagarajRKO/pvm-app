'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  CheckCircle,
  Archive,
  Star,
  TrendingUp,
  TrendingDown,
  Loader2,
  Coins,
  Scale,
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
  goldWeight?: number;
  goldAmount?: number;
  silverWeight?: number;
  silverAmount?: number;
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
  goldWeight = 0,
  goldAmount = 0,
  silverWeight = 0,
  silverAmount = 0,
  exclude = [],
  loading = false,
}: RecordStatsProps) {
  const recordStats = [
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
      title: 'Active',
      value: activeRecords.toLocaleString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      key: 'archivedRecords',
      title: 'Archived',
      value: archivedRecords.toLocaleString(),
      icon: Archive,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      key: 'bigRecords',
      title: 'Big Items',
      value: bigRecords.toLocaleString(),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  const itemTypeStats = [
    {
      title: 'Gold Items',
      count: goldCount,
      weight: goldWeight,
      amount: goldAmount,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      icon: Star,
    },
    {
      title: 'Silver Items',
      count: silverCount,
      weight: silverWeight,
      amount: silverAmount,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      icon: Coins,
    },
  ];

  const StatCard = ({ stat }: { stat: any }) => {
    const Icon = stat.icon;
    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </p>
              <p className={`text-sm font-semibold ${stat.color}`}>
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
  };

  const ItemTypeCard = ({ item }: { item: any }) => {
    const Icon = item.icon;
    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Icon className={`h-4 w-4 ${item.color}`} />
            {item.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Count</span>
            <span className={`text-sm font-semibold ${item.color}`}>
              {loading ? (
                <Loader2 className="inline h-3 w-3 animate-spin" />
              ) : (
                item.count.toLocaleString()
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Weight</span>
            <span className={`text-sm font-semibold ${item.color}`}>
              {loading ? (
                <Loader2 className="inline h-3 w-3 animate-spin" />
              ) : (
                `${item.weight.toFixed(2)}g`
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Amount</span>
            <span className={`text-sm font-semibold ${item.color}`}>
              {loading ? (
                <Loader2 className="inline h-3 w-3 animate-spin" />
              ) : (
                `₹${item.amount.toLocaleString()}`
              )}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Record Status Overview */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <FileText className="h-5 w-5 text-blue-600" />
          Record Overview
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
          {recordStats
            .filter((s) => !exclude.includes(s.key as any))
            .map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}

          {/* Summary Totals within Record Overview */}
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Total Weight
                  </p>
                  <p className="text-sm font-semibold text-purple-600">
                    {loading ? (
                      <Loader2 className="inline h-6 w-6 animate-spin" />
                    ) : (
                      `${totalWeight.toFixed(2)}g`
                    )}
                  </p>
                </div>
                <div className="rounded-lg bg-purple-50 p-2">
                  <Scale className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Total Amount
                  </p>
                  <p className="text-sm font-semibold text-green-600">
                    {loading ? (
                      <Loader2 className="inline h-6 w-6 animate-spin" />
                    ) : (
                      `₹${totalAmount.toLocaleString()}`
                    )}
                  </p>
                </div>
                <div className="rounded-lg bg-green-50 p-2">
                  <TrendingDown className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Item Type Breakdown */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Scale className="h-5 w-5 text-purple-600" />
          Item Type Breakdown
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {itemTypeStats.map((item, index) => (
            <ItemTypeCard key={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
