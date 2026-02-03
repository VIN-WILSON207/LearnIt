import { Request } from 'express';
import multer from 'multer';
import CloudinaryStorage from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary storage engine
// @ts-ignore - multer-storage-cloudinary v2 uses a function call, not a constructor
const storage = CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
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
      // Add standard allowed formats
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'pdf', 'doc', 'docx', 'txt'],
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

export default upload;
