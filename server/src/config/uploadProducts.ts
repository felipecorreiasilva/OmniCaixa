import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const productsFolder = path.resolve(__dirname, '../../uploads/products');

export default {
  directory: productsFolder,
  storage: multer.diskStorage({
    destination: productsFolder,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(6).toString('hex');
      const fileName = `${fileHash}-${file.originalname}`;
      return callback(null, fileName);
    },
  }),
};