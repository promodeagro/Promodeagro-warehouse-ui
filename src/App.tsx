import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { CategoryProvider } from '@/contexts/CategoryContext';

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
          <Router>
            <div className="min-h-screen bg-gradient-background flex">
              <Navigation />
              <main className="flex-1 overflow-auto">
                <div className="container mx-auto p-6">
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
        </CategoryProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
