// Shared product data and types for inventory and order management
export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  unit: string;
  stock: number;
  minStock: number;
  maxStock: number;
  status: 'active' | 'low-stock' | 'out-of-stock';
  quality: 'excellent' | 'very-good' | 'good' | 'fair' | 'poor';
  supplier: string;
  description: string;
  image: string;
  lastUpdated: string;
  onB2C: boolean;
  images: string[];
  tags?: string[];
  isVariant?: boolean;
  parentProductId?: string;
  purchasePrice?: number;
  salePrice?: number;
  comparePrice?: number;
  b2cQty?: string;
  b2cUnit?: string;
  lowStockAlert?: number;
  expiryDate?: string;
}

// Sample product data - in real app, this would come from API
export const products: Product[] = [
  {
    id: "PRD-001",
    name: "Fresh Tomatoes",
    category: "Root Vegetables",
    subcategory: "Tomatoes",
    price: 45,
    unit: "kg",
    stock: 450,
    minStock: 50,
    maxStock: 1000,
    status: "active",
    quality: "excellent",
    supplier: "Green Farm Co.",
    description: "Fresh, locally sourced tomatoes",
    image: "/api/placeholder/100/100",
    lastUpdated: "2024-01-15",
    onB2C: true,
    images: [
      "https://images.unsplash.com/photo-1592924357228-91b4e2a8af0c?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1546470427-5a3b4b4b4b4b?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=300&h=200&fit=crop"
    ],
    tags: ["organic", "fresh", "local"],
    purchasePrice: 35,
    salePrice: 45,
    comparePrice: 50,
    b2cQty: "1",
    b2cUnit: "kg",
    lowStockAlert: 50,
    expiryDate: "2024-02-15"
  },
  {
    id: "PRD-002",
    name: "Organic Spinach",
    category: "Leafy Greens",
    subcategory: "Spinach",
    price: 35,
    unit: "bunch",
    stock: 23,
    minStock: 20,
    maxStock: 200,
    status: "low-stock",
    quality: "very-good",
    supplier: "Organic Valley",
    description: "Pesticide-free organic spinach",
    image: "/api/placeholder/100/100",
    lastUpdated: "2024-01-14",
    onB2C: true,
    images: [
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop"
    ],
    tags: ["organic", "healthy", "leafy"],
    purchasePrice: 25,
    salePrice: 35,
    comparePrice: 40,
    b2cQty: "1",
    b2cUnit: "bunch",
    lowStockAlert: 20,
    expiryDate: "2024-01-28"
  },
  {
    id: "PRD-003",
    name: "Red Onions",
    category: "Root Vegetables",
    subcategory: "Onions",
    price: 30,
    unit: "kg",
    stock: 0,
    minStock: 100,
    maxStock: 800,
    status: "out-of-stock",
    quality: "good",
    supplier: "Local Co-op",
    description: "Premium quality red onions",
    image: "/api/placeholder/100/100",
    lastUpdated: "2024-01-13",
    onB2C: false,
    images: [
      "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1615485925446-2c0b2b2b2b2b?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1615485925446-2c0b2b2b2b2b?w=300&h=200&fit=crop"
    ],
    tags: ["premium", "onions", "root"],
    purchasePrice: 20,
    salePrice: 30,
    comparePrice: 35,
    b2cQty: "1",
    b2cUnit: "kg",
    lowStockAlert: 100,
    expiryDate: "2024-03-15"
  },
  {
    id: "PRD-004",
    name: "Fresh Bananas",
    category: "Fruits",
    subcategory: "Bananas",
    price: 60,
    unit: "dozen",
    stock: 234,
    minStock: 50,
    maxStock: 500,
    status: "active",
    quality: "excellent",
    supplier: "South India Fruits",
    description: "Sweet, ripe bananas from South India",
    image: "/api/placeholder/100/100",
    lastUpdated: "2024-01-15",
    onB2C: true,
    images: [
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1619546813926-a3af8267b198?w=300&h=200&fit=crop"
    ],
    tags: ["sweet", "ripe", "tropical"],
    purchasePrice: 45,
    salePrice: 60,
    comparePrice: 70,
    b2cQty: "1",
    b2cUnit: "dozen",
    lowStockAlert: 50,
    expiryDate: "2024-01-25"
  },
  {
    id: "PRD-005",
    name: "Coriander Leaves",
    category: "Herbs & Spices",
    subcategory: "Coriander",
    price: 15,
    unit: "bunch",
    stock: 89,
    minStock: 30,
    maxStock: 150,
    status: "active",
    quality: "very-good",
    supplier: "Herb Gardens",
    description: "Fresh aromatic coriander leaves",
    image: "/api/placeholder/100/100",
    lastUpdated: "2024-01-14",
    onB2C: true,
    images: [
      "https://images.unsplash.com/photo-1615485925446-2c0b2b2b2b2b?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1615485925446-2c0b2b2b2b2b?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1615485925446-2c0b2b2b2b2b?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1615485925446-2c0b2b2b2b2b?w=300&h=200&fit=crop"
    ],
    tags: ["aromatic", "herbs", "fresh"],
    purchasePrice: 10,
    salePrice: 15,
    comparePrice: 18,
    b2cQty: "1",
    b2cUnit: "bunch",
    lowStockAlert: 30,
    expiryDate: "2024-01-21"
  },
  // Variant products
  {
    id: "PRD-001-V1",
    name: "Fresh Tomatoes - Large",
    category: "Root Vegetables",
    subcategory: "Tomatoes",
    price: 50,
    unit: "kg",
    stock: 200,
    minStock: 25,
    maxStock: 500,
    status: "active",
    quality: "excellent",
    supplier: "Green Farm Co.",
    description: "Large size fresh tomatoes",
    image: "/api/placeholder/100/100",
    lastUpdated: "2024-01-15",
    onB2C: true,
    images: [],
    tags: ["organic", "fresh", "large"],
    isVariant: true,
    parentProductId: "PRD-001",
    purchasePrice: 40,
    salePrice: 50,
    comparePrice: 55,
    b2cQty: "1",
    b2cUnit: "kg",
    lowStockAlert: 25,
    expiryDate: "2024-02-15"
  },
  {
    id: "PRD-001-V2",
    name: "Fresh Tomatoes - Small",
    category: "Root Vegetables",
    subcategory: "Tomatoes",
    price: 40,
    unit: "kg",
    stock: 250,
    minStock: 25,
    maxStock: 500,
    status: "active",
    quality: "excellent",
    supplier: "Green Farm Co.",
    description: "Small size fresh tomatoes",
    image: "/api/placeholder/100/100",
    lastUpdated: "2024-01-15",
    onB2C: true,
    images: [],
    tags: ["organic", "fresh", "small"],
    isVariant: true,
    parentProductId: "PRD-001",
    purchasePrice: 30,
    salePrice: 40,
    comparePrice: 45,
    b2cQty: "1",
    b2cUnit: "kg",
    lowStockAlert: 25,
    expiryDate: "2024-02-15"
  }
];

// Search function that matches inventory module behavior
export const searchProducts = (products: Product[], searchTerm: string, categoryFilter: string = "all", statusFilter: string = "all"): Product[] => {
  return products.filter(product => {
    // If this item is a variant, skip it from the main product grid
    if (product.isVariant) return false;
    
    const term = searchTerm.trim().toLowerCase();
    const tags = product.tags || [];
    
    const matchesSearch = term === "" ||
      product.name.toLowerCase().includes(term) ||
      product.id.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.subcategory.toLowerCase().includes(term) ||
      (Array.isArray(tags) && tags.some((t: string) => (t || "").toLowerCase().includes(term)));
    
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
};

// Get variants for a parent product
export const getProductVariants = (products: Product[], parentProductId: string): Product[] => {
  return products.filter(product => 
    product.isVariant && product.parentProductId === parentProductId
  );
};

// Get all categories
export const getCategories = (products: Product[]): string[] => {
  const categories = new Set(products.map(p => p.category));
  return Array.from(categories).sort();
};

// Get subcategories for a category
export const getSubcategories = (products: Product[], category: string): string[] => {
  const subcategories = new Set(
    products
      .filter(p => p.category === category)
      .map(p => p.subcategory)
  );
  return Array.from(subcategories).sort();
};
