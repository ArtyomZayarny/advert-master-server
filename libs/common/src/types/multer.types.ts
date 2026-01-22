/**
 * Multer file type for file uploads
 * Compatible with Express.Multer.File
 */
export interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype?: string;
  size?: number;
  fieldname?: string;
  encoding?: string;
  destination?: string;
  filename?: string;
  path?: string;
}
