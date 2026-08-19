import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Button, Tag } from 'antd';
import { Boxes, Factory, Receipt, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { Product } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { StockBadge } from '../../components/common/StockBadge';

export const FinishedStockPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery<{ data: Product[] }>({
    queryKey: ['inventory-finished-stock'],
    queryFn: () => api.get('/inventory/finished-goods'),
  });

  const products = data?.data || [];
  const totalValuation = products.reduce((sum, p) => sum + (p.stockValue || 0), 0);
  const totalPackets = products.reduce((sum, p) => sum + (p.currentStock || 0), 0);

  const columns = [
    {
      title: 'Product / SKU',
      dataIndex: 'productName',
      key: 'productName',
      render: (val: string, record: Product) => (
        <div>
          <div className="font-bold text-slate-800">{val}</div>
          <div className="text-xs text-slate-400 font-mono">{record.sku}</div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (val: string) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: 'Pack Size',
      dataIndex: 'packSize',
      key: 'packSize',
      render: (val: string) => <span className="font-medium text-slate-700">{val}</span>,
    },
    {
      title: 'Availability Status',
      key: 'status',
      render: (_: any, record: Product) => (
        <StockBadge
          currentStock={record.currentStock}
          minStockLevel={record.minStockLevel}
          unit={record.unit}
        />
      ),
    },
    {
      title: 'Finished Stock in Dispatch',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (val: number, record: Product) => (
        <span className="font-bold font-mono text-lg text-emerald-800">
          {formatNumber(val, 0)} {record.unit}
        </span>
      ),
    },
    {
      title: 'Selling Price (MRP)',
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      render: (val: number) => (
        <span className="font-bold text-slate-800">{formatCurrency(val)}</span>
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
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Product) => (
        <div className="flex gap-1.5">
          <Button
            size="small"
            onClick={() => navigate('/sales/new')}
            disabled={record.currentStock <= 0}
            className="text-xs"
          >
            Sell
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => navigate('/production/new')}
            className="bg-amber-600 text-xs font-medium"
          >
            Produce
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-600" /> Finished Goods Available Stock
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time finished goods stock ready for dispatch, customer billing, and distributor shipping.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Total FG Valuation ({formatNumber(totalPackets, 0)} pkts)
            </span>
            <div className="text-base font-black text-emerald-950">
              {formatCurrency(totalValuation)}
            </div>
          </div>

          <Button
            type="primary"
            icon={<Factory className="w-4 h-4 inline mr-1" />}
            onClick={() => navigate('/production/new')}
            className="bg-amber-600 font-semibold h-10"
          >
            + Run Production Batch
          </Button>

          <Button icon={<RefreshCw className="w-4 h-4" />} onClick={() => refetch()} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table
          dataSource={products}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={false}
        />
      </div>
    </div>
  );
};
