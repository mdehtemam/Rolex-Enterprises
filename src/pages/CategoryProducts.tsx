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
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12;

  useEffect(() => {
    setPage(1);
    loadData();
  }, [categoryId]);

  useEffect(() => {
    if (page > 1) {
      loadProducts();
    }
  }, [page]);

  async function loadData() {
    setLoading(true);
    try {
      // Get category - select only needed columns
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id, name, icon, created_at')
        .eq('id', categoryId)
        .maybeSingle();

      // Get total count
      const { count } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', categoryId);

      setCategory(categoryData);
      setTotalProducts(count || 0);

      // Get first page
      await loadProducts(1);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts(pageNum: number = page) {
    try {
      const start = (pageNum - 1) * productsPerPage;
      const { data } = await supabase
        .from('products')
        .select('id, name, price, image_url, category_id')
        .eq('category_id', categoryId)
        .order('name')
        .range(start, start + productsPerPage - 1);

      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  const totalPages = Math.ceil(totalProducts / productsPerPage);

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
                  decoding="async"
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

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition"
            >
              Previous
            </button>
            <span className="text-slate-600">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition"
            >
              Next
            </button>
          </div>
        )}
      )}
    </div>
  );
}
