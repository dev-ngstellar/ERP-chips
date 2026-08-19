import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Divider } from 'antd';
import { Mail, Lock, UserCheck, ShieldCheck, Factory, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { AuthResponse } from '../../types';

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response: any = await api.post('/auth/login', values);
      const { user, token } = response.data as AuthResponse;
      setAuth(user, token);
      message.success(`Welcome back, ${user.fullName}!`);
      if (user.role === 'SALES') {
        navigate('/sales');
      } else if (user.role === 'PRODUCTION_STORE') {
        navigate('/production');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      message.error(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email: string, pass: string) => {
    handleLogin({ email, password: pass });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500/10 via-slate-100 to-amber-600/10 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-600 text-white text-3xl shadow-lg shadow-amber-600/30 mb-3">
            🍿
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            SnackCraft Mini ERP
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Chips & Snacks Manufacturing Management System
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl rounded-2xl border-slate-200 overflow-hidden bg-white/95 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 text-center">
            Sign In to Factory System
          </h2>

          <Form layout="vertical" onFinish={handleLogin} requiredMark={false}>
            <Form.Item
              name="email"
              label={<span className="text-xs font-semibold text-slate-600">Email Address</span>}
              rules={[{ required: true, message: 'Please enter your email' }]}
            >
              <Input
                prefix={<Mail className="w-4 h-4 text-slate-400 mr-1" />}
                placeholder="admin@chips.com"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="text-xs font-semibold text-slate-600">Password</span>}
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<Lock className="w-4 h-4 text-slate-400 mr-1" />}
                placeholder="••••••••"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              className="mt-2 font-semibold h-11 rounded-lg"
            >
              Sign In
            </Button>
          </Form>

          <Divider plain className="text-xs text-slate-400 my-5">
            Quick 1-Click Demo Logins
          </Divider>

          <div className="space-y-2">
            <button
              onClick={() => quickLogin('admin@chips.com', 'admin123')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100/80 transition text-left text-xs font-medium text-amber-900 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span><strong>Admin / Owner</strong> (Full Access)</span>
              </div>
              <span className="text-[11px] bg-white px-2 py-0.5 rounded text-amber-800 font-semibold shadow-xs">
                Login ⚡
              </span>
            </button>

            <button
              onClick={() => quickLogin('store@chips.com', 'password123')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100/80 transition text-left text-xs font-medium text-blue-900 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-blue-700" />
                <span><strong>Production & Store</strong> (Batch & Stock)</span>
              </div>
              <span className="text-[11px] bg-white px-2 py-0.5 rounded text-blue-800 font-semibold shadow-xs">
                Login ⚡
              </span>
            </button>

            <button
              onClick={() => quickLogin('sales@chips.com', 'password123')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/80 transition text-left text-xs font-medium text-emerald-900 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-700" />
                <span><strong>Sales Staff</strong> (Invoicing & Stock Check)</span>
              </div>
              <span className="text-[11px] bg-white px-2 py-0.5 rounded text-emerald-800 font-semibold shadow-xs">
                Login ⚡
              </span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
