import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, Backpack, ShoppingBag, Briefcase } from 'lucide-react';
import { supabase, Category } from '../lib/supabase';

interface HomeProps {
  onCategoryClick: (categoryId: string) => void;
}

const iconMap: Record<string, any> = {
  backpack: Backpack,
  'shopping-bag': ShoppingBag,
  briefcase: Briefcase,
};

type ProductSearchResult = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category_id: string;
  sku: string;
  categories?: { name: string } | null;
};

export function Home({ onCategoryClick }: HomeProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [skuQuery, setSkuQuery] = useState('');
  const [skuSearching, setSkuSearching] = useState(false);
  const [skuError, setSkuError] = useState<string>('');
  const [skuResult, setSkuResult] = useState<ProductSearchResult | null>(null);
  const skuSearchSeq = useRef(0);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesData) {
        setCategories(categoriesData);

        const counts: Record<string, number> = {};
        
        // Optimized: Get all products in one query
        const { data: productData } = await supabase
          .from('products')
          .select('category_id', { count: 'exact' });
        
        categoriesData.forEach(category => {
          counts[category.id] = 0;
        });
        
        if (productData) {
          productData.forEach(item => {
            if (item.category_id) {
              counts[item.category_id] = (counts[item.category_id] || 0) + 1;
            }
          });
        }
        
        setProductCounts(counts);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const trimmed = skuQuery.trim();

    // Clear results when input is cleared
    if (!trimmed) {
      setSkuSearching(false);
      setSkuError('');
      setSkuResult(null);
      return;
    }

    // Debounce to avoid spamming requests while typing
    const timeout = setTimeout(async () => {
      const seq = ++skuSearchSeq.current;
      setSkuSearching(true);
      setSkuError('');
      setSkuResult(null);

      try {
        const normalized = trimmed.toUpperCase();

        // Case-insensitive match by normalizing both sides.
        // Note: requires `sku` stored in consistent casing OR Postgres can handle ilike.
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, image_url, category_id, sku, categories(name)')
          .ilike('sku', normalized)
          .maybeSingle();

        // Ignore out-of-order responses
        if (seq !== skuSearchSeq.current) return;

        if (error) {
          setSkuError(error.message);
          return;
        }

        if (!data) {
          setSkuError('No product found for that SKU.');
          return;
        }

        setSkuResult(data as ProductSearchResult);
      } catch (err) {
        if (seq !== skuSearchSeq.current) return;
        setSkuError(err instanceof Error ? err.message : 'Something went wrong searching by SKU.');
      } finally {
        if (seq === skuSearchSeq.current) setSkuSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [skuQuery]);

  const memoizedCategories = useMemo(() => categories, [categories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Product Categories</h2>
        <p className="text-slate-600">Select a category to view products and prices</p>
      </div>

      {/* Quick SKU Search */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Quick SKU Search</h3>
          <p className="text-sm text-slate-600 mb-4">Enter a SKU to instantly view the product price.</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={skuQuery}
              onChange={(e) => setSkuQuery(e.target.value)}
              placeholder="e.g., ROLEX-001"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent font-mono"
            />
            <div className="sm:w-32 flex items-center justify-start sm:justify-end text-sm text-slate-500">
              {skuSearching ? 'Searching…' : ' '}
            </div>
          </div>

          {(skuError || skuResult) && (
            <div className="mt-4">
              {skuError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm">
                  {skuError}
                </div>
              )}

              {skuResult && (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 p-4">
                    <div className="aspect-[4/3] bg-white rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center">
                      <img
                        src={skuResult.image_url}
                        alt={skuResult.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-900 truncate">{skuResult.name}</h4>
                          <p className="text-xs text-slate-600 font-mono mt-1">SKU: {skuResult.sku}</p>
                          {skuResult.categories?.name && (
                            <p className="text-xs text-slate-500 mt-1">Category: {skuResult.categories.name}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs text-slate-500">Price</div>
                          <div className="text-2xl font-bold text-amber-600">
                            ₹{parseFloat(skuResult.price.toString()).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onCategoryClick(skuResult.category_id)}
                          className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition text-sm"
                        >
                          Open category
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSkuQuery('');
                            setSkuResult(null);
                            setSkuError('');
                          }}
                          className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition text-sm"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memoizedCategories.map((category) => {
          const Icon = iconMap[category.icon] || ShoppingBag;
          const count = productCounts[category.id] || 0;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-3 rounded-lg group-hover:bg-slate-200 transition-colors">
                    <Icon className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
                    <p className="text-sm text-slate-500">
                      {count} {count === 1 ? 'product' : 'products'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
            </button>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No categories available yet.</p>
        </div>
      )}
    </div>
  );
}
