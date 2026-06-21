import { Request, Response } from 'express';
import { save } from './upload.service';
import { sendSuccess, sendError } from '../../shared/utils/response';

export const upload = async (req: Request, res: Response) => {
  if (!req.file) {
    return sendError(res, 400, 'NO_FILE', 'No file uploaded');
  }
  try {
    const url = await save(req.file);
    sendSuccess(res, 200, { url });
  } catch (err: any) {
    sendError(res, 500, 'UPLOAD_FAILED', err.message);
  }
};