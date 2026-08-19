import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { useAuthStore } from './store/authStore';

// Layout & Components
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProductsPage } from './pages/masters/ProductsPage';
import { RawMaterialsPage } from './pages/masters/RawMaterialsPage';
import { SuppliersPage } from './pages/masters/SuppliersPage';
import { CustomersPage } from './pages/masters/CustomersPage';
import { RawStockPage } from './pages/inventory/RawStockPage';
import { FinishedStockPage } from './pages/inventory/FinishedStockPage';
import { StockLedgerPage } from './pages/inventory/StockLedgerPage';
import { PurchasesListPage } from './pages/purchases/PurchasesListPage';
import { NewPurchasePage } from './pages/purchases/NewPurchasePage';
import { RecipesPage } from './pages/recipes/RecipesPage';
import { ProductionListPage } from './pages/production/ProductionListPage';
import { NewProductionBatchPage } from './pages/production/NewProductionBatchPage';
import { SalesListPage } from './pages/sales/SalesListPage';
import { NewSalePage } from './pages/sales/NewSalePage';
import { ExpensesPage } from './pages/expenses/ExpensesPage';
import { ReportsHubPage } from './pages/reports/ReportsHubPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const getInitialRedirect = () => {
    if (!user) return '/login';
    if (user.role === 'SALES') return '/sales';
    if (user.role === 'PRODUCTION_STORE') return '/production';
    return '/dashboard';
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#d97706', // Warm golden amber
            borderRadius: 8,
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to={getInitialRedirect()} replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Masters */}
              <Route path="/masters/products" element={<ProductsPage />} />
              <Route path="/masters/raw-materials" element={<RawMaterialsPage />} />
              <Route path="/masters/suppliers" element={<SuppliersPage />} />
              <Route path="/masters/customers" element={<CustomersPage />} />

              {/* Inventory */}
              <Route path="/inventory/raw-materials" element={<RawStockPage />} />
              <Route path="/inventory/finished-goods" element={<FinishedStockPage />} />
              <Route path="/inventory/movements" element={<StockLedgerPage />} />

              {/* Purchases */}
              <Route path="/purchases" element={<PurchasesListPage />} />
              <Route path="/purchases/new" element={<NewPurchasePage />} />

              {/* Recipes & Production */}
              <Route path="/recipes" element={<RecipesPage />} />
              <Route path="/production" element={<ProductionListPage />} />
              <Route path="/production/new" element={<NewProductionBatchPage />} />

              {/* Sales */}
              <Route path="/sales" element={<SalesListPage />} />
              <Route path="/sales/new" element={<NewSalePage />} />

              {/* Expenses */}
              <Route path="/expenses" element={<ExpensesPage />} />

              {/* Reports */}
              <Route path="/reports" element={<ReportsHubPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
