import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Tag } from 'antd';
import { Plus, Edit2, Users, ShoppingBag } from 'lucide-react';
import api from '../../api/client';
import { Customer } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export const CustomersPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: Customer[] }>({
    queryKey: ['customers'],
    queryFn: () => api.get('/masters/customers'),
  });

  const mutation = useMutation({
    mutationFn: (values: any) => {
      if (editingCustomer) {
        return api.put(`/masters/customers/${editingCustomer.id}`, values);
      }
      return api.post('/masters/customers', values);
    },
    onSuccess: () => {
      message.success(
        editingCustomer ? 'Customer updated successfully' : 'Customer created successfully'
      );
      setIsModalOpen(false);
      form.resetFields();
      setEditingCustomer(null);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err: any) => {
      message.error(err.message || 'Failed to save customer');
    },
  });

  const handleEdit = (c: Customer) => {
    setEditingCustomer(c);
    form.setFieldsValue({
      customerName: c.customerName,
      customerType: c.customerType,
      contactPerson: c.contactPerson,
      mobileNumber: c.mobileNumber,
      gstNumber: c.gstNumber,
      address: c.address,
      creditLimit: c.creditLimit,
      openingBalance: c.openingBalance,
    });
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingCustomer(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Customer / Store Name',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (val: string, record: Customer) => (
        <div>
          <div className="font-bold text-slate-800">{val}</div>
          {record.contactPerson && (
            <div className="text-xs text-slate-500">Contact: {record.contactPerson}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'customerType',
      key: 'customerType',
      render: (val: string) => {
        const colorMap: Record<string, string> = {
          SUPERMARKET: 'purple',
          DISTRIBUTOR: 'blue',
          RETAILER: 'green',
          DIRECT_CUSTOMER: 'orange',
        };
        return <Tag color={colorMap[val] || 'default'}>{val}</Tag>;
      },
    },
    {
      title: 'Mobile',
      dataIndex: 'mobileNumber',
      key: 'mobileNumber',
      render: (val: string) => <span className="font-mono text-xs">{val}</span>,
    },
    {
      title: 'Credit Limit',
      dataIndex: 'creditLimit',
      key: 'creditLimit',
      render: (val: number) => (
        <span className="font-mono text-slate-700">{formatCurrency(val)}</span>
      ),
    },
    {
      title: 'Receivable Balance',
      dataIndex: 'currentBalance',
      key: 'currentBalance',
      render: (val: number) => (
        <span className="font-bold font-mono text-emerald-700">{formatCurrency(val)}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Customer) => (
        <Button
          size="small"
          icon={<Edit2 className="w-3.5 h-3.5 inline mr-1" />}
          onClick={() => handleEdit(record)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" /> Customer & Retailer Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Supermarkets, retail grocery shops, snack distributors, and wholesale buyers.
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4 inline mr-1" />}
          onClick={handleOpenNew}
          className="bg-amber-600 font-semibold h-10"
        >
          Add New Customer
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

      {/* Modal Form */}
      <Modal
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => mutation.mutate(values)}
          className="mt-4"
        >
          <Form.Item
            name="customerName"
            label="Customer / Business Name"
            rules={[{ required: true, message: 'Please enter customer name' }]}
          >
            <Input placeholder="e.g. ABC Supermarket Mart" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="customerType" label="Customer Type" initialValue="RETAILER">
              <Select>
                <Select.Option value="SUPERMARKET">SUPERMARKET</Select.Option>
                <Select.Option value="DISTRIBUTOR">DISTRIBUTOR</Select.Option>
                <Select.Option value="RETAILER">RETAILER</Select.Option>
                <Select.Option value="DIRECT_CUSTOMER">DIRECT CUSTOMER</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="mobileNumber"
              label="Mobile Number"
              rules={[{ required: true, message: 'Please enter mobile number' }]}
            >
              <Input placeholder="+91 99112 23344" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="contactPerson" label="Contact Person">
              <Input placeholder="e.g. Manoj Verma" />
            </Form.Item>

            <Form.Item name="gstNumber" label="GST Number">
              <Input placeholder="27DDDCU8899P1Z8" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="creditLimit" label="Credit Limit (₹)" initialValue={50000}>
              <InputNumber className="w-full" min={0} placeholder="50000" />
            </Form.Item>

            <Form.Item name="openingBalance" label="Opening Balance (₹)" initialValue={0}>
              <InputNumber className="w-full" min={0} placeholder="0.00" />
            </Form.Item>
          </div>

          <Form.Item name="address" label="Store Address">
            <Input.TextArea rows={2} placeholder="Shop 12, Main Market Road" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isPending}
              className="bg-amber-600 font-semibold"
            >
              {editingCustomer ? 'Save Changes' : 'Create Customer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
