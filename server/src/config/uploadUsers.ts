import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const usersFolder = path.resolve(__dirname, '../../uploads/users');

export default {
  directory: usersFolder,
  storage: multer.diskStorage({
    destination: usersFolder,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(6).toString('hex');
      const fileName = `${fileHash}-${file.originalname}`;
      return callback(null, fileName);
    },
  }),
};