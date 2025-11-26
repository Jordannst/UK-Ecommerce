import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    faculty: '',
    image: '',
    stock: '',
    rating: 4.5,
    reviews: 0,
  });
  const [imageFile, setImageFile] = useState(null); // File object untuk upload
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productService.getAllProducts(),
        categoryService.getAllCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
      setImagePreview(product.image || '');
      setImageFile(null);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        faculty: '',
        image: '',
        stock: '',
        rating: 4.5,
        reviews: 0,
      });
      setImagePreview('');
      setImageFile(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setImagePreview('');
    setImageFile(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Harap pilih file gambar (JPG, PNG, WEBP)');
        return;
      }

      // Validate file size (max 5MB untuk Cloudinary)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }

      // Simpan file object untuk upload
      setImageFile(file);
      
      // Create preview URL lokal
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create FormData untuk file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('categoryId', formData.category);
      formDataToSend.append('faculty', formData.faculty || '');
      
      // Append image file jika ada
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (editingProduct && formData.image) {
        // Jika edit dan tidak upload gambar baru, kirim URL lama
        formDataToSend.append('image', formData.image);
      }

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formDataToSend);
      } else {
        // Untuk create, wajib ada gambar
        if (!imageFile) {
          alert('Harap upload gambar produk');
          return;
        }
        await productService.createProduct(formDataToSend);
      }

      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan produk');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await productService.deleteProduct(id);
        loadData();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Gagal menghapus produk');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Kelola Produk</h1>
            <button onClick={() => handleOpenModal()} className="btn-primary">
              + Tambah Produk
            </button>
          </div>

          {loading ? (
            <div className="card p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.faculty}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.category?.name || product.category || 'Uncategorized'}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${
                            product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenModal(product)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="UNKLAB Hoodie Premium"
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
                  placeholder="Deskripsi produk..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harga (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                    placeholder="250000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stok *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="input-field"
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fakultas/UKM *</label>
                  <input
                    type="text"
                    required
                    value={formData.faculty}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    className="input-field"
                    placeholder="UKM Kreatif"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Produk *</label>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                    />
                  </div>
                )}

                {/* Upload Options */}
                <div className="space-y-3">
                  {/* File Upload */}
                  <div>
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <div className="btn-secondary w-full text-center cursor-pointer">
                        📁 Upload Gambar dari Komputer
                      </div>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Maksimal 5MB (JPG, PNG, WEBP) - Upload ke Cloudinary</p>
                  </div>
                </div>

                {!imagePreview && (
                  <p className="text-sm text-red-600 mt-2">* Harap upload gambar produk</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="btn-primary flex-1"
                  disabled={!editingProduct && !imageFile}
                >
                  {editingProduct ? 'Perbarui Produk' : 'Buat Produk'}
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

export default AdminProducts;


