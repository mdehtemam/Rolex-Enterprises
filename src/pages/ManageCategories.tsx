import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { supabase, Category } from '../lib/supabase';

interface ManageCategoriesProps {
  onCategoriesChanged?: () => void;
}

export function ManageCategories({ onCategoriesChanged }: ManageCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'shopping-bag',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesData) {
        setCategories(categoriesData);

        const counts: Record<string, number> = {};
        for (const category of categoriesData) {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);
          counts[category.id] = count || 0;
        }
        setProductCounts(counts);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingCategory(null);
    setFormData({ name: '', icon: 'shopping-bag' });
    setShowModal(true);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setFormData({ name: category.name, icon: category.icon });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingCategory) {
        await supabase
          .from('categories')
          .update({ name: formData.name, icon: formData.icon })
          .eq('id', editingCategory.id);
      } else {
        await supabase.from('categories').insert({
          name: formData.name,
          icon: formData.icon,
        });
      }

      setShowModal(false);
      onCategoriesChanged?.();
      loadData();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  }

  async function handleDelete(id: string) {
    const count = productCounts[id] || 0;
    if (count > 0) {
      alert('Cannot delete category with products. Please delete all products first.');
      return;
    }

    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await supabase.from('categories').delete().eq('id', id);
        loadData();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Manage Categories</h2>
          <p className="text-slate-600">Add, edit, or remove product categories</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500">No categories yet. Click "Add Category" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <FolderOpen className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{category.name}</h3>
                    <p className="text-sm text-slate-500">
                      {productCounts[category.id] || 0} products
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  >
                    <option value="backpack">Backpack</option>
                    <option value="shopping-bag">Shopping Bag</option>
                    <option value="briefcase">Briefcase</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  {editingCategory ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
