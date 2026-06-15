import multer from "multer";

import { BadRequestError } from "../errors/badRequestError.js";

const MAX_FILE_SIZE = 25 * 1024 * 1024; //25MB
const MAX_FILES = 20;

const SUPPORTED_MIME_TYPES = [
  // images
  "image/jpeg", // .jpg, .jpeg
  "image/png", // .png
  "image/webp", // .webp
  "image/gif", // .gif
  "image/avif", // .avif
  // videos
  "video/mp4", // .mp4
  "video/webm", // .webm
  "video/quicktime", // .mov
];

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter: (_req, file, cb) => {
    if (SUPPORTED_MIME_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new BadRequestError("Unsupported file type"));
  },
});

export default upload;
