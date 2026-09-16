import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Button } from './Button';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    onPageChange: (newPage: number) => void;
  };
}

export function Table<T extends { id?: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No se encontraron registros.',
  className,
  pagination,
}: TableProps<T>) {
  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200/70">
            <tr>
              {columns.map((col, index) => (
                <th key={index} scope="col" className={cn('px-5 py-3.5', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                  <div className="inline-flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Cargando registros...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                    <p className="text-sm font-medium text-slate-500">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => (
                <tr
                  key={item.id ?? rowIdx}
                  className="hover:bg-slate-50/70 transition-colors duration-100"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={cn('px-5 py-3.5 whitespace-nowrap', col.className)}>
                      {col.cell
                        ? col.cell(item)
                        : col.accessorKey
                        ? (item[col.accessorKey] as React.ReactNode)
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <span className="text-xs text-slate-500">
            Mostrando página <span className="font-semibold text-slate-700">{pagination.pageIndex}</span> de{' '}
            <span className="font-semibold text-slate-700">{pagination.totalPages}</span> (
            <span className="font-semibold text-slate-700">{pagination.totalCount}</span> totales)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPreviousPage}
              onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
