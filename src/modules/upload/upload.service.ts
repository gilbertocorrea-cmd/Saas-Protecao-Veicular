import fs from 'fs';
import path from 'path';

export const save = async (file: Express.Multer.File): Promise<string> => {
  const ext = path.extname(file.originalname);
  const name = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
  const dir = path.join(__dirname, '../../uploads');
  await fs.promises.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, name);
  await fs.promises.writeFile(filePath, file.buffer);
  return `/uploads/${name}`;
};