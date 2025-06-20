// middlewares/uploadMiddleware.js
const multer = require('multer');

// Configure multer for temporary storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2000 * 1024 * 1024 // 2GB to accommodate your largest file size
    }
});

// Middleware to handle multipart form data
const parseMultipartForm = (req, res, next) => {
    const uploadFields = upload.fields([
        { name: 'attachments', maxCount: 10 },
        { name: 'files', maxCount: 10 },
        { name: 'file', maxCount: 1 },
        { name: 'image', maxCount: 1 },
        { name: 'media', maxCount: 10 },
        { name: 'medias', maxCount: 10 },
        { name: 'images', maxCount: 10 },
    ]);

    uploadFields(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: `Upload error: ${err.message}`
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: `Unknown error: ${err.message}`
            });
        }
        next();
    });
};

module.exports = { parseMultipartForm };