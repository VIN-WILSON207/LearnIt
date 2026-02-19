import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
const CloudinaryStorageModule = require('multer-storage-cloudinary');
const CloudinaryStorage = CloudinaryStorageModule.CloudinaryStorage || CloudinaryStorageModule;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Use memory storage to handle file in controller
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});



export default upload;
