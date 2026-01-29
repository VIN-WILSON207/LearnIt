import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'learnit/general';
    let resource_type: 'image' | 'video' | 'raw' = 'image';

    // Determine folder and resource type based on file type
    if (file.mimetype.startsWith('image/')) {
      folder = 'learnit/images';
      resource_type = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      folder = 'learnit/videos';
      resource_type = 'video';
    } else {
      folder = 'learnit/documents';
      resource_type = 'raw';
    }

    return {
      folder: folder,
      resource_type: resource_type,
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'pdf', 'doc', 'docx', 'txt'],
    };
  },
});

// Create multer upload middleware
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, and documents
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
    }
  },
});

// Utility functions for Cloudinary operations
export const cloudinaryUtils = {
  // Upload file directly to Cloudinary
  uploadFile: (filePath: string, options: any = {}) => {
    return cloudinary.uploader.upload(filePath, options);
  },

  // Delete file from Cloudinary
  deleteFile: (publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image') => {
    return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  },

  // Get optimized URL
  getOptimizedUrl: (publicId: string, options: any = {}) => {
    return cloudinary.url(publicId, {
      quality: 'auto',
      fetch_format: 'auto',
      ...options,
    });
  },

  // Get video thumbnail
  getVideoThumbnail: (publicId: string, options: any = {}) => {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      format: 'jpg',
      ...options,
    });
  },
};

export default cloudinary;