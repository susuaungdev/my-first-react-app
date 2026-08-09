import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.join(
  __dirname,
  "../../uploads"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true,
    }
  );
}

const storage = multer.diskStorage({
  destination: (
    req,
    file,
    callback
  ) => {
    callback(
      null,
      uploadDirectory
    );
  },

  filename: (
    req,
    file,
    callback
  ) => {
    const uniqueName =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}`;

    const extension =
      path.extname(
        file.originalname
      );

    callback(
      null,
      `${uniqueName}${extension}`
    );
  },
});

const fileFilter: multer.Options["fileFilter"] = (
  req,
  file,
  callback
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {
    callback(null, true);
  } else {
    callback(
      new Error(
        "Only JPG, PNG, and WebP images are allowed"
      )
    );
  }
};

export const uploadProfilePicture =
  multer({
    storage,
    fileFilter,

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },
  });