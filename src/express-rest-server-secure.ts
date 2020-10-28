import express from 'express';
import bodyParser from 'body-parser';

import { Product } from './model/product';


import cors from 'cors';
import * as authController from './controller/AuthController';

const app = express();
const PORT = process.env.PORT || 9000;

let products: Array<Product>;

function load(){
    products = new Array<Product>();
    products.push(new Product(1, "IPhone 11", 80000, "Mobiles"));
    products.push(new Product(2, "Dell Inspiron", 6000, "Laptops"));
    products.push(new Product(3, "Xbox One", 35000, "Gaming"));
}
load();

//Middleware(intercepts the request==> preprocessing)
app.use((req, resp, next) => {

    console.log(`In middleware ${req.originalUrl} , process id: ${process.pid}`);
    next();
});


//Enable CORS
app.use(cors());



app.use(bodyParser.json());

app.use("/products", authController.authorizeProducts);

app.post("/login", authController.loginAction);
app.post("/refreshToken", authController.refreshToken);


app.get("/products", (req, resp) => {

    resp.json(products);
});


app.listen(PORT, () => {
    console.log(`REST API running on port ${PORT} with process id: ${process.pid}`);
})

