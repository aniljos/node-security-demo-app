"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const product_1 = require("./model/product");
const cors_1 = __importDefault(require("cors"));
const authController = __importStar(require("./controller/AuthController"));
const app = express_1.default();
const PORT = process.env.PORT || 9000;
let products;
function load() {
    products = new Array();
    products.push(new product_1.Product(1, "IPhone 11", 80000, "Mobiles"));
    products.push(new product_1.Product(2, "Dell Inspiron", 6000, "Laptops"));
    products.push(new product_1.Product(3, "Xbox One", 35000, "Gaming"));
}
load();
//Middleware(intercepts the request==> preprocessing)
app.use((req, resp, next) => {
    console.log(`In middleware ${req.originalUrl} , process id: ${process.pid}`);
    next();
});
//Enable CORS
app.use(cors_1.default());
app.use(body_parser_1.default.json());
app.use("/products", authController.authorizeProducts);
app.post("/login", authController.loginAction);
app.post("/refreshToken", authController.refreshToken);
app.get("/products", (req, resp) => {
    resp.json(products);
});
app.listen(PORT, () => {
    console.log(`REST API running on port ${PORT} with process id: ${process.pid}`);
});
