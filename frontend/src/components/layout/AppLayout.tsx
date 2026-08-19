import React, { useState } from 'react';
import { Layout, Menu, Button, Tag, Dropdown } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Factory,
  ShoppingCart,
  Receipt,
  FileText,
  DollarSign,
  Package,
  Layers,
  Users,
  Building2,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wheat,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const { Header, Sider, Content } = Layout;

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || 'ADMIN';

  // Navigation Items according to RBAC
  const menuItems = [
    ...(role === 'ADMIN'
      ? [
          {
            key: '/dashboard',
            icon: <LayoutDashboard className="w-4 h-4" />,
            label: 'Dashboard',
          },
        ]
      : []),
    ...(role === 'ADMIN' || role === 'PRODUCTION_STORE' || role === 'SALES'
      ? [
          {
            key: 'inventory-grp',
            icon: <Boxes className="w-4 h-4" />,
            label: 'Stock & Inventory',
            children: [
              ...(role === 'ADMIN' || role === 'PRODUCTION_STORE'
                ? [
                    {
                      key: '/inventory/raw-materials',
                      label: 'Raw Material Stock',
                    },
                  ]
                : []),
              {
                key: '/inventory/finished-goods',
                label: 'Finished Goods Stock',
              },
              ...(role === 'ADMIN'
                ? [
                    {
                      key: '/inventory/movements',
                      label: 'Stock Movement Logs',
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    ...(role === 'ADMIN' || role === 'PRODUCTION_STORE'
      ? [
          {
            key: 'production-grp',
            icon: <Factory className="w-4 h-4" />,
            label: 'Production',
            children: [
              {
                key: '/production/new',
                label: '⚡ New Batch Entry',
              },
              {
                key: '/production',
                label: 'Production Batches',
              },
              {
                key: '/recipes',
                label: 'Recipes / BOM',
              },
            ],
          },
        ]
      : []),
    ...(role === 'ADMIN' || role === 'PRODUCTION_STORE'
      ? [
          {
            key: 'purchases-grp',
            icon: <ShoppingCart className="w-4 h-4" />,
            label: 'Purchases (Inward)',
            children: [
              {
                key: '/purchases/new',
                label: '⚡ New Purchase',
              },
              {
                key: '/purchases',
                label: 'Purchase History',
              },
            ],
          },
        ]
      : []),
    ...(role === 'ADMIN' || role === 'SALES'
      ? [
          {
            key: 'sales-grp',
            icon: <Receipt className="w-4 h-4" />,
            label: 'Sales & Billing',
            children: [
              {
                key: '/sales/new',
                label: '⚡ New Sale Invoice',
              },
              {
                key: '/sales',
                label: 'Sales Invoices',
              },
            ],
          },
        ]
      : []),
    ...(role === 'ADMIN'
      ? [
          {
            key: '/expenses',
            icon: <DollarSign className="w-4 h-4" />,
            label: 'Factory Expenses',
          },
        ]
      : []),
    ...(role === 'ADMIN'
      ? [
          {
            key: 'masters-grp',
            icon: <Layers className="w-4 h-4" />,
            label: 'Masters',
            children: [
              {
                key: '/masters/products',
                label: 'Products',
              },
              {
                key: '/masters/raw-materials',
                label: 'Raw Materials',
              },
              {
                key: '/masters/suppliers',
                label: 'Suppliers',
              },
              {
                key: '/masters/customers',
                label: 'Customers',
              },
            ],
          },
        ]
      : []),
    {
      key: '/reports',
      icon: <FileText className="w-4 h-4" />,
      label: 'Reports & Ledgers',
    },
  ];

  const userMenuItems = [
    {
      key: 'logout',
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4 text-rose-500" />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="h-screen w-screen overflow-hidden bg-slate-50 flex flex-row">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(val) => setCollapsed(val)}
        trigger={null}
        width={250}
        collapsedWidth={76}
        theme="light"
        className="h-screen overflow-hidden border-r border-slate-200 shadow-sm z-20 shrink-0"
        style={{
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
        }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header - Fixed at top */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-amber-500/10 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-600 text-white font-bold shadow-md shadow-amber-500/20 shrink-0">
              🍿
            </div>
            {!collapsed && (
              <div className="min-w-0 overflow-hidden">
                <h1 className="text-base font-bold text-slate-900 leading-tight truncate">
                  SnackCraft ERP
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 block truncate">
                  Chips & Snacks Plant
                </span>
              </div>
            )}
          </div>

          {/* Menu Navigation with independent scroll */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-2 custom-sidebar-scroll">
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              defaultOpenKeys={[
                'inventory-grp',
                'production-grp',
                'purchases-grp',
                'sales-grp',
                'masters-grp',
              ]}
              onClick={({ key }) => {
                if (key && key.startsWith('/')) {
                  navigate(key);
                }
              }}
              items={menuItems}
              className="border-r-0 text-slate-600 font-medium"
            />
          </div>

          {/* Sidebar Footer with proper collapse/expand button */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/90 shrink-0">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-slate-600 hover:text-amber-800 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 transition font-medium text-xs cursor-pointer shadow-2xs"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-slate-600 hover:text-amber-700" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-slate-600">Collapse Sidebar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Sider>

      <Layout className="h-screen overflow-hidden flex flex-col flex-1 min-w-0 bg-slate-50">
        {/* Top Header - Fixed/Sticky at the top */}
        <Header className="bg-white border-b border-slate-200 px-6 flex items-center justify-between h-16 shrink-0 shadow-xs z-10 leading-normal">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Chips & Snacks Manufacturing Management
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
              <button
                type="button"
                className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer bg-white text-left leading-normal"
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.fullName || 'User'}
                  </span>
                  <div className="mt-0.5 flex items-center">
                    <Tag
                      color={
                        role === 'ADMIN'
                          ? 'gold'
                          : role === 'PRODUCTION_STORE'
                          ? 'blue'
                          : 'green'
                      }
                      className="text-[10px] leading-tight py-0.5 px-1.5 m-0 font-semibold"
                    >
                      {role}
                    </Tag>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-0.5" />
              </button>
            </Dropdown>
          </div>
        </Header>

        {/* Content Body - Independent scroll container */}
        <Content className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto pb-12">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
