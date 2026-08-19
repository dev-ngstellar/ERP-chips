import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, InputNumber, message, Tag } from 'antd';
import { Plus, Edit2, Building2, Phone, Mail } from 'lucide-react';
import api from '../../api/client';
import { Supplier } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export const SuppliersPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: Supplier[] }>({
    queryKey: ['suppliers'],
    queryFn: () => api.get('/masters/suppliers'),
  });

  const mutation = useMutation({
    mutationFn: (values: any) => {
      if (editingSupplier) {
        return api.put(`/masters/suppliers/${editingSupplier.id}`, values);
      }
      return api.post('/masters/suppliers', values);
    },
    onSuccess: () => {
      message.success(
        editingSupplier ? 'Supplier updated successfully' : 'Supplier created successfully'
      );
      setIsModalOpen(false);
      form.resetFields();
      setEditingSupplier(null);
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (err: any) => {
      message.error(err.message || 'Failed to save supplier');
    },
  });

  const handleEdit = (s: Supplier) => {
    setEditingSupplier(s);
    form.setFieldsValue({
      supplierName: s.supplierName,
      contactPerson: s.contactPerson,
      mobileNumber: s.mobileNumber,
      gstNumber: s.gstNumber,
      address: s.address,
      openingBalance: s.openingBalance,
    });
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingSupplier(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Supplier Name',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (val: string, record: Supplier) => (
        <div>
          <div className="font-bold text-slate-800">{val}</div>
          {record.contactPerson && (
            <div className="text-xs text-slate-500">Contact: {record.contactPerson}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Mobile / Phone',
      dataIndex: 'mobileNumber',
      key: 'mobileNumber',
      render: (val: string) => <span className="font-mono text-xs">{val}</span>,
    },
    {
      title: 'GST Number',
      dataIndex: 'gstNumber',
      key: 'gstNumber',
      render: (val: string) => (
        <span className="font-mono text-xs text-slate-600">{val || '-'}</span>
      ),
    },
    {
      title: 'Outstanding Payable',
      dataIndex: 'currentBalance',
      key: 'currentBalance',
      render: (val: number) => (
        <span className="font-bold font-mono text-rose-700">{formatCurrency(val)}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Supplier) => (
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
            <Building2 className="w-5 h-5 text-amber-600" /> Supplier Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage raw material vendors, agricultural suppliers, oil refineries, and packaging houses.
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4 inline mr-1" />}
          onClick={handleOpenNew}
          className="bg-amber-600 font-semibold h-10"
        >
          Add New Supplier
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
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
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
            name="supplierName"
            label="Supplier Company Name"
            rules={[{ required: true, message: 'Please enter supplier name' }]}
          >
            <Input placeholder="e.g. Agro Fresh Farms Pvt Ltd" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="contactPerson" label="Contact Person">
              <Input placeholder="e.g. Harish Kumar" />
            </Form.Item>

            <Form.Item
              name="mobileNumber"
              label="Mobile Number"
              rules={[{ required: true, message: 'Please enter mobile number' }]}
            >
              <Input placeholder="+91 98765 43210" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="gstNumber" label="GST Number">
              <Input placeholder="27AABCA1234F1Z5" />
            </Form.Item>

            <Form.Item name="openingBalance" label="Opening Balance (₹)" initialValue={0}>
              <InputNumber className="w-full" min={0} placeholder="0.00" />
            </Form.Item>
          </div>

          <Form.Item name="address" label="Address / Mandi Location">
            <Input.TextArea rows={2} placeholder="Plot 42, Agro Mandi, Nashik" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isPending}
              className="bg-amber-600 font-semibold"
            >
              {editingSupplier ? 'Save Changes' : 'Create Supplier'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
