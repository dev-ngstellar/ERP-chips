import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Form, Select, Input, InputNumber, Button, DatePicker, message, Alert, Divider, Tag } from 'antd';
import { Factory, ArrowLeft, Zap, CheckCircle2, AlertCircle, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../api/client';
import { Product, RawMaterial, Recipe } from '../../types';

interface ConsumptionRow {
  rawMaterialId: string;
  quantityConsumed: number;
}

export const NewProductionBatchPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [consumptions, setConsumptions] = useState<ConsumptionRow[]>([]);

  // 1. Fetch Products
  const { data: productsData } = useQuery<{ data: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api.get('/masters/products'),
  });

  // 2. Fetch Raw Materials
  const { data: rawMaterialsData } = useQuery<{ data: RawMaterial[] }>({
    queryKey: ['raw-materials'],
    queryFn: () => api.get('/masters/raw-materials'),
  });

  const products = productsData?.data || [];
  const rawMaterials = rawMaterialsData?.data || [];

  // 3. Fetch Recipe when product changes
  const { data: recipeData } = useQuery<{ data: Recipe }>({
    queryKey: ['recipe-by-product', selectedProductId],
    queryFn: () => api.get(`/recipes/by-product/${selectedProductId}`),
    enabled: !!selectedProductId,
  });

  // Auto-populate consumption table from active recipe
  useEffect(() => {
    if (recipeData?.data?.items) {
      const bItems = recipeData.data.items.map((i) => ({
        rawMaterialId: i.rawMaterialId,
        quantityConsumed: i.quantity,
      }));
      setConsumptions(bItems);
      form.setFieldsValue({
        plannedOutput: recipeData.data.outputYield || 200,
        actualOutput: recipeData.data.outputYield || 180,
        wastageQuantity: 20,
      });
    }
  }, [recipeData]);

  const mutation = useMutation({
    mutationFn: (payload: any) => api.post('/production', payload),
    onSuccess: () => {
      message.success(
        'Production batch completed! Consumed raw materials deducted and finished goods added.'
      );
      queryClient.invalidateQueries({ queryKey: ['production-batches'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-raw-stock'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-finished-stock'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      navigate('/production');
    },
    onError: (err: any) => {
      message.error(err.message || 'Production batch submission failed');
    },
  });

  const updateConsumption = (index: number, field: keyof ConsumptionRow, val: any) => {
    const updated = [...consumptions];
    updated[index] = { ...updated[index], [field]: val };
    setConsumptions(updated);
  };

  const addConsumptionRow = () => {
    setConsumptions([...consumptions, { rawMaterialId: '', quantityConsumed: 1 }]);
  };

  const removeConsumptionRow = (idx: number) => {
    if (consumptions.length <= 1) return;
    setConsumptions(consumptions.filter((_, i) => i !== idx));
  };

  const handleSubmit = (values: any) => {
    const validConsumptions = consumptions.filter(
      (c) => c.rawMaterialId && c.quantityConsumed > 0
    );

    if (validConsumptions.length === 0) {
      message.error('Please configure consumed raw materials');
      return;
    }

    // Pre-validate RM availability in UI
    for (const c of validConsumptions) {
      const rm = rawMaterials.find((r) => r.id === c.rawMaterialId);
      if (rm && rm.currentStock < c.quantityConsumed) {
        message.error(
          `Insufficient stock for '${rm.materialName}'. Available: ${rm.currentStock} ${rm.unit}, Required: ${c.quantityConsumed} ${rm.unit}. Please inward purchase first.`
        );
        return;
      }
    }

    mutation.mutate({
      productId: values.productId,
      plannedOutput: values.plannedOutput,
      actualOutput: values.actualOutput,
      wastageQuantity: values.wastageQuantity || 0,
      productionDate: values.productionDate ? values.productionDate.toISOString() : new Date().toISOString(),
      notes: values.notes,
      consumptions: validConsumptions,
    });
  };

  // 1-Click Demo Auto-fill Helper
  const handleQuickDemoFill = () => {
    const classicProduct = products.find((p) => p.sku.includes('CHP-SLT')) || products[0];
    if (classicProduct) {
      setSelectedProductId(classicProduct.id);
      form.setFieldsValue({
        productId: classicProduct.id,
        plannedOutput: 200,
        actualOutput: 180,
        wastageQuantity: 20,
        productionDate: dayjs(),
        notes: 'Plant Line 1 continuous frying batch run',
      });

      const rmPotato = rawMaterials.find((r) => r.materialCode === 'RM-POT-01');
      const rmOil = rawMaterials.find((r) => r.materialCode === 'RM-OIL-01');
      const rmSalt = rawMaterials.find((r) => r.materialCode === 'RM-SLT-01');
      const rmPouch = rawMaterials.find((r) => r.materialCode === 'RM-PCH-100');

      const demoConsumptions: ConsumptionRow[] = [];
      if (rmPotato) demoConsumptions.push({ rawMaterialId: rmPotato.id, quantityConsumed: 50 });
      if (rmOil) demoConsumptions.push({ rawMaterialId: rmOil.id, quantityConsumed: 10 });
      if (rmSalt) demoConsumptions.push({ rawMaterialId: rmSalt.id, quantityConsumed: 2 });
      if (rmPouch) demoConsumptions.push({ rawMaterialId: rmPouch.id, quantityConsumed: 200 });

      if (demoConsumptions.length > 0) {
        setConsumptions(demoConsumptions);
        message.success('Demo batch loaded: 50kg Potato + 10L Oil + 2kg Salt + 200 Pouches -> 180 Pkts Yield');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/production')} />
          <div>
            <h2 className="text-xl font-bold text-slate-900">Execute Production Batch</h2>
            <p className="text-xs text-slate-500">
              Consumes ingredients from Raw Stock and adds finished packets into Finished Goods inventory.
            </p>
          </div>
        </div>

        <Button
          type="dashed"
          icon={<Zap className="w-4 h-4 text-amber-600 inline mr-1" />}
          onClick={handleQuickDemoFill}
          className="border-amber-400 bg-amber-50 text-amber-900 font-semibold"
        >
          ⚡ Quick Demo Scenario (180 pkts Batch)
        </Button>
      </div>

      <Card className="shadow-sm rounded-xl border-slate-200">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="productId"
              label={<span className="text-xs font-semibold text-slate-700">Target Finished Product</span>}
              rules={[{ required: true, message: 'Please select product to produce' }]}
            >
              <Select
                placeholder="Choose snack product"
                size="large"
                value={selectedProductId || undefined}
                onChange={(val) => {
                  setSelectedProductId(val);
                  form.setFieldsValue({ productId: val });
                }}
              >
                {products.map((p) => (
                  <Select.Option key={p.id} value={p.id}>
                    {p.productName} ({p.packSize}) — Current Stock: {p.currentStock} {p.unit}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="productionDate"
              label={<span className="text-xs font-semibold text-slate-700">Production Date</span>}
              initialValue={dayjs()}
            >
              <DatePicker className="w-full" size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Form.Item
              name="plannedOutput"
              label={<span className="text-xs font-semibold text-slate-700">Planned Output (Pkts)</span>}
              initialValue={200}
              rules={[{ required: true, message: 'Enter planned quantity' }]}
            >
              <InputNumber className="w-full" min={1} size="large" placeholder="200" />
            </Form.Item>

            <Form.Item
              name="actualOutput"
              label={
                <span className="text-xs font-bold text-emerald-700">
                  Actual Produced Output (Pkts) ⬆
                </span>
              }
              initialValue={180}
              rules={[{ required: true, message: 'Enter actual good output' }]}
            >
              <InputNumber className="w-full border-emerald-400" min={1} size="large" placeholder="180" />
            </Form.Item>

            <Form.Item
              name="wastageQuantity"
              label={<span className="text-xs font-semibold text-rose-700">Wastage / Scrap (Pkts)</span>}
              initialValue={20}
            >
              <InputNumber className="w-full" min={0} size="large" placeholder="20" />
            </Form.Item>
          </div>

          <Divider orientation="left" className="text-xs font-bold text-slate-500 my-4">
            Raw Material Ingredients Consumed (Will Deduct from Stock Immediately)
          </Divider>

          <div className="space-y-3">
            {consumptions.map((c, index) => {
              const selectedRM = rawMaterials.find((rm) => rm.id === c.rawMaterialId);
              const isInsufficient = selectedRM && selectedRM.currentStock < (c.quantityConsumed || 0);

              return (
                <div
                  key={index}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border rounded-xl ${
                    isInsufficient ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                      Raw Material Ingredient
                    </label>
                    <Select
                      placeholder="Select material"
                      value={c.rawMaterialId || undefined}
                      onChange={(val) => updateConsumption(index, 'rawMaterialId', val)}
                      className="w-full"
                    >
                      {rawMaterials.map((rm) => (
                        <Select.Option key={rm.id} value={rm.id}>
                          {rm.materialName} ({rm.unit})
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  <div className="w-40">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                      Consumed Qty ({selectedRM?.unit || 'Units'})
                    </label>
                    <InputNumber
                      min={0.1}
                      step={0.5}
                      value={c.quantityConsumed}
                      onChange={(val) => updateConsumption(index, 'quantityConsumed', val || 0)}
                      className="w-full font-mono"
                    />
                  </div>

                  <div className="w-44">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                      Stock Availability
                    </label>
                    <div className="text-xs font-semibold py-1">
                      {selectedRM ? (
                        isInsufficient ? (
                          <span className="text-rose-700 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Insufficient ({selectedRM.currentStock} {selectedRM.unit})
                          </span>
                        ) : (
                          <span className="text-emerald-700">
                            Available: {selectedRM.currentStock} {selectedRM.unit}
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 sm:pt-0">
                    <Button
                      danger
                      type="text"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => removeConsumptionRow(index)}
                      disabled={consumptions.length <= 1}
                    />
                  </div>
                </div>
              );
            })}

            <Button
              type="dashed"
              icon={<Plus className="w-4 h-4 inline mr-1" />}
              onClick={addConsumptionRow}
              block
              className="mt-2 font-medium"
            >
              + Add Extra Consumed Material
            </Button>
          </div>

          <Form.Item name="notes" label="Production Shift / Line Notes" className="mt-4">
            <Input.TextArea rows={2} placeholder="Shift 1 notes, fryer temperature 175°C, moisture 1.5%..." />
          </Form.Item>

          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Stock Engine Action Preview
              </span>
              <p className="text-xs text-amber-950 font-medium mt-0.5">
                • Decreases Raw Materials (Potatoes, Oil, Salt, Pouches) via <strong>STOCK_OUT</strong><br />
                • Increases Finished Goods (e.g. +180 pkts) via <strong>STOCK_IN</strong>
              </p>
            </div>

            <div className="flex gap-3">
              <Button size="large" onClick={() => navigate('/production')}>
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
                Execute Production & Update Stock
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
};
