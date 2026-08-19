import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Form, Select, Input, InputNumber, Button, DatePicker, message, Divider } from 'antd';
import { Plus, Trash2, ShoppingCart, ArrowLeft, Zap, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../api/client';
import { Supplier, RawMaterial } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface PurchaseItemRow {
  rawMaterialId: string;
  quantity: number;
  unitPrice: number;
}

export const NewPurchasePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [items, setItems] = useState<PurchaseItemRow[]>([
    { rawMaterialId: '', quantity: 100, unitPrice: 30 },
  ]);

  // Load Suppliers & Raw Materials
  const { data: suppliersData } = useQuery<{ data: Supplier[] }>({
    queryKey: ['suppliers'],
    queryFn: () => api.get('/masters/suppliers'),
  });

  const { data: rawMaterialsData } = useQuery<{ data: RawMaterial[] }>({
    queryKey: ['raw-materials'],
    queryFn: () => api.get('/masters/raw-materials'),
  });

  const suppliers = suppliersData?.data || [];
  const rawMaterials = rawMaterialsData?.data || [];

  const mutation = useMutation({
    mutationFn: (payload: any) => api.post('/purchases', payload),
    onSuccess: (res: any) => {
      message.success('Purchase recorded! Raw material inventory updated immediately (STOCK_IN).');
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-raw-stock'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      navigate('/purchases');
    },
    onError: (err: any) => {
      message.error(err.message || 'Failed to record purchase');
    },
  });

  const addItemRow = () => {
    setItems([...items, { rawMaterialId: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemRow = (index: number, field: keyof PurchaseItemRow, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-populate standard cost when selecting material
    if (field === 'rawMaterialId') {
      const selectedRM = rawMaterials.find((rm) => rm.id === value);
      if (selectedRM) {
        updated[index].unitPrice = selectedRM.standardCost;
      }
    }

    setItems(updated);
  };

  // Grand Total calculation
  const grandTotal = items.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0);
  }, 0);

  const handleSubmit = (values: any) => {
    // Validate items
    const validItems = items.filter((i) => i.rawMaterialId && i.quantity > 0 && i.unitPrice >= 0);
    if (validItems.length === 0) {
      message.error('Please add at least one valid raw material with quantity');
      return;
    }

    const payload = {
      supplierId: values.supplierId,
      purchaseDate: values.purchaseDate ? values.purchaseDate.toISOString() : new Date().toISOString(),
      invoiceNumber: values.invoiceNumber,
      notes: values.notes,
      paidAmount: values.paidAmount || grandTotal,
      items: validItems,
    };

    mutation.mutate(payload);
  };

  // 1-Click Demo Auto-fill Helper
  const handleQuickDemoFill = () => {
    const agroSupplier = suppliers.find((s) => s.supplierName.includes('Agro Fresh')) || suppliers[0];
    const rmPotato = rawMaterials.find((r) => r.materialCode === 'RM-POT-01');
    const rmOil = rawMaterials.find((r) => r.materialCode === 'RM-OIL-01');
    const rmSalt = rawMaterials.find((r) => r.materialCode === 'RM-SLT-01');
    const rmPouch = rawMaterials.find((r) => r.materialCode === 'RM-PCH-100');

    if (agroSupplier) {
      form.setFieldsValue({
        supplierId: agroSupplier.id,
        invoiceNumber: 'INV-AGRO-9021',
        purchaseDate: dayjs(),
        paidAmount: 7800,
        notes: 'Demo Raw Material Purchase batch for Potato Chips plant',
      });
    }

    const demoItems: PurchaseItemRow[] = [];
    if (rmPotato) demoItems.push({ rawMaterialId: rmPotato.id, quantity: 100, unitPrice: 30 }); // ₹3,000
    if (rmOil) demoItems.push({ rawMaterialId: rmOil.id, quantity: 30, unitPrice: 120 });       // ₹3,600
    if (rmSalt) demoItems.push({ rawMaterialId: rmSalt.id, quantity: 10, unitPrice: 20 });       // ₹200
    if (rmPouch) demoItems.push({ rawMaterialId: rmPouch.id, quantity: 500, unitPrice: 2 });    // ₹1,000

    if (demoItems.length > 0) {
      setItems(demoItems);
      message.success('Demo purchase items loaded (Potatoes, Oil, Salt, Pouches)!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/purchases')} />
          <div>
            <h2 className="text-xl font-bold text-slate-900">Record Raw Material Purchase</h2>
            <p className="text-xs text-slate-500">
              Saving this order automatically inward inventory to Raw Material stock.
            </p>
          </div>
        </div>

        <Button
          type="dashed"
          icon={<Zap className="w-4 h-4 text-amber-600 inline mr-1" />}
          onClick={handleQuickDemoFill}
          className="border-amber-400 bg-amber-50 text-amber-900 font-semibold"
        >
          ⚡ Quick Demo Scenario Auto-Fill
        </Button>
      </div>

      <Card className="shadow-sm rounded-xl border-slate-200">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Form.Item
              name="supplierId"
              label={<span className="text-xs font-semibold text-slate-700">Select Supplier</span>}
              rules={[{ required: true, message: 'Please select supplier' }]}
            >
              <Select placeholder="Choose supplier" size="large" showSearch optionFilterProp="label">
                {suppliers.map((s) => (
                  <Select.Option key={s.id} value={s.id} label={s.supplierName}>
                    {s.supplierName} ({s.mobileNumber})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="purchaseDate"
              label={<span className="text-xs font-semibold text-slate-700">Purchase Date</span>}
              initialValue={dayjs()}
            >
              <DatePicker className="w-full" size="large" />
            </Form.Item>

            <Form.Item
              name="invoiceNumber"
              label={<span className="text-xs font-semibold text-slate-700">Supplier Bill / DC #</span>}
            >
              <Input placeholder="e.g. AGRO-BILL-1049" size="large" />
            </Form.Item>
          </div>

          <Divider orientation="left" className="text-xs font-bold text-slate-500 my-4">
            Raw Material Line Items (Will Inward to Stock Immediately)
          </Divider>

          <div className="space-y-3">
            {items.map((item, index) => {
              const selectedRM = rawMaterials.find((rm) => rm.id === item.rawMaterialId);
              const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);

              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                      Raw Material
                    </label>
                    <Select
                      placeholder="Select ingredient / material"
                      value={item.rawMaterialId || undefined}
                      onChange={(val) => updateItemRow(index, 'rawMaterialId', val)}
                      className="w-full"
                      size="middle"
                      showSearch
                      optionFilterProp="label"
                    >
                      {rawMaterials.map((rm) => (
                        <Select.Option
                          key={rm.id}
                          value={rm.id}
                          label={`${rm.materialName} (${rm.unit})`}
                        >
                          {rm.materialName} - Current: {rm.currentStock} {rm.unit}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  <div className="w-32">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                      Qty ({selectedRM?.unit || 'Units'})
                    </label>
                    <InputNumber
                      min={0.1}
                      step={1}
                      value={item.quantity}
                      onChange={(val) => updateItemRow(index, 'quantity', val || 0)}
                      className="w-full"
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
              + Add Another Material
            </Button>
          </div>

          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Purchase Order Total
              </span>
              <div className="text-2xl font-black text-amber-950 font-mono">
                {formatCurrency(grandTotal)}
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="large" onClick={() => navigate('/purchases')}>
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
                Inward Purchase & Update Stock
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
};
