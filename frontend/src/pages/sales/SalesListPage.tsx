import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Button, Tag, Modal } from 'antd';
import { Plus, Receipt, Eye, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { Sale } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const SalesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const { data, isLoading } = useQuery<{ data: Sale[] }>({
    queryKey: ['sales'],
    queryFn: () => api.get('/sales'),
  });

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      title: 'Invoice Number #',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (val: string) => <span className="font-mono font-bold text-emerald-800">{val}</span>,
    },
    {
      title: 'Invoice Date',
      dataIndex: 'saleDate',
      key: 'saleDate',
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Customer / Client',
      dataIndex: ['customer', 'customerName'],
      key: 'customer',
      render: (val: string, record: Sale) => (
        <div>
          <div className="font-bold text-slate-800">{val}</div>
          <div className="text-[11px] text-slate-400">
            <Tag color="purple" className="py-0 px-1 text-[10px]">
              {record.customer?.customerType}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Items Billed',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => (
        <span className="text-xs bg-slate-100 px-2 py-1 rounded-md font-medium">
          {items?.length || 0} Products
        </span>
      ),
    },
    {
      title: 'Invoice Total (₹)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val: number) => (
        <span className="font-bold font-mono text-slate-900 text-sm">{formatCurrency(val)}</span>
      ),
    },
    {
      title: 'Dispatch Status',
      key: 'status',
      render: () => <Tag color="green">GOODS DISPATCHED ✅</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Sale) => (
        <Button
          size="small"
          icon={<Eye className="w-3.5 h-3.5 inline mr-1" />}
          onClick={() => setSelectedSale(record)}
        >
          View Invoice
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" /> Sales Invoices & Billing History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View customer invoices, wholesale dispatches, supermarket billings, and revenue.
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4 inline mr-1" />}
          onClick={() => navigate('/sales/new')}
          className="bg-amber-600 font-semibold h-10"
        >
          + Generate New Invoice
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

      {/* Printable Invoice Modal */}
      <Modal
        title={
          <div className="flex items-center justify-between pr-8">
            <span>Tax Invoice: {selectedSale?.invoiceNumber}</span>
            <Button size="small" icon={<Printer className="w-3.5 h-3.5 inline mr-1" />} onClick={handlePrint}>
              Print Invoice
            </Button>
          </div>
        }
        open={!!selectedSale}
        onCancel={() => setSelectedSale(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedSale(null)}>
            Close
          </Button>,
        ]}
        width={720}
      >
        {selectedSale && (
          <div className="p-4 border rounded-xl bg-white space-y-4 print:border-none">
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-amber-700">🍿 SnackCraft Chips & Snacks Plant</h3>
                <p className="text-xs text-slate-500">
                  Industrial Estate, Phase II, Manufacturing Unit<br />
                  GSTIN: 27AAAAA0000A1Z5 | Phone: +91 98000 12345
                </p>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-slate-800">{selectedSale.invoiceNumber}</div>
                <div className="text-xs text-slate-500">{formatDate(selectedSale.saleDate)}</div>
              </div>
            </div>

            {/* Bill To */}
            <div className="bg-slate-50 p-3 rounded-lg text-xs grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-slate-400 uppercase">Billed To:</span>
                <div className="font-bold text-sm text-slate-900 mt-0.5">
                  {selectedSale.customer.customerName}
                </div>
                <div className="text-slate-600">{selectedSale.customer.address || 'Direct Dispatch'}</div>
                <div className="text-slate-600">Mobile: {selectedSale.customer.mobileNumber}</div>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-400 uppercase">Customer Type:</span>
                <div className="font-semibold text-slate-800 mt-0.5">{selectedSale.customer.customerType}</div>
                <div className="text-slate-600">GST: {selectedSale.customer.gstNumber || 'Unregistered'}</div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b">
                  <th className="p-2">Snack Item / Pack Size</th>
                  <th className="p-2 text-right">Quantity</th>
                  <th className="p-2 text-right">Rate / Pkt (₹)</th>
                  <th className="p-2 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {selectedSale.items.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2 font-medium">
                      {item.product?.productName}
                      <span className="text-[10px] text-slate-400 ml-1">({item.product?.packSize})</span>
                    </td>
                    <td className="p-2 text-right font-mono font-bold">
                      {item.quantity} {item.product?.unit}
                    </td>
                    <td className="p-2 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-emerald-50/60 font-bold text-sm">
                  <td colSpan={3} className="p-2 text-right">
                    Grand Total Amount:
                  </td>
                  <td className="p-2 text-right font-mono text-emerald-900">
                    {formatCurrency(selectedSale.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="text-[11px] text-slate-400 text-center pt-2">
              Thank you for your business! All goods manufactured under strict hygienic food safety standards.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
