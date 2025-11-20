'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  Building2,
  Car,
  UserCheck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Star,
  MessageSquare,
  Bell,
  Activity,
  Globe,
  Shield,
  Zap,
  RefreshCw,
  Database,
  CloudCog,
  Trash2,
  XCircle,
  ArrowRight,
  FileText,
  TrendingUpIcon,
  Gem,
  Scale,
  Archive,
  Plus,
  Download,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api-client';

// Types for dashboard data
interface DashboardStats {
  overview: {
    totalRecords: number;
    totalGoldCount: number;
    totalSilverCount: number;
    totalWeightGrams: number;
    totalAmount: number;
    averageWeight: number;
    averageAmount: number;
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
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
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
    return `${weight.toFixed(1)}g`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
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
            onClick={fetchDashboardData}
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
    <div className="space-y-4 p-1">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
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
            onClick={fetchDashboardData}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className="mr-1 h-3 w-3 sm:mr-2" />
            <span className="xs:inline hidden">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <BarChart3 className="mr-1 h-3 w-3 sm:mr-2" />
            <span className="xs:inline hidden">Reports</span>
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none">
            <Bell className="mr-1 h-3 w-3 sm:mr-2" />
            <span className="xs:inline hidden">Alerts</span>
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
                <p className="text-xl font-bold text-blue-600">
                  {stats.overview.totalRecords.toLocaleString()}
                </p>
              </div>
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mt-2">
              <span
                className={`text-sm ${stats.trends.yearly.records >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {formatPercentage(stats.trends.yearly.records)} from last year
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
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(stats.overview.totalAmount)}
                </p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="mt-2">
              <span
                className={`text-sm ${stats.trends.yearly.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {formatPercentage(stats.trends.yearly.amount)} from last year
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
                <p className="text-xl font-bold text-yellow-600">
                  {formatWeight(stats.overview.totalWeightGrams)}
                </p>
              </div>
              <Scale className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="mt-2">
              <span
                className={`text-sm ${stats.trends.yearly.weight >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {formatPercentage(stats.trends.yearly.weight)} from last year
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Average Value
                </p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(stats.overview.averageAmount)}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Active Records
                </p>
                <p className="text-xl font-bold text-green-600">
                  {stats.categories.active.toLocaleString()}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Archived Records
                </p>
                <p className="text-xl font-bold text-orange-600">
                  {stats.categories.archived.toLocaleString()}
                </p>
              </div>
              <Archive className="h-6 w-6 text-orange-600" />
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
                <p className="text-xl font-bold text-purple-600">
                  {stats.categories.big.toLocaleString()}
                </p>
              </div>
              <Star className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Month Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <p className="text-xl font-bold text-blue-600">
                {stats.currentMonth.records}
              </p>
              <p className="text-sm text-gray-600">Records</p>
              <p
                className={`text-xs ${stats.trends.monthly.records >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {formatPercentage(stats.trends.monthly.records)} vs last month
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(stats.currentMonth.amount)}
              </p>
              <p className="text-sm text-gray-600">Total Value</p>
              <p
                className={`text-xs ${stats.trends.monthly.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {formatPercentage(stats.trends.monthly.amount)} vs last month
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-yellow-600">
                {formatWeight(stats.currentMonth.weight)}
              </p>
              <p className="text-sm text-gray-600">Total Weight</p>
              <p
                className={`text-xs ${stats.trends.monthly.weight >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {formatPercentage(stats.trends.monthly.weight)} vs last month
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-600">
                {stats.currentMonth.goldCount}G /{' '}
                {stats.currentMonth.silverCount}S
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
            <CardTitle className="flex items-center justify-between">
              Recent Records
              <Badge variant="outline">Latest</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                    <div className="text-sm font-semibold">#{record.slNo}</div>
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
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Record Actions</CardTitle>
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
