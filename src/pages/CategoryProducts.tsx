import { useEffect, useState } from 'react';
import { ArrowLeft, Package } from 'lucide-react';
import { supabase, Category, Product } from '../lib/supabase';

interface CategoryProductsProps {
  categoryId: string;
  onBack: () => void;
}

export function CategoryProducts({ categoryId, onBack }: CategoryProductsProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Reload when category changes
  }, [categoryId]);

  async function loadData() {
    setLoading(true);
    try {
      // Get category
      const categoryResponse = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .maybeSingle();
      
      const categoryData = await categoryResponse;

      // Get products for this category
      const productsResponse = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .order('name');

      const productsData = await productsResponse;

      setCategory(categoryData.data);
      setProducts(productsData.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Categories
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">{category?.name}</h2>
        <p className="text-slate-600">{products.length} {products.length === 1 ? 'product' : 'products'} available</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No products in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-slate-900 mb-1 text-sm">{product.name}</h3>
                <p className="text-lg font-bold text-amber-600">
                  ₹{parseFloat(product.price.toString()).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
