import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, Table, Card, Button, Tag, Space } from 'antd';
import { FileText, Download, ShoppingCart, Factory, Boxes, Receipt, Layers } from 'lucide-react';
import api from '../../api/client';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';

export const ReportsHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('raw-stock');

  // 1. Raw Stock Ledger Query
  const { data: rawStockData, isLoading: rawStockLoading } = useQuery<{ data: any[] }>({
    queryKey: ['reports-raw-stock'],
    queryFn: () => api.get('/reports/raw-stock'),
  });

  // 2. Finished Stock Ledger Query
  const { data: fgStockData, isLoading: fgStockLoading } = useQuery<{ data: any[] }>({
    queryKey: ['reports-finished-stock'],
    queryFn: () => api.get('/reports/finished-stock'),
  });

  // 3. Purchases Report Query
  const { data: purchasesData, isLoading: purchasesLoading } = useQuery<{ data: any[] }>({
    queryKey: ['reports-purchases'],
    queryFn: () => api.get('/reports/purchases'),
  });

  // 4. Production Report Query
  const { data: productionData, isLoading: productionLoading } = useQuery<{ data: any[] }>({
    queryKey: ['reports-production'],
    queryFn: () => api.get('/reports/production'),
  });

  // 5. Sales Report Query
  const { data: salesData, isLoading: salesLoading } = useQuery<{ data: any[] }>({
    queryKey: ['reports-sales'],
    queryFn: () => api.get('/reports/sales'),
  });

  // Generic CSV Exporter
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Tab 1: Raw Stock Columns
  const rawStockColumns = [
    {
      title: 'Raw Material',
      dataIndex: 'materialName',
      key: 'materialName',
      render: (val: string, r: any) => (
        <div>
          <div className="font-bold text-slate-800">{val}</div>
          <div className="text-xs text-slate-400 font-mono">{r.materialCode}</div>
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
      title: 'Total Inwarded (+)',
      dataIndex: 'inwarded',
      key: 'inwarded',
      render: (val: number, r: any) => (
        <span className="font-mono font-bold text-emerald-700">
          +{formatNumber(val, 2)} {r.unit}
        </span>
      ),
    },
    {
      title: 'Total Consumed (-)',
      dataIndex: 'consumed',
      key: 'consumed',
      render: (val: number, r: any) => (
        <span className="font-mono font-bold text-rose-700">
          -{formatNumber(val, 2)} {r.unit}
        </span>
      ),
    },
    {
      title: 'Current Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (val: number, r: any) => (
        <span className="font-mono font-black text-slate-900 text-sm">
          {formatNumber(val, 2)} {r.unit}
        </span>
      ),
    },
    {
      title: 'Valuation (₹)',
      dataIndex: 'valuation',
      key: 'valuation',
      render: (val: number) => (
        <span className="font-bold font-mono text-emerald-800">{formatCurrency(val)}</span>
      ),
    },
  ];

  // Tab 2: Finished Stock Columns
  const fgStockColumns = [
    {
      title: 'Finished Product',
      dataIndex: 'productName',
      key: 'productName',
      render: (val: string, r: any) => (
        <div>
          <div className="font-bold text-slate-800">{val}</div>
          <div className="text-xs text-slate-400 font-mono">{r.sku}</div>
        </div>
      ),
    },
    {
      title: 'Pack Size',
      dataIndex: 'packSize',
      key: 'packSize',
    },
    {
      title: 'Total Produced (+)',
      dataIndex: 'produced',
      key: 'produced',
      render: (val: number, r: any) => (
        <span className="font-mono font-bold text-emerald-700">
          +{formatNumber(val, 0)} {r.unit}
        </span>
      ),
    },
    {
      title: 'Total Sold / Dispatched (-)',
      dataIndex: 'sold',
      key: 'sold',
      render: (val: number, r: any) => (
        <span className="font-mono font-bold text-rose-700">
          -{formatNumber(val, 0)} {r.unit}
        </span>
      ),
    },
    {
      title: 'Current Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (val: number, r: any) => (
        <span className="font-mono font-black text-slate-900 text-sm">
          {formatNumber(val, 0)} {r.unit}
        </span>
      ),
    },
    {
      title: 'Valuation (₹)',
      dataIndex: 'valuation',
      key: 'valuation',
      render: (val: number) => (
        <span className="font-bold font-mono text-emerald-800">{formatCurrency(val)}</span>
      ),
    },
  ];

  // Tab 3: Purchases Report Columns
  const purchaseReportColumns = [
    {
      title: 'Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: (val: string) => formatDate(val),
    },
    {
      title: 'PO #',
      dataIndex: 'purchaseNumber',
      key: 'purchaseNumber',
      render: (val: string) => <span className="font-mono text-amber-800 font-bold">{val}</span>,
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (val: string) => <span className="font-bold text-slate-800">{val}</span>,
    },
    {
      title: 'Material',
      dataIndex: 'materialName',
      key: 'materialName',
    },
    {
      title: 'Inwarded Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (val: number, r: any) => (
        <span className="font-mono font-bold">
          {val} {r.unit}
        </span>
      ),
    },
    {
      title: 'Unit Rate',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (val: number) => <span className="font-mono">{formatCurrency(val)}</span>,
    },
    {
      title: 'Line Amount',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (val: number) => (
        <span className="font-bold font-mono text-slate-900">{formatCurrency(val)}</span>
      ),
    },
  ];

  // Tab 4: Production Report Columns
  const productionReportColumns = [
    {
      title: 'Date',
      dataIndex: 'productionDate',
      key: 'productionDate',
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Batch #',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      render: (val: string) => <span className="font-mono font-bold text-amber-800">{val}</span>,
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      render: (val: string) => <span className="font-bold text-slate-800">{val}</span>,
    },
    {
      title: 'Produced Output',
      dataIndex: 'actualOutput',
      key: 'actualOutput',
      render: (val: number, r: any) => (
        <span className="font-mono font-bold text-emerald-800">
          {val} {r.unit}
        </span>
      ),
    },
    {
      title: 'Wastage',
      dataIndex: 'wastageQuantity',
      key: 'wastageQuantity',
      render: (val: number, r: any) => (
        <Tag color={val > 0 ? 'volcano' : 'default'}>
          {val} {r.unit}
        </Tag>
      ),
    },
    {
      title: 'Ingredients Consumed',
      dataIndex: 'consumptions',
      key: 'consumptions',
      render: (list: any[]) => (
        <div className="space-y-0.5">
          {list?.map((c, i) => (
            <div key={i} className="text-xs text-slate-600">
              • {c.materialName}: <strong className="text-rose-700">-{c.quantityConsumed} {c.unit}</strong>
            </div>
          ))}
        </div>
      ),
    },
  ];

  // Tab 5: Sales Report Columns
  const salesReportColumns = [
    {
      title: 'Date',
      dataIndex: 'saleDate',
      key: 'saleDate',
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Invoice #',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (val: string) => <span className="font-mono font-bold text-emerald-800">{val}</span>,
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (val: string, r: any) => (
        <div>
          <span className="font-bold text-slate-800">{val}</span>
          <span className="text-[10px] text-slate-400 block">{r.customerType}</span>
        </div>
      ),
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (val: number, r: any) => (
        <span className="font-mono font-bold">
          {val} {r.unit}
        </span>
      ),
    },
    {
      title: 'Rate',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (val: number) => <span className="font-mono">{formatCurrency(val)}</span>,
    },
    {
      title: 'Invoice Line Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (val: number) => (
        <span className="font-bold font-mono text-emerald-900">{formatCurrency(val)}</span>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'raw-stock',
      label: (
        <span className="flex items-center gap-1.5 font-semibold">
          <Boxes className="w-4 h-4 text-amber-600" /> RM Stock Ledger
        </span>
      ),
      children: (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Complete opening, inwarded, consumed, and closing stock balance ledger.
            </span>
            <Button
              size="small"
              icon={<Download className="w-3.5 h-3.5 inline mr-1" />}
              onClick={() => exportToCSV(rawStockData?.data || [], 'Raw_Material_Ledger')}
            >
              Export CSV
            </Button>
          </div>
          <Table
            dataSource={rawStockData?.data || []}
            columns={rawStockColumns}
            rowKey="id"
            loading={rawStockLoading}
            pagination={false}
          />
        </div>
      ),
    },
    {
      key: 'fg-stock',
      label: (
        <span className="flex items-center gap-1.5 font-semibold">
          <Boxes className="w-4 h-4 text-emerald-600" /> Finished Goods Ledger
        </span>
      ),
      children: (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Complete produced, sold, and available inventory balance for finished snacks.
            </span>
            <Button
              size="small"
              icon={<Download className="w-3.5 h-3.5 inline mr-1" />}
              onClick={() => exportToCSV(fgStockData?.data || [], 'Finished_Goods_Ledger')}
            >
              Export CSV
            </Button>
          </div>
          <Table
            dataSource={fgStockData?.data || []}
            columns={fgStockColumns}
            rowKey="id"
            loading={fgStockLoading}
            pagination={false}
          />
        </div>
      ),
    },
    {
      key: 'purchases',
      label: (
        <span className="flex items-center gap-1.5 font-semibold">
          <ShoppingCart className="w-4 h-4 text-blue-600" /> Purchases Report
        </span>
      ),
      children: (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Detailed breakdown of all supplier purchase orders and received raw materials.
            </span>
            <Button
              size="small"
              icon={<Download className="w-3.5 h-3.5 inline mr-1" />}
              onClick={() => exportToCSV(purchasesData?.data || [], 'Purchases_Report')}
            >
              Export CSV
            </Button>
          </div>
          <Table
            dataSource={purchasesData?.data || []}
            columns={purchaseReportColumns}
            rowKey={(r) => `${r.purchaseId}-${r.materialCode}`}
            loading={purchasesLoading}
            pagination={{ pageSize: 10 }}
          />
        </div>
      ),
    },
    {
      key: 'production',
      label: (
        <span className="flex items-center gap-1.5 font-semibold">
          <Factory className="w-4 h-4 text-purple-600" /> Production & Yields
        </span>
      ),
      children: (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Batch-wise production yields, ingredient consumptions, and wastage loss.
            </span>
            <Button
              size="small"
              icon={<Download className="w-3.5 h-3.5 inline mr-1" />}
              onClick={() => exportToCSV(productionData?.data || [], 'Production_Report')}
            >
              Export CSV
            </Button>
          </div>
          <Table
            dataSource={productionData?.data || []}
            columns={productionReportColumns}
            rowKey="batchId"
            loading={productionLoading}
            pagination={{ pageSize: 10 }}
          />
        </div>
      ),
    },
    {
      key: 'sales',
      label: (
        <span className="flex items-center gap-1.5 font-semibold">
          <Receipt className="w-4 h-4 text-emerald-600" /> Sales Report
        </span>
      ),
      children: (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Customer-wise and product-wise sales revenue and dispatch quantities.
            </span>
            <Button
              size="small"
              icon={<Download className="w-3.5 h-3.5 inline mr-1" />}
              onClick={() => exportToCSV(salesData?.data || [], 'Sales_Report')}
            >
              Export CSV
            </Button>
          </div>
          <Table
            dataSource={salesData?.data || []}
            columns={salesReportColumns}
            rowKey={(r) => `${r.saleId}-${r.sku}`}
            loading={salesLoading}
            pagination={{ pageSize: 10 }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-600" /> Factory Reports & Inventory Ledgers
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time transactional reports for Purchase Inwarding, Production Yields, Stock Balances, and Sales Dispatches.
        </p>
      </div>

      <Card className="shadow-sm rounded-xl border-slate-200">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </div>
  );
};
