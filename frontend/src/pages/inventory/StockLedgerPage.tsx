import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Tag, Select, Button, Card } from 'antd';
import { Layers, Filter, RefreshCw } from 'lucide-react';
import api from '../../api/client';
import { StockMovement } from '../../types';
import { formatDate } from '../../utils/formatters';

export const StockLedgerPage: React.FC = () => {
  const [stockType, setStockType] = useState<string | undefined>();
  const [movementType, setMovementType] = useState<string | undefined>();

  const { data, isLoading, refetch } = useQuery<{ data: StockMovement[] }>({
    queryKey: ['stock-movements', stockType, movementType],
    queryFn: () =>
      api.get('/inventory/movements', {
        params: { stockType, movementType },
      }),
  });

  const columns = [
    {
      title: 'Date & Time',
      dataIndex: 'movementDate',
      key: 'movementDate',
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Item Type',
      dataIndex: 'stockType',
      key: 'stockType',
      render: (val: string) => (
        <Tag color={val === 'RAW_MATERIAL' ? 'gold' : 'blue'}>
          {val === 'RAW_MATERIAL' ? 'Raw Material' : 'Finished Good'}
        </Tag>
      ),
    },
    {
      title: 'Item Description',
      key: 'item',
      render: (_: any, record: StockMovement) => (
        <div>
          <span className="font-bold text-slate-800">
            {record.stockType === 'RAW_MATERIAL'
              ? record.rawMaterial?.materialName
              : record.product?.productName}
          </span>
          <div className="text-[11px] text-slate-400 font-mono">
            {record.stockType === 'RAW_MATERIAL'
              ? record.rawMaterial?.materialCode
              : record.product?.sku}
          </div>
        </div>
      ),
    },
    {
      title: 'Movement',
      dataIndex: 'movementType',
      key: 'movementType',
      render: (val: string) => (
        <Tag color={val === 'STOCK_IN' ? 'green' : 'volcano'} className="font-bold">
          {val === 'STOCK_IN' ? '⬆ STOCK IN' : '⬇ STOCK OUT'}
        </Tag>
      ),
    },
    {
      title: 'Quantity Moved',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (val: number, record: StockMovement) => (
        <span
          className={`font-bold font-mono ${
            record.movementType === 'STOCK_IN' ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          {record.movementType === 'STOCK_IN' ? `+${val}` : `-${val}`}{' '}
          {record.rawMaterial?.unit || record.product?.unit || ''}
        </span>
      ),
    },
    {
      title: 'Balance After',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      render: (val: number, record: StockMovement) => (
        <span className="font-bold font-mono text-slate-800">
          {val} {record.rawMaterial?.unit || record.product?.unit || ''}
        </span>
      ),
    },
    {
      title: 'Transaction Trigger',
      dataIndex: 'referenceType',
      key: 'referenceType',
      render: (val: string) => <Tag color="geekblue">{val}</Tag>,
    },
    {
      title: 'Audit Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (val: string) => <span className="text-xs text-slate-500">{val || '-'}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" /> Stock Movement Audit Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable, double-entry audit trail tracking every single inventory transaction, batch consumption, and invoice dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            placeholder="All Stock Types"
            allowClear
            value={stockType}
            onChange={(val) => setStockType(val)}
            className="w-40"
          >
            <Select.Option value="RAW_MATERIAL">Raw Materials</Select.Option>
            <Select.Option value="FINISHED_GOOD">Finished Goods</Select.Option>
          </Select>

          <Select
            placeholder="All Movements"
            allowClear
            value={movementType}
            onChange={(val) => setMovementType(val)}
            className="w-36"
          >
            <Select.Option value="STOCK_IN">STOCK IN</Select.Option>
            <Select.Option value="STOCK_OUT">STOCK OUT</Select.Option>
          </Select>

          <Button icon={<RefreshCw className="w-4 h-4" />} onClick={() => refetch()} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table
          dataSource={data?.data || []}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 15 }}
        />
      </div>
    </div>
  );
};
