import multer from "multer";

import config from "../config/config.js";
import { BadRequestError } from "../errors/badRequestError.js";

const SUPPORTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",

  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSizeBytes,
    files: config.upload.maxFiles,
  },
  fileFilter: (_req, file, cb) => {
    if (SUPPORTED_MIME_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new BadRequestError("Unsupported file type"));
  },
});

export default upload;
