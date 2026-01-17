import { useEffect, useState, useMemo } from 'react';
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

export function Home({ onCategoryClick }: HomeProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

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
        
        // Batch count queries for better performance
        const countPromises = categoriesData.map(async (category) => {
          const { count } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', category.id);
          return { categoryId: category.id, count: count || 0 };
        });
        
        const results = await Promise.all(countPromises);
        results.forEach(({ categoryId, count }) => {
          counts[categoryId] = count;
        });
        
        setProductCounts(counts);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }

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
