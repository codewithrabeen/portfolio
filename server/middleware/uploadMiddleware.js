
const multer = require("multer");

const storage = multer.memoryStorage();

const allowedImages = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const imageFields = {
  image: "Project image",
  profileImage: "Profile image",
};

const rejectUpload = (message) => {
  const error = new Error(message);
  error.status = 400;
  return error;
};

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum
  },

  fileFilter: (req, file, cb) => {
    if (imageFields[file.fieldname]) {
      if (allowedImages.includes(file.mimetype)) {
        return cb(null, true);
      }

      return cb(
        rejectUpload(
          `${imageFields[file.fieldname]} must be JPG, PNG or WEBP.`
        )
      );
    }

    // Resume
    if (file.fieldname === "resume") {
      if (file.mimetype === "application/pdf") {
        return cb(null, true);
      }

      return cb(
        rejectUpload("Resume must be a PDF file.")
      );
    }

    return cb(
      rejectUpload("Unsupported file upload field.")
    );
  },
});

module.exports = upload;

