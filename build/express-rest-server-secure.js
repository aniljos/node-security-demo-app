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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const cors_1 = __importDefault(require("cors"));
const authController = __importStar(require("./controller/AuthController"));
const app = express_1.default();
const PORT = process.env.PORT || 9090;
let products;
function load() {
    products = new Array();
    const jsonFilePath = path.join(__dirname, "/../data/data.json");
    const jsonStr = fs.readFileSync(jsonFilePath, 'utf-8');
    products = JSON.parse(jsonStr);
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
// app.use("/products", authController.authorizeProducts);
app.post("/login", authController.loginAction);
app.post("/register", authController.registerAction);
app.get("/users", authController.fetchUserAction);
app.get("/verifyUserEmail", authController.verifyUniqueUserEmailAction);
app.get("/verifyUserMobile", authController.verifyUniqueUserMobileAction);
app.post("/refreshToken", authController.refreshToken);
app.get("/products", (req, resp) => {
    resp.json(products);
});
app.get("/products/:id", (req, resp) => {
    const id = req.params.id;
    if (id) {
        const product = products.find(item => item.id.toString() === id);
        if (product) {
            resp.json(product);
        }
        else {
            resp.status(404).send();
        }
    }
    else {
        resp.status(400).send();
    }
});
app.delete("/products/:id", (req, resp) => {
    //id exists ==> remove status: 200
    // not exist  ==>  status: 404
    // error ==> 500
    const id = req.params.id;
    try {
        const index = products.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            products.splice(index, 1);
            resp.status(200).send();
        }
        else {
            resp.status(404).send();
        }
    }
    catch (error) {
        resp.status(500).send();
    }
});
app.put("/products/:id", (req, resp) => {
    // product not found == 404
    // is found and valid ==> update ==> 200
    // invalid ==> 400
    // error ==> 500
    try {
        const id = req.params.id;
        const product = req.body;
        const index = products.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            products[index] = product;
            resp.status(200).send();
        }
        else {
            resp.status(404).send();
        }
    }
    catch (error) {
        resp.status(500).send();
    }
});
//create a new product
app.post("/products", (req, resp) => {
    // Validate the product ==> not valid ==> status: 400(Bad request)
    // Valid product ==> update the data-store => status: 201(Created)
    // Error is saving ==> status: 500(ISR)
    try {
        const product = req.body;
        const index = products.findIndex(item => item.id === product.id);
        if (index === -1) {
            products.push(product);
            resp.status(201);
            resp.end();
        }
        else {
            //No Valid
            resp.status(400).send();
        }
    }
    catch (error) {
        //error
        resp.status(500).send();
    }
});
app.listen(PORT, () => {
    console.log(`REST API running on port ${PORT} with process id: ${process.pid}`);
});
