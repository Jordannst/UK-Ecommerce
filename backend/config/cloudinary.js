import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'starg-ecommerce/products', // Folder di Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' }, // Resize untuk optimize
      { quality: 'auto' } // Auto quality optimization
    ]
  }
});

// Multer upload dengan Cloudinary storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipe file tidak didukung. Hanya JPEG, PNG, dan WEBP yang diperbolehkan.'), false);
    }
  }
});

// Helper function untuk extract public_id dari Cloudinary URL
export const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) {
    return null;
  }
  
  try {
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    
    if (uploadIndex === -1) return null;
    
    // Get everything after 'upload/v{version}/'
    const pathAfterUpload = parts.slice(uploadIndex + 2).join('/');
    // Remove file extension
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

// Helper function untuk delete image dari Cloudinary
export const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    const publicId = getPublicIdFromUrl(imageUrl);
    
    if (!publicId) {
      console.log('No valid public_id found, skipping deletion');
      return { success: false, message: 'Invalid Cloudinary URL' };
    }
    
    console.log(`Deleting image from Cloudinary: ${publicId}`);
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log(`Image deleted successfully: ${publicId}`);
      return { success: true, result };
    } else {
      console.log(`Image deletion failed: ${result.result}`);
      return { success: false, result };
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return { success: false, error: error.message };
  }
};

export { cloudinary, upload };

