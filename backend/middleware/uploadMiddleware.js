import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Smart script to auto-create the 'uploads' folder
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure where and how to save the file
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Strict validation: Accept Images, PDFs, Word, and PowerPoint
const checkFileType = (file, cb) => {
  // Allowed extensions
  const filetypes = /jpg|jpeg|png|pdf|doc|docx|ppt|pptx/;
  // Allowed MIME types
  const mimetypes = /jpeg|jpg|png|pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document|vnd.ms-powerpoint|vnd.openxmlformats-officedocument.presentationml.presentation/;
  
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Images, PDFs, Word, and PowerPoint files are allowed!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10000000 }, // 10MB limit for documents
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

export default upload;