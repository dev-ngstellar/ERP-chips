import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, message, Tag } from 'antd';
import { Plus, DollarSign, Fuel, Zap, Users, Truck } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../api/client';
import { Expense } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ExpensesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: Expense[] }>({
    queryKey: ['expenses'],
    queryFn: () => api.get('/expenses'),
  });

  const mutation = useMutation({
    mutationFn: (values: any) => api.post('/expenses', values),
    onSuccess: () => {
      message.success('Factory expense recorded successfully');
      setIsModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
    onError: (err: any) => {
      message.error(err.message || 'Failed to record expense');
    },
  });

  const handleSubmit = (values: any) => {
    mutation.mutate({
      title: values.title,
      category: values.category,
      amount: values.amount,
      paymentMode: values.paymentMode || 'CASH',
      expenseDate: values.expenseDate ? values.expenseDate.toISOString() : new Date().toISOString(),
      notes: values.notes,
    });
  };

  const expenses = data?.data || [];
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const columns = [
    {
      title: 'Expense Date',
      dataIndex: 'expenseDate',
      key: 'expenseDate',
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Title / Description',
      dataIndex: 'title',
      key: 'title',
      render: (val: string, record: Expense) => (
        <div>
          <div className="font-bold text-slate-800">{val}</div>
          {record.notes && <div className="text-xs text-slate-400">{record.notes}</div>}
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (val: string) => {
        const catColor: Record<string, string> = {
          ELECTRICITY_POWER: 'gold',
          FUEL_GAS: 'volcano',
          LABOR_WAGES: 'blue',
          FACTORY_RENT: 'purple',
          LOGISTICS_TRANSPORT: 'cyan',
        };
        return <Tag color={catColor[val] || 'default'}>{val.replace('_', ' ')}</Tag>;
      },
    },
    {
      title: 'Payment Mode',
      dataIndex: 'paymentMode',
      key: 'paymentMode',
      render: (val: string) => (
        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded font-medium">
          {val}
        </span>
      ),
    },
    {
      title: 'Amount (₹)',
      dataIndex: 'amount',
      key: 'amount',
      render: (val: number) => (
        <span className="font-bold font-mono text-rose-700">{formatCurrency(val)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-600" /> Operational & Factory Expenses
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log fuel/gas cylinders, frying electricity power, factory rent, worker wages, and freight.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-rose-50 px-4 py-2 rounded-lg border border-rose-200 text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
              Total Expenses Recorded
            </span>
            <div className="text-base font-black text-rose-950">
              {formatCurrency(totalExpenses)}
            </div>
          </div>

          <Button
            type="primary"
            icon={<Plus className="w-4 h-4 inline mr-1" />}
            onClick={() => {
              form.resetFields();
              setIsModalOpen(true);
            }}
            className="bg-amber-600 font-semibold h-10"
          >
            + Record Expense
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table
          dataSource={expenses}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Modal Form */}
      <Modal
        title="Record Factory Expense"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Form.Item
            name="title"
            label="Expense Title"
            rules={[{ required: true, message: 'Please enter expense title' }]}
          >
            <Input placeholder="e.g. Commercial Frying LPG Gas Refills (2 Cylinders)" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="category"
              label="Expense Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select placeholder="Select category">
                <Select.Option value="FUEL_GAS">FUEL / GAS CYLINDERS</Select.Option>
                <Select.Option value="ELECTRICITY_POWER">ELECTRICITY & POWER</Select.Option>
                <Select.Option value="LABOR_WAGES">LABOR & OPERATOR WAGES</Select.Option>
                <Select.Option value="FACTORY_RENT">FACTORY RENT</Select.Option>
                <Select.Option value="LOGISTICS_TRANSPORT">LOGISTICS & FREIGHT</Select.Option>
                <Select.Option value="MAINTENANCE">PLANT MAINTENANCE</Select.Option>
                <Select.Option value="OTHER">OTHER EXPENSES</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="amount"
              label="Amount (₹)"
              rules={[{ required: true, message: 'Please enter amount' }]}
            >
              <InputNumber className="w-full" min={1} placeholder="500.00" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="paymentMode" label="Payment Mode" initialValue="CASH">
              <Select>
                <Select.Option value="CASH">Cash</Select.Option>
                <Select.Option value="UPI">UPI / GPay</Select.Option>
                <Select.Option value="BANK_TRANSFER">Bank Transfer</Select.Option>
                <Select.Option value="CHEQUE">Cheque</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="expenseDate" label="Date" initialValue={dayjs()}>
              <DatePicker className="w-full" />
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Notes / Bill Ref">
            <Input.TextArea rows={2} placeholder="Bill # or vendor reference" />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isPending}
              className="bg-amber-600 font-semibold"
            >
              Save Expense
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
