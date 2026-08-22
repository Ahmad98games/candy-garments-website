const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { gatekeeper, CAPABILITIES } = require('../middleware/gatekeeper');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

// Dangerous file extensions to block
const DANGEROUS_EXTENSIONS = ['.php', '.php3', '.phtml', '.exe', '.sh', '.bat', '.js', '.html', '.htm', '.asp', '.aspx', '.jsp'];

// Use memory storage for validation before saving to disk
const memoryStorage = multer.memoryStorage();

const upload = multer({
    storage: memoryStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// Rate limiter for uploads (5 uploads per 15 minutes)
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { error: 'Too many uploads from this IP, please try again later.' }
});

// Rate limiter for approval endpoint (10 attempts per 15 minutes)
const approvalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: 'Too many approval attempts, please try again later.' }
});

// Secure file upload middleware with magic byte validation
const secureFileUpload = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }

        // Import file-type dynamically (ESM module)
        const { fileTypeFromBuffer } = await import('file-type');

        // Validate magic bytes
        const type = await fileTypeFromBuffer(req.file.buffer);
        const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];

        if (!type || !allowedMimes.includes(type.mime)) {
            return res.status(400).json({
                error: 'Only images (JPEG, PNG) and PDFs are allowed!'
            });
        }

        // Block dangerous extensions
        const originalExt = path.extname(req.file.originalname).toLowerCase();
        if (DANGEROUS_EXTENSIONS.includes(originalExt)) {
            return res.status(400).json({
                error: 'Invalid file extension. Executable files are not allowed.'
            });
        }

        // Generate safe filename
        const sanitizedName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + '-' + sanitizedName;

        // Ensure uploads directory exists
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Write file to disk with restricted permissions (owner read/write only)
        const uploadPath = path.join(uploadsDir, filename);
        fs.writeFileSync(uploadPath, req.file.buffer, { mode: 0o600 });

        // Update req.file with disk location
        req.file.path = uploadPath;
        req.file.filename = filename;

        next();
    } catch (error) {
        console.error('File validation error:', error);
        return res.status(500).json({ error: 'File validation failed' });
    }
};

// Routes
router.post('/', gatekeeper(CAPABILITIES.STATE_MUTATING), orderController.createOrder); // Public for guest checkout
router.get('/', gatekeeper(CAPABILITIES.READ_ONLY), protect, orderController.getUserOrders);
router.get('/admin/all', gatekeeper(CAPABILITIES.READ_ONLY), protect, authorize('admin'), orderController.getAllOrders);
router.get('/:id', gatekeeper(CAPABILITIES.READ_ONLY), protect, orderController.getOrderById);
router.put('/:id/cancel', gatekeeper(CAPABILITIES.STATE_MUTATING), protect, orderController.cancelOrder);
router.put('/:id/status', gatekeeper(CAPABILITIES.STATE_MUTATING), protect, authorize('admin'), orderController.updateOrderStatus);

// Payment Proof Upload with security layers
router.post('/:id/receipt',
    gatekeeper(CAPABILITIES.STATE_MUTATING),
    uploadLimiter,           // Rate limit: 5 uploads per 15 min
    upload.single('receipt'), // Parse multipart form data
    secureFileUpload,        // Validate magic bytes and save securely
    orderController.uploadPaymentProof
);

// Order Approval with rate limiting and token protection
router.get('/:id/approve',
    gatekeeper(CAPABILITIES.STATE_MUTATING),
    approvalLimiter,         // Rate limit: 10 attempts per 15 min
    orderController.approveOrder
);

// Order Rejection with rate limiting and token protection
router.get('/:id/reject',
    gatekeeper(CAPABILITIES.STATE_MUTATING),
    approvalLimiter,         // Rate limit: 10 attempts per 15 min
    orderController.rejectOrder
);

// Secure Receipt Retrieval (Private - no static serving)
router.get('/:id/receipt',
    gatekeeper(CAPABILITIES.READ_ONLY),
    protect,                 // Requires JWT authentication
    orderController.getReceipt
);

module.exports = router;