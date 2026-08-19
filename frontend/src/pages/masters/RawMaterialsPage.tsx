import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Tag } from 'antd';
import { Plus, Edit2, Wheat } from 'lucide-react';
import api from '../../api/client';
import { RawMaterial } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { StockBadge } from '../../components/common/StockBadge';

export const RawMaterialsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRM, setEditingRM] = useState<RawMaterial | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: RawMaterial[] }>({
    queryKey: ['raw-materials'],
    queryFn: () => api.get('/masters/raw-materials'),
  });

  const mutation = useMutation({
    mutationFn: (values: any) => {
      if (editingRM) {
        return api.put(`/masters/raw-materials/${editingRM.id}`, values);
      }
      return api.post('/masters/raw-materials', values);
    },
    onSuccess: () => {
      message.success(
        editingRM ? 'Raw material updated successfully' : 'Raw material created successfully'
      );
      setIsModalOpen(false);
      form.resetFields();
      setEditingRM(null);
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
    },
    onError: (err: any) => {
      message.error(err.message || 'Failed to save raw material');
    },
  });

  const handleEdit = (rm: RawMaterial) => {
    setEditingRM(rm);
    form.setFieldsValue({
      materialName: rm.materialName,
      materialCode: rm.materialCode,
      category: rm.category,
      unit: rm.unit,
      minStockLevel: rm.minStockLevel,
      standardCost: rm.standardCost,
    });
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingRM(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Material Name',
      dataIndex: 'materialName',
      key: 'materialName',
      render: (val: string, record: RawMaterial) => (
        <div>
          <div className="font-bold text-slate-800">{val}</div>
          <div className="text-xs text-slate-400 font-mono">{record.materialCode}</div>
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
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      render: (val: string) => <span className="font-mono font-medium">{val}</span>,
    },
    {
      title: 'Std Cost / Rate',
      dataIndex: 'standardCost',
      key: 'standardCost',
      render: (val: number, record: RawMaterial) => (
        <span className="font-medium text-slate-700">
          {formatCurrency(val)} / {record.unit}
        </span>
      ),
    },
    {
      title: 'Current Available Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (val: number, record: RawMaterial) => (
        <StockBadge currentStock={val} minStockLevel={record.minStockLevel} unit={record.unit} />
      ),
    },
    {
      title: 'Min Stock Level',
      dataIndex: 'minStockLevel',
      key: 'minStockLevel',
      render: (val: number, record: RawMaterial) => (
        <span className="text-slate-500 font-mono">
          {val} {record.unit}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: RawMaterial) => (
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
            <Wheat className="w-5 h-5 text-amber-600" /> Raw Materials Master
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure potatoes, edible oils, seasonings, spices, and packaging pouches used in production.
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4 inline mr-1" />}
          onClick={handleOpenNew}
          className="bg-amber-600 font-semibold h-10"
        >
          Add New Raw Material
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
        title={editingRM ? 'Edit Raw Material' : 'Add New Raw Material'}
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
            name="materialName"
            label="Material Name"
            rules={[{ required: true, message: 'Please enter material name' }]}
          >
            <Input placeholder="e.g. Fresh Chip-Grade Potatoes (Lady Rosetta)" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="materialCode"
              label="Material Code"
              rules={[{ required: true, message: 'Please enter material code' }]}
            >
              <Input
                placeholder="e.g. RM-POT-01"
                disabled={!!editingRM}
                className="font-mono"
              />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select placeholder="Select category">
                <Select.Option value="Agro Products">Agro Products</Select.Option>
                <Select.Option value="Oils & Fats">Oils & Fats</Select.Option>
                <Select.Option value="Spices & Seasoning">Spices & Seasoning</Select.Option>
                <Select.Option value="Packaging Material">Packaging Material</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="unit" label="Unit of Measure" initialValue="KG">
              <Select>
                <Select.Option value="KG">KG</Select.Option>
                <Select.Option value="LITER">LITER</Select.Option>
                <Select.Option value="GRAM">GRAM</Select.Option>
                <Select.Option value="ML">ML</Select.Option>
                <Select.Option value="NOS">NOS (Pouches/Boxes)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="standardCost"
              label="Standard Cost / Rate (₹)"
              rules={[{ required: true, message: 'Please enter standard cost' }]}
            >
              <InputNumber className="w-full" min={0} step={0.5} placeholder="30.00" />
            </Form.Item>
          </div>

          <Form.Item
            name="minStockLevel"
            label="Minimum Reorder Stock Alert Level"
            initialValue={20}
          >
            <InputNumber className="w-full" min={0} placeholder="20" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isPending}
              className="bg-amber-600 font-semibold"
            >
              {editingRM ? 'Save Changes' : 'Create Material'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
