import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Tag, Space } from 'antd';
import { Plus, Edit2, Package, Tag as TagIcon } from 'lucide-react';
import api from '../../api/client';
import { Product } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const ProductsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api.get('/masters/products'),
  });

  const mutation = useMutation({
    mutationFn: (values: any) => {
      if (editingProduct) {
        return api.put(`/masters/products/${editingProduct.id}`, values);
      }
      return api.post('/masters/products', values);
    },
    onSuccess: () => {
      message.success(
        editingProduct ? 'Product updated successfully' : 'Product created successfully'
      );
      setIsModalOpen(false);
      form.resetFields();
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      message.error(err.message || 'Failed to save product');
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      productName: product.productName,
      sku: product.sku,
      category: product.category,
      packSize: product.packSize,
      unit: product.unit,
      sellingPrice: product.sellingPrice,
      minStockLevel: product.minStockLevel,
    });
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      render: (val: string, record: Product) => (
        <div>
          <div className="font-bold text-slate-800">{val}</div>
          <div className="text-xs text-slate-400 font-mono">{record.sku}</div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (val: string) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: 'Pack Size',
      dataIndex: 'packSize',
      key: 'packSize',
      render: (val: string) => <span className="font-medium text-slate-700">{val}</span>,
    },
    {
      title: 'Selling Price (MRP/Rate)',
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      render: (val: number) => (
        <span className="font-bold text-emerald-700">{formatCurrency(val)}</span>
      ),
    },
    {
      title: 'Current FG Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (val: number, record: Product) => (
        <span className="font-bold font-mono text-slate-800">
          {formatNumber(val, 0)} {record.unit}
        </span>
      ),
    },
    {
      title: 'Min Stock Level',
      dataIndex: 'minStockLevel',
      key: 'minStockLevel',
      render: (val: number, record: Product) => (
        <span className="text-slate-500 font-mono">
          {val} {record.unit}
        </span>
      ),
    },
    {
      title: 'Recipe Status',
      key: 'recipes',
      render: (_: any, record: Product) => {
        const count = record.recipes?.length || 0;
        return count > 0 ? (
          <Tag color="green">BOM Configured ({count})</Tag>
        ) : (
          <Tag color="default">No BOM</Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Product) => (
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
            <Package className="w-5 h-5 text-amber-600" /> Finished Products Master
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage finished snack products, pack sizes, selling rates, and minimum inventory thresholds.
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4 inline mr-1" />}
          onClick={handleOpenNew}
          className="bg-amber-600 font-semibold h-10"
        >
          Add New Product
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
        title={editingProduct ? 'Edit Product' : 'Add New Finished Product'}
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
            name="productName"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="e.g. Classic Salted Potato Chips 100g" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="sku"
              label="SKU / Code"
              rules={[{ required: true, message: 'Please enter SKU' }]}
            >
              <Input
                placeholder="e.g. FG-CHP-SLT-100"
                disabled={!!editingProduct}
                className="font-mono"
              />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select placeholder="Select category">
                <Select.Option value="Potato Chips">Potato Chips</Select.Option>
                <Select.Option value="Extruded Snacks">Extruded Snacks</Select.Option>
                <Select.Option value="Namkeen & Savouries">Namkeen & Savouries</Select.Option>
                <Select.Option value="Corn Puffs">Corn Puffs</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="packSize"
              label="Pack Size"
              rules={[{ required: true, message: 'Please enter pack size' }]}
            >
              <Input placeholder="e.g. 100g, 200g, 500g" />
            </Form.Item>

            <Form.Item name="unit" label="Unit of Measure" initialValue="PACKET">
              <Select>
                <Select.Option value="PACKET">PACKET</Select.Option>
                <Select.Option value="BOX">BOX</Select.Option>
                <Select.Option value="NOS">NOS</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="sellingPrice"
              label="Selling Price (₹)"
              rules={[{ required: true, message: 'Please enter selling price' }]}
            >
              <InputNumber className="w-full" min={0} step={0.5} placeholder="30.00" />
            </Form.Item>

            <Form.Item
              name="minStockLevel"
              label="Min Stock Alert Level"
              initialValue={50}
            >
              <InputNumber className="w-full" min={0} placeholder="50" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isPending}
              className="bg-amber-600 font-semibold"
            >
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
