import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Form, Select, Input, InputNumber, Button, DatePicker, message, Divider } from 'antd';
import { Plus, Trash2, Receipt, ArrowLeft, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../api/client';
import { Customer, Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface SaleItemRow {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export const NewSalePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [items, setItems] = useState<SaleItemRow[]>([
    { productId: '', quantity: 50, unitPrice: 30 },
  ]);

  // Load Customers & Products
  const { data: customersData } = useQuery<{ data: Customer[] }>({
    queryKey: ['customers'],
    queryFn: () => api.get('/masters/customers'),
  });

  const { data: productsData } = useQuery<{ data: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api.get('/masters/products'),
  });

  const customers = customersData?.data || [];
  const products = productsData?.data || [];

  const mutation = useMutation({
    mutationFn: (payload: any) => api.post('/sales', payload),
    onSuccess: () => {
      message.success('Sale invoice created and finished goods stock deducted immediately (STOCK_OUT)!');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-finished-stock'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/sales');
    },
    onError: (err: any) => {
      message.error(err.message || 'Failed to create sale invoice');
    },
  });

  const addItemRow = () => {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemRow = (index: number, field: keyof SaleItemRow, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-populate selling price when selecting product
    if (field === 'productId') {
      const selectedProduct = products.find((p) => p.id === value);
      if (selectedProduct) {
        updated[index].unitPrice = selectedProduct.sellingPrice;
      }
    }

    setItems(updated);
  };

  // Grand Total calculation
  const grandTotal = items.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0);
  }, 0);

  const handleSubmit = (values: any) => {
    const validItems = items.filter((i) => i.productId && i.quantity > 0 && i.unitPrice >= 0);
    if (validItems.length === 0) {
      message.error('Please add at least one product with quantity');
      return;
    }

    // Pre-validate FG stock availability
    for (const item of validItems) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod && prod.currentStock < item.quantity) {
        message.error(
          `Cannot create sale: Insufficient stock for '${prod.productName}'. Available: ${prod.currentStock} ${prod.unit}, Requested: ${item.quantity} ${prod.unit}. Run a production batch first.`
        );
        return;
      }
    }

    const payload = {
      customerId: values.customerId,
      saleDate: values.saleDate ? values.saleDate.toISOString() : new Date().toISOString(),
      notes: values.notes,
      paidAmount: values.paidAmount || grandTotal,
      items: validItems,
    };

    mutation.mutate(payload);
  };

  // 1-Click Demo Auto-fill Helper
  const handleQuickDemoFill = () => {
    const abcCustomer = customers.find((c) => c.customerName.includes('ABC Supermarket')) || customers[0];
    const classicProduct = products.find((p) => p.sku.includes('CHP-SLT')) || products[0];

    if (abcCustomer) {
      form.setFieldsValue({
        customerId: abcCustomer.id,
        saleDate: dayjs(),
        paidAmount: 1500,
        notes: 'Weekly dispatch to ABC Supermarket High Street store',
      });
    }

    if (classicProduct) {
      setItems([
        {
          productId: classicProduct.id,
          quantity: 50,
          unitPrice: classicProduct.sellingPrice || 30,
        },
      ]);
      message.success('Demo sale loaded: 50 packets Classic Salted Chips @ ₹30 = ₹1,500');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/sales')} />
          <div>
            <h2 className="text-xl font-bold text-slate-900">Generate Sales Invoice</h2>
            <p className="text-xs text-slate-500">
              Validates finished stock availability and deducts goods from Finished Goods inventory.
            </p>
          </div>
        </div>

        <Button
          type="dashed"
          icon={<Zap className="w-4 h-4 text-emerald-600 inline mr-1" />}
          onClick={handleQuickDemoFill}
          className="border-emerald-400 bg-emerald-50 text-emerald-900 font-semibold"
        >
          ⚡ Quick Demo Scenario (50 pkts Sale)
        </Button>
      </div>

      <Card className="shadow-sm rounded-xl border-slate-200">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="customerId"
              label={<span className="text-xs font-semibold text-slate-700">Select Customer / Store</span>}
              rules={[{ required: true, message: 'Please select customer' }]}
            >
              <Select placeholder="Choose customer" size="large" showSearch optionFilterProp="label">
                {customers.map((c) => (
                  <Select.Option key={c.id} value={c.id} label={c.customerName}>
                    {c.customerName} ({c.customerType})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="saleDate"
              label={<span className="text-xs font-semibold text-slate-700">Invoice Date</span>}
              initialValue={dayjs()}
            >
              <DatePicker className="w-full" size="large" />
            </Form.Item>
          </div>

          <Divider orientation="left" className="text-xs font-bold text-slate-500 my-4">
            Finished Goods Items (Will Deduct from Finished Stock Immediately)
          </Divider>

          <div className="space-y-3">
            {items.map((item, index) => {
              const selectedProd = products.find((p) => p.id === item.productId);
              const isInsufficient = selectedProd && selectedProd.currentStock < (item.quantity || 0);
              const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);

              return (
                <div
                  key={index}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border rounded-xl ${
                    isInsufficient ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                      Finished Product SKU
                    </label>
                    <Select
                      placeholder="Select finished snack product"
                      value={item.productId || undefined}
                      onChange={(val) => updateItemRow(index, 'productId', val)}
                      className="w-full"
                    >
                      {products.map((p) => (
                        <Select.Option key={p.id} value={p.id}>
                          {p.productName} ({p.packSize}) — In Stock: {p.currentStock} {p.unit}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  <div className="w-32">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                      Qty ({selectedProd?.unit || 'Packets'})
                    </label>
                    <InputNumber
                      min={1}
                      step={1}
                      value={item.quantity}
                      onChange={(val) => updateItemRow(index, 'quantity', val || 0)}
                      className="w-full font-mono"
                    />
                  </div>

                  <div className="w-36">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                      Rate / Unit (₹)
                    </label>
                    <InputNumber
                      min={0}
                      step={0.5}
                      value={item.unitPrice}
                      onChange={(val) => updateItemRow(index, 'unitPrice', val || 0)}
                      className="w-full"
                    />
                  </div>

                  <div className="w-36 text-right">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                      Line Total
                    </label>
                    <div className="font-mono font-bold text-slate-800 py-1">
                      {formatCurrency(lineTotal)}
                    </div>
                  </div>

                  <div className="pt-4 sm:pt-0">
                    <Button
                      danger
                      type="text"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => removeItemRow(index)}
                      disabled={items.length <= 1}
                    />
                  </div>
                </div>
              );
            })}

            <Button
              type="dashed"
              icon={<Plus className="w-4 h-4 inline mr-1" />}
              onClick={addItemRow}
              block
              className="mt-2 font-medium"
            >
              + Add Another Product Line
            </Button>
          </div>

          <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Invoice Total Amount
              </span>
              <div className="text-2xl font-black text-emerald-950 font-mono">
                {formatCurrency(grandTotal)}
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="large" onClick={() => navigate('/sales')}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={mutation.isPending}
                icon={<CheckCircle2 className="w-4 h-4 inline mr-1" />}
                className="bg-amber-600 font-bold px-6 shadow-md"
              >
                Generate Invoice & Deduct Stock
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
};
