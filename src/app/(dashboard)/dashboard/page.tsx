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
} from 'lucide-react';

// Mock data for PVM Records dashboard
const dashboardData = {
  overview: {
    totalRecords: 1247,
    activeRecords: 892,
    archivedRecords: 355,
  },
  todayStats: [
    {
      label: "Today's Records",
      value: 12,
      change: '+8%',
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      label: "Today's Active",
      value: 8,
      change: '+10%',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      label: "Today's Archived",
      value: 3,
      change: '+5%',
      icon: Archive,
      color: 'text-gray-600',
    },
    {
      label: "Today's Big",
      value: 2,
      change: '+15%',
      icon: Star,
      color: 'text-yellow-600',
    },
  ],
  totalStats: [
    {
      label: 'Total Records',
      value: 1247,
      change: '',
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      label: 'Active Records',
      value: 892,
      change: '',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      label: 'Archived Records',
      value: 355,
      change: '',
      icon: Archive,
      color: 'text-gray-600',
    },
    {
      label: 'Big Records',
      value: 156,
      change: '',
      icon: Star,
      color: 'text-yellow-600',
    },
  ],
  recentRecords: [
    {
      id: 1247,
      name: 'Rajesh Kumar',
      itemType: 'Gold',
      amount: 150000,
      weight: 24.5,
      date: '2025-11-19',
      status: 'Active',
    },
    {
      id: 1246,
      name: 'Priya Sharma',
      itemType: 'Silver',
      amount: 25000,
      weight: 10.2,
      date: '2025-11-19',
      status: 'Active',
    },
    {
      id: 1245,
      name: 'Amit Singh',
      itemType: 'Gold',
      amount: 200000,
      weight: 32.1,
      date: '2025-11-18',
      status: 'Archived',
    },
  ],
  quickActions: [
    {
      title: 'New Record',
      description: 'Create a new pawn record',
      icon: Plus,
      color: 'text-green-600',
      href: '/records/new',
    },
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
      title: 'Export Records',
      description: 'Download records as CSV',
      icon: Download,
      color: 'text-gray-600',
      href: '/records/export',
    },
  ],
};

export default function DashboardPage() {
  return (
    <div className="space-y-4 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Records Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overview of your pawn records and management statistics.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="mr-2 h-3 w-3" />
            View Reports
          </Button>
          <Button size="sm">
            <Bell className="mr-2 h-3 w-3" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {dashboardData.todayStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="transition-shadow hover:shadow-md">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className={`text-xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="mt-2">
                  <span
                    className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {stat.change} from last week
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Total Stats */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {dashboardData.totalStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="transition-shadow hover:shadow-md">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className={`text-xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                {stat.change && (
                  <div className="mt-2">
                    <span
                      className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {stat.change} from last week
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

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
            <div className="space-y-4">
              {dashboardData.recentRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 ${record.itemType === 'Gold' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {record.itemType === 'Gold' ? (
                        <Gem className="h-5 w-5" />
                      ) : (
                        <Scale className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{record.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>{record.weight}g</span>
                        <span>₹{record.amount.toLocaleString()}</span>
                        <Badge
                          variant={
                            record.status === 'Active' ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {record.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">#{record.id}</div>
                    <div className="text-xs text-gray-500">{record.date}</div>
                  </div>
                </div>
              ))}
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
              {dashboardData.quickActions.map((action, index) => {
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
