const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require('./ai.controller');
const pdfController = require('./pdf.controller');

// Multer: memoria (no disco), solo PDFs
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

router.post('/generate', controller.generate);
router.post('/pdf', upload.single('file'), pdfController.extractPdf);

module.exports = router;