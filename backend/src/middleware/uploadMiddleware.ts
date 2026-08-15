import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

export const uploadDirectory = path.resolve(__dirname, "../../uploads");

fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedFiles: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (_req, file, callback) => {
    const extension = allowedFiles[file.mimetype];

    if (!extension) {
      callback(new Error("Unsupported image type."), "");
      return;
    }

    callback(null, `${randomUUID()}${extension}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  callback
) => {
  const expectedExtension = allowedFiles[file.mimetype];
  const originalExtension = path.extname(file.originalname).toLowerCase();
  const validJpegExtension =
    file.mimetype === "image/jpeg" &&
    [".jpg", ".jpeg"].includes(originalExtension);

  if (
    expectedExtension &&
    (originalExtension === expectedExtension || validJpegExtension)
  ) {
    callback(null, true);
    return;
  }

  callback(new Error("Only valid JPG, PNG, and WebP images are allowed."));
};

export const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 20,
    fieldNameSize: 100,
    fieldSize: 256 * 1024,
  },
});