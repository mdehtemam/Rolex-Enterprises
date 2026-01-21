import { useEffect, useState } from 'react';
import { ArrowLeft, Package, Search } from 'lucide-react';
import { supabase, Category, Product } from '../lib/supabase';

interface CategoryProductsProps {
  categoryId: string;
  onBack: () => void;
}

export function CategoryProducts({ categoryId, onBack }: CategoryProductsProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter products based on search query
  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
    setPage(1);
  }, [searchQuery, products]);

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
        .select('id, name, price, price_max, image_url, category_id, sku')
        .eq('category_id', categoryId)
        .order('name')
        .range(start, start + productsPerPage - 1);

      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const displayedProducts = searchQuery ? filteredProducts : products;
  const displayedPages = Math.ceil(displayedProducts.length / productsPerPage);

  const formatPrice = (p: Product) => {
    const min = p.price;
    const max = p.price_max;
    const formattedMin = `₹${parseFloat(min.toString()).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    if (max !== null && max !== undefined && !Number.isNaN(max) && max !== min) {
      const formattedMax = `₹${parseFloat(max.toString()).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
      return `${formattedMin} – ${formattedMax}`;
    }
    return formattedMin;
  };

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
        <p className="text-slate-600">{totalProducts} {totalProducts === 1 ? 'product' : 'products'} available</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by product name or SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
        />
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No products in this category yet.</p>
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No products match your search.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedProducts.slice(0, productsPerPage).map((product) => (
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
                  <p className="text-xs text-slate-500 mb-2 font-mono">SKU: {product.sku}</p>
                  <p className="text-lg font-bold text-amber-600">{formatPrice(product)}</p>
              </div>
            </div>
          ))}
        </div>

        {displayedPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition"
            >
              Previous
            </button>
            <span className="text-slate-600">Page {page} of {displayedPages}</span>
            <button
              onClick={() => setPage(Math.min(displayedPages, page + 1))}
              disabled={page === displayedPages}
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition"
            >
              Next
            </button>
          </div>
        )}
        </>
      )}
    </div>
  );
}
