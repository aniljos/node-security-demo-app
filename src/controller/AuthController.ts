import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken';
import * as fs  from 'fs';
import * as path from 'path';
import { User } from '../model/user';

let users: Array<User> = new Array<User>();
const JWT_ACCESS_TOKEN_SECRET = "a7bffd9133b5abc893cfce78c2973a0fcd1a8307dca3334209d4951a53bc0c9b1fd9113ef3b238aaa4297985ba4e4fdee6e7d99d880c2a3ff3c39b16bcd2907a";
const JWT_REFRESH_TOKEN_SECRET = "e3b3c972f17f878e1f14cb1585a18792b48711587b4900afe41ff4a6c812c365e0f2b7278edc41436c9a81723bf7cbee867bfcfc0128fff5edaaac0056a81eb9"
let refreshTokens: Array<string> = [];


function loadUsers() {

    
    const jsonFilePath = path.join(__dirname, "/../../data/users.json"); 
    const jsonStr = fs.readFileSync(jsonFilePath, 'utf-8');
    users = JSON.parse(jsonStr);
    //console.log("users", users);

    
}
loadUsers();

export const loginAction = (req: Request<any>, resp: Response<any>)=> {

    console.log("loginAction")
    //validate the credentials
    //generate a JWT token 
    // invalid --return error code
    const reqUser = { email: req.body.email, password: req.body.password };
    console.log(reqUser);
    const user =
        users.find(item => item.email === reqUser.email && item.password === reqUser.password);   
    if (user) {
        const accessToken = jwt.sign(user, JWT_ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
        const refreshToken = jwt.sign(user, JWT_REFRESH_TOKEN_SECRET);
        refreshTokens.push(refreshToken);
        resp.json({ accessToken, refreshToken });
    }
    else {
        
        resp.sendStatus(401);
    }
}
export const fetchUserAction = (req: Request<any>, resp: Response<any>)=> {
    resp.json(users);
}
export const verifyUniqueUserEmailAction = (req: Request<any>, resp: Response<any>)=> {

    const email = req.query.email.toString();
    const index = users.findIndex(item => item.email.toLowerCase() === email.toLowerCase());
    if(index  === -1){
        resp.json({isAvailable: true});
    }
    else{
        resp.json({isAvailable: false})
    
    }
   
}
export const verifyUniqueUserMobileAction = (req: Request<any>, resp: Response<any>)=> {

    const mobile = req.query.mobile.toString();
    const index = users.findIndex(item => item.mobileNo.toString()  ===  mobile);
    if(index  === -1){
        resp.status(200);
        resp.end();
    }
    else{
        resp.status(400);
        resp.end();
    }
   
}
export const registerAction = (req: Request<any>, resp: Response<any>)=> {

    const user = req.body;
    try {
        
        const index = users.findIndex(item => item.email === user.email || item.mobileNo === user.mobileNo);
        if(index != -1){
            resp.sendStatus(400);
            resp.end();
        }
        else{
            
            if(users.length > 0 && users[users.length - 1]){
                const lastUser = users[users.length - 1];
                user.id = lastUser.id + 1 || 1;
            }
            else{
                user.id = 1;
            }
            
            users.push(user);
            resp.json(user);
        }

    } catch (error) {
        resp.status(500);
        resp.end();
    }
}
export const authorizeProducts = (req: Request<any>, resp: Response<any>, next: NextFunction) => {

    // authorization : Bearer sjgsjfhgsjdgh77657656ggfgfhgfhfh
    const authHeader = req.headers['authorization'];    
    const token = authHeader && authHeader.toString().split(' ')[1];
    if (token == null) {
        resp.sendStatus(401);
        return;
    }
    jwt.verify(token, JWT_ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return resp.sendStatus(403);

        console.log("User logged in: ", user);
        next();
    })

}

export const refreshToken = (req: Request, resp: Response) => {

    console.log("refreshToken", req.body);
    const refeshToken = req.body.token;
    console.log(refeshToken);
    if (refeshToken == null) return resp.sendStatus(401);
   
    if (!refreshTokens.includes(refeshToken)) return resp.sendStatus(401);
    

    jwt.verify(refeshToken, JWT_REFRESH_TOKEN_SECRET, (err: any, user: any) => {
        if (err) {
            return resp.sendStatus(403);
        }

        const accsessToken
            = jwt.sign({ name: user.name, password: user.password }, JWT_ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
        return resp.json({ accessToken: accsessToken });

    })
}

