declare module 'multer-storage-cloudinary' {
  import { StorageEngine } from 'multer';
  
  export class CloudinaryStorage implements StorageEngine {
    constructor(options: {
      cloudinary: any;
      folder?: string;
      allowedFormats?: string[];
      maxFileSize?: number;
      filename?: (req: any, file: any, cb: any) => void;
      params?: any;
    });
    _handleFile(req: any, file: any, cb: any): void;
    _removeFile(req: any, file: any, cb: any): void;
  }
}