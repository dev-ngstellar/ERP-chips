import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Button, Tag } from 'antd';
import { Wheat, ShoppingCart, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { RawMaterial } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { StockBadge } from '../../components/common/StockBadge';

export const RawStockPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery<{ data: RawMaterial[] }>({
    queryKey: ['inventory-raw-stock'],
    queryFn: () => api.get('/inventory/raw-materials'),
  });

  const rawMaterials = data?.data || [];
  const totalValuation = rawMaterials.reduce((sum, rm) => sum + (rm.stockValue || 0), 0);

  const columns = [
    {
      title: 'Material Name',
      dataIndex: 'materialName',
      key: 'materialName',
      render: (val: string, record: RawMaterial) => (
        <div>
          <div className="font-bold text-slate-800">{val}</div>
          <div className="text-xs text-slate-400 font-mono">{record.materialCode}</div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (val: string) => <Tag color="orange">{val}</Tag>,
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      render: (val: string) => <span className="font-mono">{val}</span>,
    },
    {
      title: 'Stock Status Indicator',
      key: 'status',
      render: (_: any, record: RawMaterial) => (
        <StockBadge
          currentStock={record.currentStock}
          minStockLevel={record.minStockLevel}
          unit={record.unit}
        />
      ),
    },
    {
      title: 'Current Available Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (val: number, record: RawMaterial) => (
        <span className="font-bold font-mono text-base text-slate-900">
          {formatNumber(val, 2)} {record.unit}
        </span>
      ),
    },
    {
      title: 'Standard Rate (₹)',
      dataIndex: 'standardCost',
      key: 'standardCost',
      render: (val: number, record: RawMaterial) => (
        <span className="text-slate-600 font-mono">
          {formatCurrency(val)} / {record.unit}
        </span>
      ),
    },
    {
      title: 'Total Stock Valuation (₹)',
      dataIndex: 'stockValue',
      key: 'stockValue',
      render: (val: number) => (
        <span className="font-bold font-mono text-emerald-700">{formatCurrency(val)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wheat className="w-5 h-5 text-amber-600" /> Raw Materials Available Stock
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time balance of all ingredients & packaging materials currently stored in factory warehouse.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-50 px-4 py-2 rounded-lg border border-amber-200 text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Total RM Valuation
            </span>
            <div className="text-base font-black text-amber-950">
              {formatCurrency(totalValuation)}
            </div>
          </div>

          <Button
            type="primary"
            icon={<ShoppingCart className="w-4 h-4 inline mr-1" />}
            onClick={() => navigate('/purchases/new')}
            className="bg-amber-600 font-semibold h-10"
          >
            + Inward Purchase
          </Button>

          <Button icon={<RefreshCw className="w-4 h-4" />} onClick={() => refetch()} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table
          dataSource={rawMaterials}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={false}
        />
      </div>
    </div>
  );
};
