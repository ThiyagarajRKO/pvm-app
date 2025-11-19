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
} from 'lucide-react';

// Mock data for PVM Pawn Shop dashboard
const dashboardData = {
  overview: {
    totalRecords: 1247,
    totalGoldCount: 892,
    totalSilverCount: 355,
    totalAmount: 45678000,
    totalWeightGrams: 12456.7,
  },
  quickStats: [
    {
      label: "Today's Records",
      value: 12,
      change: '+8%',
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      label: 'Gold Items',
      value: 892,
      change: '+15%',
      icon: Gem,
      color: 'text-yellow-600',
    },
    {
      label: 'Silver Items',
      value: 355,
      change: '+5%',
      icon: Scale,
      color: 'text-gray-600',
    },
    {
      label: 'Total Amount',
      value: '₹4.57Cr',
      change: '+12%',
      icon: DollarSign,
      color: 'text-green-600',
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
    },
    {
      id: 1246,
      name: 'Priya Sharma',
      itemType: 'Silver',
      amount: 25000,
      weight: 10.2,
      date: '2025-11-19',
    },
    {
      id: 1245,
      name: 'Amit Singh',
      itemType: 'Gold',
      amount: 200000,
      weight: 32.1,
      date: '2025-11-18',
    },
  ],
  systemMetrics: [
    {
      label: 'Database Health',
      value: '99.8%',
      status: 'excellent',
      icon: Database,
    },
    {
      label: 'S3 Upload Status',
      value: '100%',
      status: 'excellent',
      icon: CloudCog,
    },
    { label: 'API Response Time', value: '85ms', status: 'good', icon: Zap },
    {
      label: 'Security Score',
      value: '95/100',
      status: 'excellent',
      icon: Shield,
    },
  ],
  quickActions: [
    {
      title: 'Add New Record',
      description: 'Create a new pawn record',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      href: '/records/new',
    },
    {
      title: 'View All Records',
      description: 'Browse all pawn records',
      icon: Eye,
      color: 'bg-green-50 text-green-600 hover:bg-green-100',
      href: '/records',
    },
    {
      title: 'Export Data',
      description: 'Download records as CSV',
      icon: BarChart3,
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      href: '/records',
    },
    {
      title: 'System Health',
      description: 'Check system status',
      icon: Activity,
      color: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
      href: '/system-health',
    },
  ],
  alerts: [
    {
      type: 'info',
      message: 'Database backup completed successfully',
      time: '2 hours ago',
    },
    {
      type: 'success',
      message: 'All S3 uploads are functioning normally',
      time: '1 hour ago',
    },
  ],
};

export default function DashboardPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'info':
        return <Activity className="h-3 w-3 text-blue-600" />;
      default:
        return <AlertTriangle className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-4 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            PVM Pawn Shop Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your pawn shop records and operations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-3 w-3" />
            View Reports
          </Button>
          <Button size="sm">
            <Bell className="mr-2 h-3 w-3" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {dashboardData.alerts.length > 0 && (
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-3 w-3" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {dashboardData.alerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg bg-gray-50 p-2"
                >
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-xs font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-500">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Total Records
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {dashboardData.overview.totalRecords}
                </p>
              </div>
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Gold Items
                </p>
                <p className="text-lg font-bold text-yellow-600">
                  {dashboardData.overview.totalGoldCount}
                </p>
              </div>
              <Gem className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Silver Items
                </p>
                <p className="text-lg font-bold text-gray-600">
                  {dashboardData.overview.totalSilverCount}
                </p>
              </div>
              <Scale className="h-6 w-6 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Total Amount
                </p>
                <p className="text-lg font-bold text-green-600">
                  ₹{(dashboardData.overview.totalAmount / 10000000).toFixed(2)}
                  Cr
                </p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Total Weight
                </p>
                <p className="text-lg font-bold text-purple-600">
                  {dashboardData.overview.totalWeightGrams.toFixed(1)}g
                </p>
              </div>
              <Scale className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {dashboardData.quickStats.map((stat, index) => {
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
                      <h3 className="font-semibold">{record.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>{record.weight}g</span>
                        <span>₹{record.amount.toLocaleString()}</span>
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
            <CardTitle>Quick Actions</CardTitle>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* System Performance */}
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-2 gap-3">
              {dashboardData.systemMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={index}
                    className="rounded-lg border p-4 text-center"
                  >
                    <Icon
                      className={`mx-auto mb-2 h-6 w-6 ${getStatusColor(metric.status)}`}
                    />
                    <div className="text-xs text-gray-600">{metric.label}</div>
                    <div
                      className={`text-xl font-bold ${getStatusColor(metric.status)}`}
                    >
                      {metric.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.alerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                >
                  <div className="rounded-lg bg-gray-100 p-2">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {alert.type}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {alert.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700">
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
