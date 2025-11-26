import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import categoryService from '../../services/categoryService';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📦',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData(category);
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        icon: '📦',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
      } else {
        await categoryService.createCategory(formData);
      }

      handleCloseModal();
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(id);
        loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category');
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Kelola Kategori</h1>
            <button onClick={() => handleOpenModal()} className="btn-primary">
              + Tambah Kategori
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{category.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{category.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(category)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Elektronik"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Deskripsi kategori..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ikon (Emoji) *</label>
                <input
                  type="text"
                  required
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="input-field"
                  placeholder="📦"
                  maxLength="2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingCategory ? 'Perbarui Kategori' : 'Buat Kategori'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;


