'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle,
  BarChart3,
  Star,
  Bell,
  RefreshCw,
  XCircle,
  ArrowRight,
  FileText,
  Gem,
  Scale,
  Archive,
  RotateCcw,
} from 'lucide-react';
import { api } from '@/lib/api-client';

// Types for dashboard data
interface DashboardStats {
  overview: {
    totalRecords: number;
    totalGoldCount: number;
    totalSilverCount: number;
    totalGoldWeight: number;
    totalSilverWeight: number;
    totalGoldAmount: number;
    totalSilverAmount: number;
    totalWeightGrams: number;
    totalAmount: number;
    averageWeight: number;
    averageAmount: number;
  };
  returned: {
    totalRecords: number;
    totalGoldCount: number;
    totalSilverCount: number;
    totalAmount: number;
    totalWeightGrams: number;
  };
  categories: {
    active: number;
    archived: number;
    big: number;
  };
  currentMonth: {
    records: number;
    weight: number;
    amount: number;
    goldCount: number;
    silverCount: number;
  };
  trends: {
    monthly: {
      records: number;
      weight: number;
      amount: number;
    };
    yearly: {
      records: number;
      weight: number;
      amount: number;
    };
  };
}

interface RecentRecord {
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
  personImageUrl?: string | null;
  itemImageUrl?: string | null;
  createdAt: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentRecords: RecentRecord[];
}

