'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';

export interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string;
  title?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  filterable?: boolean;
  exportable?: boolean;
  refreshable?: boolean;
  selectable?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  selectedRows?: string[];
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRowSelect?: (selectedIds: string[]) => void;
  onRowClick?: (row: T, index: number) => void;
  getRowId?: (row: T) => string;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T = any>({
  data,
  columns,
  loading = false,
  error,
  title,
  searchable = true,
  searchPlaceholder = 'Search...',
  filterable = false,
  exportable = false,
  refreshable = false,
  selectable = false,
  pagination,
  selectedRows = [],
  onSearch,
  onFilter,
  onExport,
  onRefresh,
  onSort,
  onPageChange,
  onLimitChange,
  onRowSelect,
  onRowClick,
  getRowId = (row: any) => row.id,
  emptyMessage = 'No data available',
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSearch = React.useCallback(
    (query: string) => {
      setSearchQuery(query);
      onSearch?.(query);
    },
    [onSearch]
  );

  const handleSort = React.useCallback(
    (key: string) => {
      const direction =
        sortConfig?.key === key && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc';

      setSortConfig({ key, direction });
      onSort?.(key, direction);
    },
    [sortConfig, onSort]
  );

  const handleRowSelect = React.useCallback(
    (rowId: string, checked: boolean) => {
      if (!onRowSelect) return;

      const newSelection = checked
        ? [...selectedRows, rowId]
        : selectedRows.filter((id) => id !== rowId);

      onRowSelect(newSelection);
    },
    [selectedRows, onRowSelect]
  );

  const handleSelectAll = React.useCallback(
    (checked: boolean) => {
      if (!onRowSelect) return;

      const newSelection = checked ? data.map((row) => getRowId(row)) : [];

      onRowSelect(newSelection);
    },
    [data, getRowId, onRowSelect]
  );

  const isAllSelected = selectedRows.length === data.length && data.length > 0;
  const isIndeterminate =
    selectedRows.length > 0 && selectedRows.length < data.length;

  if (error) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="mb-2 text-destructive">Error loading data</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            {refreshable && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={onRefresh}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('', className)}>
      {(title || searchable || filterable || exportable || refreshable) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>{title && <CardTitle>{title}</CardTitle>}</div>
            <div className="flex items-center space-x-2">
              {searchable && (
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="rounded-md border py-2 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}
              {filterable && (
                <Button variant="outline" size="sm" onClick={onFilter}>
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              )}
              {exportable && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              )}
              {refreshable && (
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                {selectable && (
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'p-4 text-left font-medium text-muted-foreground',
                      column.sortable && 'cursor-pointer hover:text-foreground',
                      column.width && `w-${column.width}`
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{column.label}</span>
                      {column.sortable && sortConfig?.key === column.key && (
                        <span className="text-xs">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b">
                    {selectable && (
                      <td className="p-4">
                        <div className="skeleton h-4 w-4" />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className="p-4">
                        <div className="skeleton h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="p-8 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, index) => {
                  const rowId = getRowId(row);
                  const isSelected = selectedRows.includes(rowId);

                  return (
                    <tr
                      key={rowId}
                      className={cn(
                        'border-b transition-colors hover:bg-muted/50',
                        isSelected && 'bg-muted',
                        onRowClick && 'cursor-pointer'
                      )}
                      onClick={() => onRowClick?.(row, index)}
                    >
                      {selectable && (
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) =>
                              handleRowSelect(rowId, e.target.checked)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-gray-300"
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.key} className="p-4">
                          {column.render
                            ? column.render(
                                (row as any)[column.key],
                                row,
                                index
                              )
                            : (row as any)[column.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                of {pagination.total} results
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page:
                </span>
                <select
                  value={pagination.limit}
                  onChange={(e) => onLimitChange?.(Number(e.target.value))}
                  className="rounded border px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="px-2 text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.totalPages)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
