const express = require('express');
const router = express.Router();
const response = require('../app_configuration/response');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const privateKey = fs.readFileSync('keys/privateKey.key', 'utf8');
//Authenticate User
router.post('/generateToken', (req, res, next) => {
    let oktaToken = req.body.oktatoken; //contains oktatoken+app_secret
    let appSecret = oktaToken.substr(oktaToken.length - 32, oktaToken.length - 1);
    if (appSecret == process.env.APP_SECRET_KEY) {
        //generate jwt token using oktatoken and app private key    
        let token = jwt.sign({ token: oktaToken }, privateKey, { algorithm: 'RS256', expiresIn: "1h" });// params are (payload,privateKey,options) 
        if (token) {
            response.status = 200;
            response.message = "User authenticated successfully";
            response.data = {
                "accessToken": token,
                "expiresIn": 3600
            };
        } else {
            response.status = 409;
            response.message = "Unable to generate Token";
            response.data=[];
            
        }
    }
    else {
        response.status = 409;
        response.message = "Unable to generate Token";
        response.data=[];
    }
    res.json(response);
});
module.exports = router;