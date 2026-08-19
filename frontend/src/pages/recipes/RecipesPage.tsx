import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Tag, Card } from 'antd';
import { Plus, Trash2, FileSpreadsheet, Factory } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { Recipe, Product, RawMaterial } from '../../types';

export const RecipesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [recipeItems, setRecipeItems] = useState<{ rawMaterialId: string; quantity: number }[]>([
    { rawMaterialId: '', quantity: 1 },
  ]);

  const { data: recipesData, isLoading } = useQuery<{ data: Recipe[] }>({
    queryKey: ['recipes'],
    queryFn: () => api.get('/recipes'),
  });

  const { data: productsData } = useQuery<{ data: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api.get('/masters/products'),
  });

  const { data: rawMaterialsData } = useQuery<{ data: RawMaterial[] }>({
    queryKey: ['raw-materials'],
    queryFn: () => api.get('/masters/raw-materials'),
  });

  const products = productsData?.data || [];
  const rawMaterials = rawMaterialsData?.data || [];

  const mutation = useMutation({
    mutationFn: (payload: any) => api.post('/recipes', payload),
    onSuccess: () => {
      message.success('Standard Recipe / BOM saved successfully');
      setIsModalOpen(false);
      form.resetFields();
      setRecipeItems([{ rawMaterialId: '', quantity: 1 }]);
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      message.error(err.message || 'Failed to save recipe');
    },
  });

  const addIngredientRow = () => {
    setRecipeItems([...recipeItems, { rawMaterialId: '', quantity: 1 }]);
  };

  const removeIngredientRow = (idx: number) => {
    if (recipeItems.length <= 1) return;
    setRecipeItems(recipeItems.filter((_, i) => i !== idx));
  };

  const updateIngredient = (idx: number, field: 'rawMaterialId' | 'quantity', val: any) => {
    const updated = [...recipeItems];
    updated[idx] = { ...updated[idx], [field]: val };
    setRecipeItems(updated);
  };

  const handleSubmit = (values: any) => {
    const validItems = recipeItems.filter((i) => i.rawMaterialId && i.quantity > 0);
    if (validItems.length === 0) {
      message.error('Please configure at least one raw material for the recipe');
      return;
    }

    mutation.mutate({
      productId: values.productId,
      recipeName: values.recipeName,
      outputYield: values.outputYield || 180,
      notes: values.notes,
      items: validItems,
    });
  };

  const columns = [
    {
      title: 'Recipe Name',
      dataIndex: 'recipeName',
      key: 'recipeName',
      render: (val: string, record: Recipe) => (
        <div>
          <div className="font-bold text-slate-900">{val}</div>
          <div className="text-xs text-amber-700 font-medium">
            For: {record.product?.productName} ({record.product?.sku})
          </div>
        </div>
      ),
    },
    {
      title: 'Standard Yield Output',
      dataIndex: 'outputYield',
      key: 'outputYield',
      render: (val: number, record: Recipe) => (
        <Tag color="purple" className="font-bold font-mono text-xs">
          {val} {record.product?.unit || 'PACKETS'}
        </Tag>
      ),
    },
    {
      title: 'Bill of Materials (RM Ingredients)',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => (
        <div className="space-y-1">
          {items?.map((item, idx) => (
            <div key={idx} className="text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span className="font-medium text-slate-800">{item.rawMaterial?.materialName}:</span>
              <span className="font-mono text-slate-600 font-bold">
                {item.quantity} {item.rawMaterial?.unit}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (val: boolean) => (
        <Tag color={val ? 'green' : 'default'}>{val ? 'ACTIVE FORMULA' : 'ARCHIVED'}</Tag>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-600" /> Recipes & Bill of Materials (BOM)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard input formulations defining exact raw material consumption required per finished batch.
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4 inline mr-1" />}
          onClick={() => {
            form.resetFields();
            setRecipeItems([{ rawMaterialId: '', quantity: 1 }]);
            setIsModalOpen(true);
          }}
          className="bg-amber-600 font-semibold h-10"
        >
          Create New Recipe Formula
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table
          dataSource={recipesData?.data || []}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={false}
        />
      </div>

      {/* Modal */}
      <Modal
        title="Create Standard BOM Formula"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={650}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-3">
          <Form.Item
            name="productId"
            label="Finished Product"
            rules={[{ required: true, message: 'Please select product' }]}
          >
            <Select placeholder="Select product">
              {products.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.productName} ({p.sku})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="recipeName"
              label="Formula Name"
              rules={[{ required: true, message: 'Please enter formula name' }]}
            >
              <Input placeholder="e.g. Standard 50kg Batch" />
            </Form.Item>

            <Form.Item
              name="outputYield"
              label="Standard Output Yield (Packets)"
              initialValue={180}
              rules={[{ required: true, message: 'Please enter output yield' }]}
            >
              <InputNumber className="w-full" min={1} placeholder="180" />
            </Form.Item>
          </div>

          <label className="text-xs font-bold text-slate-700 block mb-2">
            Raw Material Ingredients (Per Batch)
          </label>
          <div className="space-y-2 mb-4">
            {recipeItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border">
                <Select
                  placeholder="Select ingredient"
                  value={item.rawMaterialId || undefined}
                  onChange={(val) => updateIngredient(idx, 'rawMaterialId', val)}
                  className="flex-1"
                >
                  {rawMaterials.map((rm) => (
                    <Select.Option key={rm.id} value={rm.id}>
                      {rm.materialName} ({rm.unit})
                    </Select.Option>
                  ))}
                </Select>

                <InputNumber
                  min={0.1}
                  step={0.5}
                  value={item.quantity}
                  onChange={(val) => updateIngredient(idx, 'quantity', val || 0)}
                  placeholder="Qty"
                  className="w-28"
                />

                <Button
                  danger
                  type="text"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={() => removeIngredientRow(idx)}
                  disabled={recipeItems.length <= 1}
                />
              </div>
            ))}
            <Button type="dashed" size="small" onClick={addIngredientRow} block>
              + Add Ingredient
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isPending}
              className="bg-amber-600 font-semibold"
            >
              Save Recipe Formula
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
