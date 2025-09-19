'use client';

import React, { useState, useMemo } from 'react';
import { DataTableProps } from '../../types/enhanced-data';

export function DataTable({
  data,
  columns,
  sortable = true,
  searchable = true,
  pagination = true,
  pageSize = 10
}: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // Handle sorting
  const handleSort = (key: string) => {
    if (!sortable) return;

    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Handle search and filtering
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((row) =>
      columns.some((column) => {
        const value = row[column.key];
        if (value === null || value === undefined) return false;
        return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, columns, searchTerm]);

  // Handle sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
      }

      // Handle string values
      const aString = aValue.toString().toLowerCase();
      const bString = bValue.toString().toLowerCase();
      const comparison = aString.localeCompare(bString);

      return sortConfig.direction === 'ascending' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // Handle pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = currentPage * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const formatValue = (value: any, column: typeof columns[0]) => {
    if (value === null || value === undefined) return '-';

    if (column.format) {
      return column.format(value);
    }

    switch (column.type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);

      case 'percentage':
        return `${(value * 100).toFixed(2)}%`;

      case 'number':
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(value);

      case 'date':
        return new Date(value).toLocaleDateString();

      default:
        return value.toString();
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return '↕️';
    }
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      {/* Search Bar */}
      {searchable && (
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{
            position: 'relative',
            maxWidth: '300px'
          }}>
            <input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s ease-in-out'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
              }}
            />
            <span style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              🔍
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb'
            }}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    whiteSpace: 'nowrap',
                    cursor: sortable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort(column.key)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{column.label}</span>
                    {sortable && (
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {getSortIcon(column.key)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: '1px solid #f3f4f6',
                  backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
                }}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#374151'
                    }}
                  >
                    {formatValue(row[column.key], column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Data Message */}
      {paginatedData.length === 0 && (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            {searchTerm ? 'No data matches your search.' : 'No data available.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            Showing {currentPage * pageSize + 1} to{' '}
            {Math.min((currentPage + 1) * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                backgroundColor: currentPage === 0 ? '#f3f4f6' : 'white',
                color: currentPage === 0 ? '#9ca3af' : '#374151',
                borderRadius: '4px',
                fontSize: '0.875rem',
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </button>
            <button
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                backgroundColor: currentPage === totalPages - 1 ? '#f3f4f6' : 'white',
                color: currentPage === totalPages - 1 ? '#9ca3af' : '#374151',
                borderRadius: '4px',
                fontSize: '0.875rem',
                cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Specialized data table for risk factors
export function RiskFactorsTable({ factors }: { factors: any[] }) {
  const columns = [
    {
      key: 'name',
      label: 'Risk Factor',
      type: 'string' as const,
      sortable: true
    },
    {
      key: 'value',
      label: 'Value',
      type: 'number' as const,
      format: (value: number) => value.toLocaleString(),
      sortable: true
    },
    {
      key: 'impact',
      label: 'Impact',
      type: 'string' as const,
      sortable: true
    },
    {
      key: 'severity',
      label: 'Severity',
      type: 'string' as const,
      sortable: true,
      format: (value: string) => {
        const colors = {
          low: '#ecfdf5',
          medium: '#fffbeb',
          high: '#fef2f2'
        };
        const textColors = {
          low: '#059669',
          medium: '#d97706',
          high: '#dc2626'
        };
        const bgColor = colors[value as keyof typeof colors] || '#f3f4f6';
        const textColor = textColors[value as keyof typeof textColors] || '#6b7280';

        return `<span style="padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 500; background-color: ${bgColor}; color: ${textColor};">${value}</span>`;
      }
    },
    {
      key: 'description',
      label: 'Description',
      type: 'string' as const,
      sortable: false
    }
  ];

  return <DataTable data={factors} columns={columns} />;
}

// Specialized data table for historical data
export function HistoricalDataTable({ data }: { data: any[] }) {
  const columns = [
    {
      key: 'date',
      label: 'Date',
      type: 'date' as const,
      sortable: true
    },
    {
      key: 'tvlUsd',
      label: 'TVL',
      type: 'currency' as const,
      sortable: true
    },
    {
      key: 'apy',
      label: 'APY',
      type: 'percentage' as const,
      sortable: true
    },
    {
      key: 'volumeUsd',
      label: 'Volume',
      type: 'currency' as const,
      sortable: true
    }
  ];

  return <DataTable data={data} columns={columns} />;
}