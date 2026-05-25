import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 1. Smart script to auto-create the 'uploads' folder if it is missing!
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure where and how to save the file
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir); // Save to the backend/uploads folder
  },
  filename(req, file, cb) {
    // Rename the file to ensure no duplicate names (e.g., image-163456789.png)
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// 3. Strict validation: Only accept images
const checkFileType = (file, cb) => {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, JPEG, PNG) are allowed!'));
  }
};

// 4. Initialize Multer with a 5MB size limit
const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

export default upload;