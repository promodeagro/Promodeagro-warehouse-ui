import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Category {
  id: string;
  name: string;
  subcategories: string[];
  color: string;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
  isActive?: boolean;
  description?: string;
}

interface CategoryContextType {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  getSubcategoriesByCategoryId: (categoryId: string) => string[];
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories from localStorage on mount
  useEffect(() => {
    const savedCategories = localStorage.getItem('warehouse-categories');
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error('Error loading categories from localStorage:', error);
        // Initialize with default categories if localStorage fails
        setCategories([
          { id: "1", name: "Leafy Greens", subcategories: ["Spinach", "Lettuce", "Kale"], color: "green", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), productCount: 12, isActive: true, description: "Fresh leafy vegetables" },
          { id: "2", name: "Root Vegetables", subcategories: ["Carrots", "Potatoes", "Onions"], color: "orange", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), productCount: 8, isActive: true, description: "Underground grown vegetables" },
          { id: "3", name: "Fruits", subcategories: ["Apples", "Bananas", "Oranges"], color: "red", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), productCount: 15, isActive: true, description: "Fresh seasonal fruits" },
          { id: "4", name: "Herbs & Spices", subcategories: ["Coriander", "Basil", "Mint"], color: "purple", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), productCount: 6, isActive: true, description: "Aromatic herbs and spices" },
          { id: "5", name: "Grains & Pulses", subcategories: ["Rice", "Wheat", "Lentils"], color: "yellow", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), productCount: 10, isActive: true, description: "Dried grains and legumes" },
        ]);
      }
    } else {
      // Initialize with default categories if no saved data
      setCategories([
        { id: "1", name: "Leafy Greens", subcategories: ["Spinach", "Lettuce", "Kale"], color: "green", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), productCount: 12, isActive: true, description: "Fresh leafy vegetables" },
        { id: "2", name: "Root Vegetables", subcategories: ["Carrots", "Potatoes", "Onions"], color: "orange", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), productCount: 8, isActive: true, description: "Underground grown vegetables" },
        { id: "3", name: "Fruits", subcategories: ["Apples", "Bananas", "Oranges"], color: "red", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), productCount: 15, isActive: true, description: "Fresh seasonal fruits" },
        { id: "4", name: "Herbs & Spices", subcategories: ["Coriander", "Basil", "Mint"], color: "purple", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), productCount: 6, isActive: true, description: "Aromatic herbs and spices" },
        { id: "5", name: "Grains & Pulses", subcategories: ["Rice", "Wheat", "Lentils"], color: "yellow", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), productCount: 10, isActive: true, description: "Dried grains and legumes" },
      ]);
    }
  }, []);

  // Save categories to localStorage whenever categories change
  useEffect(() => {
    localStorage.setItem('warehouse-categories', JSON.stringify(categories));
  }, [categories]);

  const addCategory = (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: `CAT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === id 
          ? { ...category, ...updates, updatedAt: new Date().toISOString() }
          : category
      )
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  const getSubcategoriesByCategoryId = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.subcategories || [];
  };

  return (
    <CategoryContext.Provider value={{
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      getCategoryById,
      getSubcategoriesByCategoryId,
    }}>
      {children}
    </CategoryContext.Provider>
  );
};
