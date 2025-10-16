import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  BarChart3, 
  Users, 
  Settings, 
  Menu, 
  X,
  Home,
  ClipboardList,
  PackageCheck,
  Route,
  TrendingUp,
  ShoppingCart,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/operations',
    icon: Home,
    description: 'Operations overview'
  },
  {
    title: 'Inventory',
    icon: Package,
    items: [
      { title: 'Products', href: '/inventory/products', icon: Package },
      { title: 'Categories', href: '/inventory/categories', icon: Package },
      // Temporarily commented out per request — enable later when needed
      // { title: 'Tasks', href: '/inventory/tasks', icon: ClipboardList },
      // { title: 'Receiving', href: '/inventory/receiving', icon: PackageCheck },
      // { title: 'Quality Check', href: '/inventory/quality', icon: PackageCheck },
      // { title: 'Quick Actions', href: '/inventory/quick-actions', icon: Package }
    ]
  },
  {
    title: 'Order Management',
    icon: ShoppingCart,
    items: [
      { title: 'Orders Details', href: '/order-management/orders', icon: FileText }
    ]
  },
  {
    title: 'Delivery',
    icon: Truck,
    items: [
      { title: 'Orders', href: '/delivery/orders', icon: ClipboardList },
      { title: 'History', href: '/delivery/history', icon: BarChart3 },
      { title: 'Runsheets', href: '/delivery/runsheets', icon: ClipboardList }
    ]
  },
  {
    title: 'Logistics',
    icon: Route,
    items: [
      { title: 'Fleet', href: '/logistics/fleet', icon: Truck },
      { title: 'Routes', href: '/logistics/routes', icon: Route },
      { title: 'Tracking', href: '/logistics/tracking', icon: BarChart3 },
      { title: 'Analytics', href: '/logistics/analytics', icon: TrendingUp }
    ]
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Performance metrics'
  },
  {
    title: 'Quality',
    href: '/quality-metrics',
    icon: PackageCheck,
    description: 'Quality metrics'
  },
  {
    title: 'Staff',
    href: '/staff',
    icon: Users,
    description: 'Staff management'
  }
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const isParentActive = (items: any[]) => {
    return items.some(item => location.pathname === item.href);
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gradient-primary">
          Warehouse Manager
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Operations Portal
        </p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item, index) => (
          <div key={index}>
            {item.href ? (
              <Link
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            ) : (
              <div>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
                  isParentActive(item.items || []) ? 'text-primary' : 'text-foreground'
                }`}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </div>
                <div className="ml-8 mt-1 space-y-1">
                  {item.items?.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      to={subItem.href}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                        isActive(subItem.href)
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted text-muted-foreground'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <subItem.icon className="h-4 w-4" />
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
      
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:block w-80 h-screen border-r bg-card/50 backdrop-blur">
        <NavContent />
      </div>
    </>
  );
}
