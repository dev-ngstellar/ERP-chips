import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Button, Tag, Modal } from 'antd';
import { Plus, Factory, Eye, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { ProductionBatch } from '../../types';
import { formatDate, formatNumber } from '../../utils/formatters';

export const ProductionListPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);

  const { data, isLoading } = useQuery<{ data: ProductionBatch[] }>({
    queryKey: ['production-batches'],
    queryFn: () => api.get('/production'),
  });

  const columns = [
    {
      title: 'Batch Number #',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      render: (val: string) => <span className="font-mono font-bold text-amber-800">{val}</span>,
    },
    {
      title: 'Production Date',
      dataIndex: 'productionDate',
      key: 'productionDate',
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Finished Product Produced',
      dataIndex: ['product', 'productName'],
      key: 'product',
      render: (val: string, record: ProductionBatch) => (
        <div>
          <div className="font-bold text-slate-800">{val}</div>
          <div className="text-xs text-slate-400 font-mono">{record.product?.sku}</div>
        </div>
      ),
    },
    {
      title: 'Actual Output Yield',
      dataIndex: 'actualOutput',
      key: 'actualOutput',
      render: (val: number, record: ProductionBatch) => (
        <span className="font-bold font-mono text-emerald-800 text-sm">
          {formatNumber(val, 0)} {record.product?.unit}
        </span>
      ),
    },
    {
      title: 'Wastage / Scrap',
      dataIndex: 'wastageQuantity',
      key: 'wastageQuantity',
      render: (val: number, record: ProductionBatch) => (
        <Tag color={val > 0 ? 'volcano' : 'default'} className="font-mono text-xs">
          {val} {record.product?.unit} loss
        </Tag>
      ),
    },
    {
      title: 'Stock Update Status',
      key: 'status',
      render: () => <Tag color="green">RM DEDUCTED & FG ADDED ✅</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: ProductionBatch) => (
        <Button
          size="small"
          icon={<Eye className="w-3.5 h-3.5 inline mr-1" />}
          onClick={() => setSelectedBatch(record)}
        >
          Batch Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Factory className="w-5 h-5 text-amber-600" /> Production Batches & Frying Plant History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log of all completed factory production runs, consumed ingredients, output yield, and wastage.
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4 inline mr-1" />}
          onClick={() => navigate('/production/new')}
          className="bg-amber-600 font-semibold h-10"
        >
          ⚡ Run New Production Batch
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table
          dataSource={data?.data || []}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        title={`Production Batch Ticket: ${selectedBatch?.batchNumber}`}
        open={!!selectedBatch}
        onCancel={() => setSelectedBatch(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedBatch(null)}>
            Close
          </Button>,
        ]}
        width={680}
      >
        {selectedBatch && (
          <div className="space-y-4 mt-3">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase">Product</span>
                <div className="font-bold text-sm text-slate-900">
                  {selectedBatch.product?.productName}
                </div>
                <div className="text-slate-500">SKU: {selectedBatch.product?.sku}</div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase">Batch Metrics</span>
                <div className="font-bold text-emerald-800">
                  Actual Output: {selectedBatch.actualOutput} {selectedBatch.product?.unit}
                </div>
                <div className="text-rose-700">
                  Wastage: {selectedBatch.wastageQuantity} {selectedBatch.product?.unit}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Raw Materials Consumed (Deducted from Stock)
              </h4>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b">
                    <th className="p-2">Material</th>
                    <th className="p-2 text-right">Quantity Consumed</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBatch.consumptions.map((c, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2 font-medium">{c.rawMaterial?.materialName}</td>
                      <td className="p-2 text-right font-mono font-bold text-rose-700">
                        -{c.quantityConsumed} {c.rawMaterial?.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
