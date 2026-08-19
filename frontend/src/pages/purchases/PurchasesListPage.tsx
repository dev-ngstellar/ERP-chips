import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Button, Tag, Modal, Card } from 'antd';
import { Plus, ShoppingCart, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { Purchase } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const PurchasesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const { data, isLoading } = useQuery<{ data: Purchase[] }>({
    queryKey: ['purchases'],
    queryFn: () => api.get('/purchases'),
  });

  const columns = [
    {
      title: 'Purchase PO #',
      dataIndex: 'purchaseNumber',
      key: 'purchaseNumber',
      render: (val: string) => <span className="font-mono font-bold text-amber-700">{val}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Supplier',
      dataIndex: ['supplier', 'supplierName'],
      key: 'supplier',
      render: (val: string) => <span className="font-bold text-slate-800">{val}</span>,
    },
    {
      title: 'Supplier Invoice #',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (val: string) => <span className="font-mono text-xs">{val || '-'}</span>,
    },
    {
      title: 'Items Inwarded',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => (
        <span className="text-xs bg-slate-100 px-2 py-1 rounded-md font-medium">
          {items?.length || 0} Materials
        </span>
      ),
    },
    {
      title: 'Total Amount (₹)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val: number) => (
        <span className="font-bold font-mono text-slate-900">{formatCurrency(val)}</span>
      ),
    },
    {
      title: 'Stock Inward Status',
      key: 'status',
      render: () => <Tag color="green">STOCK INWARDED ✅</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Purchase) => (
        <Button
          size="small"
          icon={<Eye className="w-3.5 h-3.5 inline mr-1" />}
          onClick={() => setSelectedPurchase(record)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-600" /> Purchase Orders & Inwarding History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View all completed raw material purchase receipts and inventory inwardings.
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4 inline mr-1" />}
          onClick={() => navigate('/purchases/new')}
          className="bg-amber-600 font-semibold h-10"
        >
          + Inward New Purchase
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

      {/* Purchase Detail Modal */}
      <Modal
        title={`Purchase Order: ${selectedPurchase?.purchaseNumber}`}
        open={!!selectedPurchase}
        onCancel={() => setSelectedPurchase(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedPurchase(null)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedPurchase && (
          <div className="space-y-4 mt-3">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase">Supplier</span>
                <div className="font-bold text-sm text-slate-900">
                  {selectedPurchase.supplier.supplierName}
                </div>
                <div className="text-slate-500">{selectedPurchase.supplier.mobileNumber}</div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase">Purchase Details</span>
                <div className="font-medium text-slate-800">
                  Date: {formatDate(selectedPurchase.purchaseDate)}
                </div>
                <div className="font-medium text-slate-800">
                  Inv #: {selectedPurchase.invoiceNumber || 'N/A'}
                </div>
              </div>
            </div>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b">
                  <th className="p-2">Raw Material</th>
                  <th className="p-2 text-right">Quantity</th>
                  <th className="p-2 text-right">Rate (₹)</th>
                  <th className="p-2 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {selectedPurchase.items.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2 font-medium">
                      {item.rawMaterial?.materialName}
                      <span className="text-[10px] text-slate-400 ml-1">
                        ({item.rawMaterial?.materialCode})
                      </span>
                    </td>
                    <td className="p-2 text-right font-mono">
                      {item.quantity} {item.rawMaterial?.unit}
                    </td>
                    <td className="p-2 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-2 text-right font-mono font-bold">
                      {formatCurrency(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-amber-50/60 font-bold text-sm">
                  <td colSpan={3} className="p-2 text-right">
                    Grand Total:
                  </td>
                  <td className="p-2 text-right font-mono text-amber-900">
                    {formatCurrency(selectedPurchase.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};
