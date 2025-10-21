import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { CategoryProvider } from '@/contexts/CategoryContext';
import { ProductProvider } from '@/contexts/ProductContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { OrderProvider } from '@/contexts/OrderContext';

// Import components
import { OperationsOverview } from '@/components/warehouse/OperationsOverview';
import { ProductManagement } from '@/components/inventory/ProductManagement';
import { InventoryTasks } from '@/components/inventory/InventoryTasks';
import { StockReceiving } from '@/components/inventory/StockReceiving';
import { QualityCheck } from '@/components/inventory/QualityCheck';
import { ProductCategoryManagement } from '@/components/inventory/ProductCategoryManagement';
import { QuickActions } from '@/components/inventory/QuickActions';
import { OrderDelivery } from '@/components/delivery/OrderDelivery';
import { DeliveryHistory } from '@/components/delivery/DeliveryHistory';
import { RunsheetManagement } from '@/components/delivery/RunsheetManagement';
import { FleetManagement } from '@/components/logistics/FleetManagement';
import { RouteOptimization } from '@/components/logistics/RouteOptimization';
import { DeliveryTracking } from '@/components/logistics/DeliveryTracking';
import { PerformanceAnalytics } from '@/components/logistics/PerformanceAnalytics';
import { InventoryAnalytics } from '@/components/warehouse/InventoryAnalytics';
import { QualityMetrics } from '@/components/warehouse/QualityMetrics';
import { StaffManagement } from '@/components/warehouse/StaffManagement';
import OrdersList from '@/components/order-management/OrdersList';
import OrderDetail from '@/components/order-management/OrderDetail';
import AddNewOrder from '@/components/order-management/AddNewOrder';
import PackerOverview from '@/components/order-management/PackerOverview';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="warehouse-ui-theme">
        <CategoryProvider>
          <ProductProvider>
            <NotificationProvider>
              <OrderProvider>
                <Router>
            <div className="min-h-screen bg-gradient-background flex">
              <Navigation />
              <main className="flex-1 overflow-auto lg:ml-[299px]">
                <div className="container mx-auto p-3 sm:p-4 md:p-6">
                  <Routes>
                  {/* Default route - redirect to operations overview */}
                  <Route path="/" element={<Navigate to="/operations" replace />} />
                  
                  {/* Warehouse Operations */}
                  <Route path="/operations" element={<OperationsOverview />} />
                  <Route path="/analytics" element={<InventoryAnalytics />} />
                  <Route path="/quality-metrics" element={<QualityMetrics />} />
                  <Route path="/staff" element={<StaffManagement />} />
                  
                  {/* Inventory Management */}
                  <Route path="/inventory/products" element={<ProductManagement />} />
                  <Route path="/inventory/tasks" element={<InventoryTasks />} />
                  <Route path="/inventory/receiving" element={<StockReceiving />} />
                  <Route path="/inventory/quality" element={<QualityCheck />} />
                  <Route path="/inventory/categories" element={<ProductCategoryManagement />} />
                  <Route path="/inventory/quick-actions" element={<QuickActions />} />
                  
                  {/* Order Management */}
                  <Route path="/order-management/orders" element={<OrdersList />} />
                  <Route path="/order-management/orders/:id" element={<OrderDetail />} />
                  <Route path="/order-management/add-order" element={<AddNewOrder />} />
                  <Route path="/order-management/packer-overview" element={<PackerOverview />} />
                  
                  {/* Delivery Management */}
                  <Route path="/delivery/orders" element={<OrderDelivery />} />
                  <Route path="/delivery/history" element={<DeliveryHistory />} />
                  <Route path="/delivery/runsheets" element={<RunsheetManagement />} />
                  
                  {/* Logistics */}
                  <Route path="/logistics/fleet" element={<FleetManagement />} />
                  <Route path="/logistics/routes" element={<RouteOptimization />} />
                  <Route path="/logistics/tracking" element={<DeliveryTracking />} />
                  <Route path="/logistics/analytics" element={<PerformanceAnalytics />} />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/operations" replace />} />
                  </Routes>
                </div>
              </main>
            </div>
                </Router>
                <Toaster />
              </OrderProvider>
            </NotificationProvider>
          </ProductProvider>
        </CategoryProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
