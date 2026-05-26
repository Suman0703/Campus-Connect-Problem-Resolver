import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const checkFileType = (file, cb) => {
  const filetypes = /jpg|jpeg|png|pdf|doc|docx|ppt|pptx/;
  const mimetypes = /jpeg|jpg|png|pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document|vnd.ms-powerpoint|vnd.openxmlformats-officedocument.presentationml.presentation/;
  
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) return cb(null, true);
  cb(new Error('Invalid file type. Only Images, PDFs, Word, and PowerPoint files are allowed!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 20000000 }, // 20MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

export default upload;