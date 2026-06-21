import express from 'express';
import multer from 'multer';
import { upload as uploadController } from './upload.controller';

const router = express.Router();

const limits = { fileSize: 5 * 1024 * 1024 }; // 5MB

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG images are allowed'));
  }
};

const upload = multer({ storage: multer.memoryStorage(), limits, fileFilter });

router.post('/', upload.single('file'), uploadController);

export { router as uploadRoutes };