const quickActions = [
  // {
  //   title: 'Search Records',
  //   description: 'Find and filter records quickly',
  //   icon: Eye,
  //   color: 'text-indigo-600',
  //   href: '/records/search',
  // },
  {
    title: 'Active Records',
    description: 'View all active records',
    icon: CheckCircle,
    color: 'text-blue-600',
    href: '/records/active',
  },
  {
    title: 'Archived Records',
    description: 'View archived records',
    icon: Archive,
    color: 'text-orange-600',
    href: '/records/archived',
  },
  {
    title: 'Big Records',
    description: 'View high-value records',
    icon: TrendingUp,
    color: 'text-purple-600',
    href: '/records/big',
  },
  {
    title: 'Returned Records',
    description: 'View returned items',
    icon: RotateCcw,
    color: 'text-green-600',
    href: '/records/returned',
  },
  {
    title: 'Generate Report',
    description: 'Create detailed analytics report',
    icon: BarChart3,
    color: 'text-teal-600',
    href: '/reports/generate',
  },
];

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await api.get<DashboardData>('/dashboard');
      if (response.error) {
        setError(response.error);
      } else {
        setDashboardData(response.data!);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatWeight = (weight: number) => {
    if (weight == null) return '0.0g';
    return `${weight.toFixed(1)}g`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading && !dashboardData) {
    return (
      <div className="space-y-4 p-1">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200 sm:h-7"></div>
            <div className="mt-1 h-4 w-64 animate-pulse rounded bg-gray-200 sm:h-5"></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200 sm:w-24"></div>
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200 sm:w-24"></div>
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200 sm:w-24"></div>
          </div>
        </div>

        {/* Overview Stats Skeleton */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="transition-shadow hover:shadow-md">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-2 h-3 w-20 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
                  </div>
                  <div className="h-6 w-6 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="mt-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Record Status Breakdown Skeleton */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="transition-shadow hover:shadow-md">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-2 h-3 w-16 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-6 w-12 animate-pulse rounded bg-gray-200"></div>
                  </div>
                  <div className="h-5 w-5 animate-pulse rounded bg-gray-200"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Month Performance Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-5 w-5 animate-pulse rounded bg-gray-200"></div>
              <div className="h-6 w-40 animate-pulse rounded bg-gray-200"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto mb-2 h-6 w-12 animate-pulse rounded bg-gray-200"></div>
                  <div className="mx-auto mb-1 h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                  <div className="mx-auto h-3 w-20 animate-pulse rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Returned Records Summary Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-5 w-5 animate-pulse rounded bg-gray-200"></div>
              <div className="h-6 w-40 animate-pulse rounded bg-gray-200"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto mb-2 h-6 w-12 animate-pulse rounded bg-gray-200"></div>
                  <div className="mx-auto mb-1 h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                  <div className="mx-auto h-3 w-20 animate-pulse rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Recent Records Skeleton */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
                <div className="h-5 w-16 animate-pulse rounded bg-gray-200"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="relative flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                  >
                    {/* Category Badge Skeleton - Top Right on Mobile Only */}
                    <div className="absolute right-2 top-2 h-5 w-12 animate-pulse rounded bg-gray-200 sm:hidden"></div>

                    <div className="flex items-center gap-3 pr-16 sm:pr-0">
                      <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200"></div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="h-3 w-12 animate-pulse rounded bg-gray-200"></div>
                          <div className="h-3 w-16 animate-pulse rounded bg-gray-200"></div>
                          {/* Category Badge Skeleton - Inline on Desktop/Tablet */}
                          <div className="hidden h-4 w-14 animate-pulse rounded bg-gray-200 sm:block"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
                      <div className="h-4 w-8 animate-pulse rounded bg-gray-200"></div>
                      <div className="mt-1 h-3 w-16 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Skeleton */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex h-auto w-full items-center justify-start rounded-md border p-3"
                  >
                    <div className="mr-3 h-3 w-3 animate-pulse rounded bg-gray-200"></div>
                    <div className="flex-1 text-left">
                      <div className="mb-1 h-3 w-24 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-3 w-32 animate-pulse rounded bg-gray-200"></div>
                    </div>
                    <div className="ml-auto h-3 w-3 animate-pulse rounded bg-gray-200"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto h-8 w-8 text-red-600" />
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <Button
            onClick={() => fetchDashboardData()}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { stats, recentRecords } = dashboardData;

  return (
    <div className="space-y-4 p-1 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
            Records Dashboard
          </h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Overview of your pawn records and management statistics.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboardData(true)}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className="mr-1 h-3 w-3 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <BarChart3 className="mr-1 h-3 w-3 sm:mr-2" />
            <span className="hidden sm:inline">Reports</span>
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none">
            <Bell className="mr-1 h-3 w-3 sm:mr-2" />
            <span className="hidden sm:inline">Notifications</span>
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Total Records
                </p>
                <p className="text-base font-semibold text-blue-600">
                  {refreshing ? (
                    <RefreshCw className="inline h-5 w-5 animate-spin" />
                  ) : (
                    stats.overview.totalRecords.toLocaleString()
                  )}
                </p>
              </div>
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mt-2">
              <span
                className={`text-xs ${stats.trends.yearly.records >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {refreshing ? (
                  <RefreshCw className="inline h-3 w-3 animate-spin" />
                ) : (
                  `${formatPercentage(stats.trends.yearly.records)} from last year`
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Total Value
                </p>
                <p className="text-sm font-semibold text-green-600">
                  {refreshing ? (
                    <RefreshCw className="inline h-5 w-5 animate-spin" />
                  ) : (
                    formatCurrency(stats.overview.totalAmount)
                  )}
                </p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="mt-2">
              <span
                className={`text-xs ${stats.trends.yearly.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {refreshing ? (
                  <RefreshCw className="inline h-3 w-3 animate-spin" />
                ) : (
                  `${formatPercentage(stats.trends.yearly.amount)} from last year`
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Total Weight
                </p>
                <p className="text-sm font-semibold text-yellow-600">
                  {refreshing ? (
                    <RefreshCw className="inline h-5 w-5 animate-spin" />
                  ) : (
                    formatWeight(stats.overview.totalWeightGrams)
                  )}
                </p>
              </div>
              <Scale className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="mt-2">
              <span
                className={`text-xs ${stats.trends.yearly.weight >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {refreshing ? (
                  <RefreshCw className="inline h-3 w-3 animate-spin" />
                ) : (
                  `${formatPercentage(stats.trends.yearly.weight)} from last year`
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Gold / Silver
                </p>
                <p className="text-sm font-semibold text-purple-600">
                  {refreshing ? (
                    <RefreshCw className="inline h-5 w-5 animate-spin" />
                  ) : (
                    `${stats.overview.totalGoldCount} / ${stats.overview.totalSilverCount}`
                  )}
                </p>
              </div>
              <Gem className="h-6 w-6 text-purple-600" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-600">
                Item type distribution
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Item Type Breakdown */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Scale className="h-5 w-5 text-purple-600" />
          Item Type Breakdown
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Gold Items */}
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg bg-yellow-200 p-2">
                <Star className="h-5 w-5 text-yellow-700" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-yellow-800">
                  Gold Items
                </h3>
                <p className="text-xs text-yellow-600">
                  {stats.overview.totalGoldCount.toLocaleString()} records
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-yellow-700">Count</span>
                <span className="text-sm font-semibold text-yellow-800">
                  {refreshing ? (
                    <RefreshCw className="inline h-4 w-4 animate-spin" />
                  ) : (
                    stats.overview.totalGoldCount.toLocaleString()
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-yellow-700">Total Weight</span>
                <span className="text-sm font-semibold text-yellow-800">
                  {refreshing ? (
                    <RefreshCw className="inline h-4 w-4 animate-spin" />
                  ) : (
                    formatWeight(stats.overview.totalGoldWeight)
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-yellow-700">Total Amount</span>
                <span className="text-sm font-semibold text-yellow-800">
                  {refreshing ? (
                    <RefreshCw className="inline h-4 w-4 animate-spin" />
                  ) : (
                    formatCurrency(stats.overview.totalGoldAmount)
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Silver Items */}
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg bg-gray-200 p-2">
                <Scale className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Silver Items
                </h3>
                <p className="text-xs text-gray-600">
                  {stats.overview.totalSilverCount.toLocaleString()} records
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">Count</span>
                <span className="text-sm font-semibold text-gray-800">
                  {refreshing ? (
                    <RefreshCw className="inline h-4 w-4 animate-spin" />
                  ) : (
                    stats.overview.totalSilverCount.toLocaleString()
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">Total Weight</span>
                <span className="text-sm font-semibold text-gray-800">
                  {refreshing ? (
                    <RefreshCw className="inline h-4 w-4 animate-spin" />
                  ) : (
                    formatWeight(stats.overview.totalSilverWeight)
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">Total Amount</span>
                <span className="text-sm font-semibold text-gray-800">
                  {refreshing ? (
                    <RefreshCw className="inline h-4 w-4 animate-spin" />
                  ) : (
                    formatCurrency(stats.overview.totalSilverAmount)
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Record Status Breakdown */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Active
                </p>
                <p className="text-base font-semibold text-green-600">
                  {refreshing ? (
                    <RefreshCw className="inline h-5 w-5 animate-spin" />
                  ) : (
                    stats.categories.active.toLocaleString()
                  )}
                </p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Returned
                </p>
                <p className="text-base font-semibold text-blue-600">
                  {refreshing ? (
                    <RefreshCw className="inline h-5 w-5 animate-spin" />
                  ) : (
                    stats.returned.totalRecords.toLocaleString()
                  )}
                </p>
              </div>
              <RotateCcw className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Archived
                </p>
                <p className="text-base font-semibold text-orange-600">
                  {refreshing ? (
                    <RefreshCw className="inline h-5 w-5 animate-spin" />
                  ) : (
                    stats.categories.archived.toLocaleString()
                  )}
                </p>
              </div>
              <Archive className="h-5 w-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Big Records
                </p>
                <p className="text-base font-semibold text-purple-600">
                  {refreshing ? (
                    <RefreshCw className="inline h-5 w-5 animate-spin" />
                  ) : (
                    stats.categories.big.toLocaleString()
                  )}
                </p>
              </div>
              <Star className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Month Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-5 w-5" />
            This Month Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-base font-semibold text-blue-600">
                {refreshing ? (
                  <RefreshCw className="inline h-5 w-5 animate-spin" />
                ) : (
                  stats.currentMonth.records
                )}
              </p>
              <p className="text-sm text-gray-600">Records</p>
              <p
                className={`text-xs ${stats.trends.monthly.records >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {refreshing ? (
                  <RefreshCw className="inline h-3 w-3 animate-spin" />
                ) : (
                  `${formatPercentage(stats.trends.monthly.records)} vs last month`
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-green-600">
                {refreshing ? (
                  <RefreshCw className="inline h-5 w-5 animate-spin" />
                ) : (
                  formatCurrency(stats.currentMonth.amount)
                )}
              </p>
              <p className="text-sm text-gray-600">Total Value</p>
              <p
                className={`text-xs ${stats.trends.monthly.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {refreshing ? (
                  <RefreshCw className="inline h-3 w-3 animate-spin" />
                ) : (
                  `${formatPercentage(stats.trends.monthly.amount)} vs last month`
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-yellow-600">
                {refreshing ? (
                  <RefreshCw className="inline h-5 w-5 animate-spin" />
                ) : (
                  formatWeight(stats.currentMonth.weight)
                )}
              </p>
              <p className="text-sm text-gray-600">Total Weight</p>
              <p
                className={`text-xs ${stats.trends.monthly.weight >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {refreshing ? (
                  <RefreshCw className="inline h-3 w-3 animate-spin" />
                ) : (
                  `${formatPercentage(stats.trends.monthly.weight)} vs last month`
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-600">
                {refreshing ? (
                  <RefreshCw className="inline h-5 w-5 animate-spin" />
                ) : (
                  `${stats.currentMonth.goldCount}G / ${stats.currentMonth.silverCount}S`
                )}
              </p>
              <p className="text-sm text-gray-600">Gold/Silver</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Returned Records Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <RotateCcw className="h-5 w-5" />
            Returned Records Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-base font-semibold text-blue-600">
                {refreshing ? (
                  <RefreshCw className="inline h-5 w-5 animate-spin" />
                ) : (
                  stats.returned.totalRecords
                )}
              </p>
              <p className="text-sm text-gray-600">Total Returned</p>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-green-600">
                {refreshing ? (
                  <RefreshCw className="inline h-5 w-5 animate-spin" />
                ) : (
                  formatCurrency(stats.returned.totalAmount)
                )}
              </p>
              <p className="text-sm text-gray-600">Returned Value</p>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-yellow-600">
                {refreshing ? (
                  <RefreshCw className="inline h-5 w-5 animate-spin" />
                ) : (
                  formatWeight(stats.returned.totalWeightGrams)
                )}
              </p>
              <p className="text-sm text-gray-600">Returned Weight</p>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-600">
                {refreshing ? (
                  <RefreshCw className="inline h-5 w-5 animate-spin" />
                ) : (
                  `${stats.returned.totalGoldCount}G / ${stats.returned.totalSilverCount}S`
                )}
              </p>
              <p className="text-sm text-gray-600">Gold/Silver</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent Records */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm">
              Recent Records
              <Badge variant="outline">Latest</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {refreshing ? (
              <div className="space-y-3 sm:space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="relative flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                  >
                    {/* Category Badge Skeleton - Top Right on Mobile Only */}
                    <div className="absolute right-2 top-2 h-5 w-12 animate-pulse rounded bg-gray-200 sm:hidden"></div>

                    <div className="flex items-center gap-3 pr-16 sm:pr-0">
                      <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200"></div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="h-3 w-12 animate-pulse rounded bg-gray-200"></div>
                          <div className="h-3 w-16 animate-pulse rounded bg-gray-200"></div>
                          {/* Category Badge Skeleton - Inline on Desktop/Tablet */}
                          <div className="hidden h-4 w-14 animate-pulse rounded bg-gray-200 sm:block"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
                      <div className="h-4 w-8 animate-pulse rounded bg-gray-200"></div>
                      <div className="mt-1 h-3 w-16 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {recentRecords.map((record) => (
                  <div
                    key={record.id}
                    className="relative flex flex-col gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                  >
                    {/* Category Badge - Top Right on Mobile Only */}
                    <div className="absolute right-2 top-2 sm:hidden">
                      <Badge
                        variant={
                          record.itemCategory === 'active'
                            ? 'default'
                            : 'secondary'
                        }
                        className="text-xs"
                      >
                        {record.itemCategory}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 pr-16 sm:pr-0">
                      <div
                        className={`rounded-lg p-2 ${record.itemType === 'Gold' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {record.itemType === 'Gold' ? (
                          <Gem className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <Scale className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold">
                          {record.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 sm:gap-3">
                          <span>{formatWeight(record.weightGrams)}</span>
                          <span>{formatCurrency(record.amount)}</span>
                          {/* Category Badge - Inline on Desktop/Tablet */}
                          <Badge
                            variant={
                              record.itemCategory === 'active'
                                ? 'default'
                                : 'secondary'
                            }
                            className="hidden text-xs sm:inline-flex"
                          >
                            {record.itemCategory}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
                      <div className="text-sm font-semibold">
                        #{record.slNo}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                {recentRecords.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No records found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Record Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={`h-auto w-full justify-start p-3 ${action.color}`}
                    onClick={() => (window.location.href = action.href)}
                  >
                    <Icon className="mr-3 h-3 w-3" />
                    <div className="text-left">
                      <div className="text-xs font-medium">{action.title}</div>
                      <div className="text-xs opacity-70">
                        {action.description}
                      </div>
                    </div>
                    <ArrowRight className="ml-auto h-3 w-3" />
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
