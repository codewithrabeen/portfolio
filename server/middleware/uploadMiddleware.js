
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum
  },

  fileFilter: (req, file, cb) => {
    // Profile image
    if (file.fieldname === "profileImage") {
      const allowedImages = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (allowedImages.includes(file.mimetype)) {
        return cb(null, true);
      }

      return cb(
        new Error(
          "Profile image must be JPG, PNG or WEBP."
        )
      );
    }

    // Resume
    if (file.fieldname === "resume") {
      if (file.mimetype === "application/pdf") {
        return cb(null, true);
      }

      return cb(
        new Error("Resume must be a PDF file.")
      );
    }

    return cb(
      new Error("Unsupported file upload field.")
    );
  },
});

module.exports = upload;

