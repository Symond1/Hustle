import multer from "multer";
import path from "path";

// Configure multer memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|pdf|doc|docx/; // Allowed file types
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error("Only files of type jpeg, jpg, png, gif, pdf, doc, or docx are allowed."));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
});

export const singleUpload = (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message, success: false });
        } else if (err) {
            return res.status(400).json({ message: err.message, success: false });
        }
        next();
    });
};

export default upload;
