import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

// Secure file upload configuration
const UPLOAD_DIR = process.env.VERCEL === "1" ? "/tmp/tickets" : "uploads/tickets";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png", 
  "image/jpeg",
  "image/jpg",
  "image/webp"
];

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate secure filename to prevent path traversal
    const secureFilename = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${secureFilename}${ext}`);
  },
});

// Enhanced file filter with security checks
const fileFilter = (req: any, file: any, cb: any) => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type. Only ${ALLOWED_MIME_TYPES.join(', ')} files are allowed.`), false);
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error(`Invalid file extension. Only ${allowedExtensions.join(', ')} extensions are allowed.`), false);
  }

  // Prevent path traversal in filename
  if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
    return cb(new Error('Invalid filename: path traversal detected'), false);
  }

  cb(null, true);
};

export const secureUpload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Only allow single file upload
    fieldSize: 1024 * 1024, // 1MB field size limit
  },
  fileFilter: fileFilter,
});

// Middleware to validate uploaded file content
export const validateFileContent = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;
  const buffer = fs.readFileSync(filePath);
  
  // Check file signatures (magic numbers)
  const isValidFile = validateFileSignature(buffer, req.file.mimetype);
  
  if (!isValidFile) {
    // Delete the invalid file
    fs.unlinkSync(filePath);
    return res.status(400).json({ 
      error: "Invalid file content: file signature doesn't match declared type" 
    });
  }
  
  next();
};

// Validate file signatures to prevent disguised malicious files
function validateFileSignature(buffer: Buffer, mimetype: string): boolean {
  const signatures: Record<string, number[][]> = {
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
    'image/jpeg': [[0xFF, 0xD8, 0xFF]], // JPEG
    'image/jpg': [[0xFF, 0xD8, 0xFF]], // JPG
    'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]], // PNG
    'image/webp': [[0x52, 0x49, 0x46, 0x46]] // WEBP (starts with RIFF)
  };

  const expectedSignatures = signatures[mimetype];
  if (!expectedSignatures) return false;

  return expectedSignatures.some(signature => 
    signature.every((byte, index) => buffer[index] === byte)
  );
}

// Error handler for multer
export const handleUploadError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Only one file allowed.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field name for file upload.' });
    }
  }
  
  if (err.message) {
    return res.status(400).json({ error: err.message });
  }
  
  next(err);
};
