import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, Table, Tag, Alert, Spin, Empty } from 'antd';
import {
  TrendingUp,
  ShoppingCart,
  Factory,
  Receipt,
  DollarSign,
  AlertTriangle,
  Boxes,
  PackageCheck,
  ArrowRight,
  Plus,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { DashboardSummary } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery<{ data: DashboardSummary }>({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.get('/dashboard/summary'),
    refetchInterval: 10000, // auto-refresh every 10s
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spin size="large" tip="Loading Factory Dashboard..." />
      </div>
    );
  }

  const summary = data?.data;

  const movementColumns = [
    {
      title: 'Date & Time',
      dataIndex: 'movementDate',
      key: 'movementDate',
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Item Name',
      key: 'item',
      render: (_: any, record: any) => (
        <span className="font-semibold text-slate-800">
          {record.stockType === 'RAW_MATERIAL'
            ? record.rawMaterial?.materialName
            : record.product?.productName}
        </span>
      ),
    },
    {
      title: 'Movement',
      key: 'movementType',
      render: (_: any, record: any) => (
        <Tag color={record.movementType === 'STOCK_IN' ? 'green' : 'volcano'}>
          {record.movementType === 'STOCK_IN' ? '+ INWARD' : '- OUTWARD'}
        </Tag>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (val: number, record: any) => (
        <span className="font-mono font-medium">
          {record.movementType === 'STOCK_IN' ? `+${val}` : `-${val}`}{' '}
          {record.rawMaterial?.unit || record.product?.unit || ''}
        </span>
      ),
    },
    {
      title: 'Balance After',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      render: (val: number, record: any) => (
        <span className="font-mono font-bold text-slate-700">
          {val} {record.rawMaterial?.unit || record.product?.unit || ''}
        </span>
      ),
    },
    {
      title: 'Reference',
      dataIndex: 'referenceType',
      key: 'referenceType',
      render: (val: string) => (
        <Tag color="blue" className="text-[11px]">
          {val}
        </Tag>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 p-6 text-white shadow-lg shadow-amber-700/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-4 h-4" /> Live Factory Control Centre
          </div>
          <h2 className="text-2xl font-black mt-1">Chips & Snacks Production Overview</h2>
          <p className="text-amber-100 text-sm mt-0.5">
            Monitor real-time inventory movements, batch yields, and instant profitability.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="default"
            icon={<ShoppingCart className="w-4 h-4 inline mr-1 text-amber-700" />}
            onClick={() => navigate('/purchases/new')}
            className="bg-white text-slate-800 font-semibold border-0 hover:bg-amber-50 h-10 shadow-sm"
          >
            + Inward RM Purchase
          </Button>

          <Button
            type="default"
            icon={<Factory className="w-4 h-4 inline mr-1 text-blue-700" />}
            onClick={() => navigate('/production/new')}
            className="bg-white text-slate-800 font-semibold border-0 hover:bg-amber-50 h-10 shadow-sm"
          >
            ⚡ Run Production Batch
          </Button>

          <Button
            type="default"
            icon={<Receipt className="w-4 h-4 inline mr-1 text-emerald-700" />}
            onClick={() => navigate('/sales/new')}
            className="bg-white text-slate-800 font-semibold border-0 hover:bg-amber-50 h-10 shadow-sm"
          >
            + New Sales Invoice
          </Button>
        </div>
      </div>

      {/* Low Stock Warning Alert if any */}
      {(summary?.inventorySummary.lowStockRMCount || 0) > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          message={
            <span className="font-bold text-amber-900">
              Low Stock Warning: {summary?.inventorySummary.lowStockRMCount} Raw Materials below reorder level!
            </span>
          }
          description={
            <div className="mt-1 flex flex-wrap gap-2">
              {summary?.inventorySummary.lowStockRM.map((rm) => (
                <span
                  key={rm.id}
                  className="rounded-md bg-amber-100/80 px-2 py-0.5 text-xs font-semibold text-amber-900"
                >
                  {rm.name}: {rm.current} {rm.unit} (Min: {rm.min} {rm.unit})
                </span>
              ))}
            </div>
          }
          action={
            <Button
              size="small"
              type="primary"
              onClick={() => navigate('/purchases/new')}
              className="bg-amber-600 font-semibold"
            >
              Order RM Now
            </Button>
          }
          className="border-amber-300 bg-amber-50/90 rounded-xl"
        />
      )}

      {/* Today's Operational KPIs */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
          Today's Factory Snapshot
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Production"
            value={`${formatNumber(summary?.today.producedPackets || 0, 0)} pkts`}
            subtitle={`${summary?.today.batchesCount || 0} batches executed today`}
            icon={<Factory className="w-6 h-6" />}
            color="purple"
          />

          <StatCard
            title="Today's Sales"
            value={formatCurrency(summary?.today.salesAmount || 0)}
            subtitle={`${summary?.today.salesCount || 0} invoices billed today`}
            icon={<Receipt className="w-6 h-6" />}
            color="emerald"
          />

          <StatCard
            title="Today's RM Purchases"
            value={formatCurrency(summary?.today.purchasesAmount || 0)}
            subtitle={`${summary?.today.purchasesCount || 0} purchase orders inwarded`}
            icon={<ShoppingCart className="w-6 h-6" />}
            color="blue"
          />

          <StatCard
            title="Today's Expenses"
            value={formatCurrency(summary?.today.expensesAmount || 0)}
            subtitle={`${summary?.today.expensesCount || 0} expense entries recorded`}
            icon={<DollarSign className="w-6 h-6" />}
            color="rose"
          />
        </div>
      </div>

      {/* Business Financial Summary & Inventory Valuation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Summary Card */}
        <Card className="shadow-sm rounded-xl border-slate-200 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-base font-bold text-slate-900">Estimated Business Summary</h4>
              <p className="text-xs text-slate-500">Cumulative business transactions and net balance</p>
            </div>
            <Tag color="gold" className="font-semibold text-xs py-1 px-2">
              POC Financial Estimate
            </Tag>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-700">Total Sales Value</span>
              <div className="text-lg font-bold text-emerald-900 mt-0.5">
                {formatCurrency(summary?.businessSummary.totalSales || 0)}
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-xs font-semibold text-blue-700">Total RM Purchases</span>
              <div className="text-lg font-bold text-blue-900 mt-0.5">
                {formatCurrency(summary?.businessSummary.totalPurchases || 0)}
              </div>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-xs font-semibold text-rose-700">Total Factory Expenses</span>
              <div className="text-lg font-bold text-rose-900 mt-0.5">
                {formatCurrency(summary?.businessSummary.totalExpenses || 0)}
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-xs font-semibold text-amber-800">Estimated Gross Profit</span>
              <div className="text-lg font-bold text-amber-950 mt-0.5">
                {formatCurrency(summary?.businessSummary.estimatedProfit || 0)}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 flex items-center justify-between">
            <span>
              Total Production Volume: <strong>{formatNumber(summary?.businessSummary.totalProducedPackets || 0, 0)} packets</strong> across {summary?.businessSummary.totalBatches || 0} batches
            </span>
            <Button type="link" size="small" onClick={() => navigate('/reports')}>
              View Detailed Reports →
            </Button>
          </div>
        </Card>

        {/* Stock Valuation Card */}
        <Card className="shadow-sm rounded-xl border-slate-200 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900">Current Stock Valuation</h4>
            <p className="text-xs text-slate-500 mb-4">Real-time inventory on plant floor</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500">Raw Material Stock</span>
                    <div className="text-sm font-bold text-slate-800">
                      {summary?.inventorySummary.rawMaterialsCount || 0} Items
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Valuation</span>
                  <div className="text-sm font-bold text-slate-900">
                    {formatCurrency(summary?.inventorySummary.rmValuation || 0)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500">Finished Goods Stock</span>
                    <div className="text-sm font-bold text-slate-800">
                      {summary?.inventorySummary.productsCount || 0} SKUs
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Valuation</span>
                  <div className="text-sm font-bold text-slate-900">
                    {formatCurrency(summary?.inventorySummary.fgValuation || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
            <Button
              block
              size="small"
              onClick={() => navigate('/inventory/raw-materials')}
              className="text-xs font-medium"
            >
              Raw Stock
            </Button>
            <Button
              block
              size="small"
              onClick={() => navigate('/inventory/finished-goods')}
              className="text-xs font-medium"
            >
              Finished Stock
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Stock Movements Feed */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-900">
              Live Stock Movement Audit Ledger (Latest Transactions)
            </span>
            <Button
              type="link"
              size="small"
              onClick={() => navigate('/inventory/movements')}
              className="text-amber-700 font-semibold"
            >
              View Full Audit Trail →
            </Button>
          </div>
        }
        className="shadow-sm rounded-xl border-slate-200"
      >
        <Table
          dataSource={summary?.recentMovements || []}
          columns={movementColumns}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: <Empty description="No stock movements recorded yet. Inward purchase or run production to generate movements." /> }}
        />
      </Card>
    </div>
  );
};
