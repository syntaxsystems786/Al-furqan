"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const productController_1 = require("../controllers/productController");
const router = express_1.default.Router();
// Ensure uploads directory exists
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Use memory storage so we can compress with sharp before saving
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
router.get('/', productController_1.getProducts);
router.get('/:id', productController_1.getProductById);
router.post('/', upload.array('images', 5), productController_1.createProduct);
router.put('/:id', upload.array('images', 5), productController_1.updateProduct);
router.delete('/:id', productController_1.deleteProduct);
exports.default = router;
