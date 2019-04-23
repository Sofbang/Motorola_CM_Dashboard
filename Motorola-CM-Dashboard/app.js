const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const app = express();
const rateLimit = require("express-rate-limit");
app.enable("trust proxy");
//for app logging
const logger = require('./app_configuration/logger');
//For jwt auth
const jwt = require('jsonwebtoken');
var fs = require('fs');
const publicKey = fs.readFileSync('keys/publicKey.key', 'utf8');
const { Pool } = require('pg');
//put dev/uat(.env file names) to access particular env variables it will set in process.env
require('custom-env').env('dev', './enviroment');
console.log("ENV:" + process.env.APP_ENV);
//create postgre sql connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECT
})
//pass pool object to db_operations
require('./app_configuration/db_operations')(pool);
// Parsers
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
//create a cors middleware
app.use(function (req, res, next) {
  //set headers to allow cross origin request.
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
//our rest services
const generateToken = require('./rest_services/generateToken');
const lookupebs = require('./rest_services/ebs');
const lookupsc = require('./rest_services/smartclient');
app.use('/Motorola-CM-Dashboard/api', generateToken, errorHandler);
app.use('/Motorola-CM-Dashboard/api', verifyToken, lookupebs, errorHandler);
app.use('/Motorola-CM-Dashboard/api', verifyToken, lookupsc, errorHandler);

/**
 * Route middleware to verfy Authoriztion headers using (JWT) which are passed with every request using public key to verify
 * */
function verifyToken(req, res, next) {
  const header = req.headers['authorization'];
  if (header != undefined) {
    if (header.split(" ")[0] == "Bearer") {
      const token = header.split(" ")[1];
      jwt.verify(token, publicKey, function (err, payload) {
        if (err) {
          return res.status(401).send({ auth: false, message: 'Unauthorizedd' });
        }
        next();
      });
    } else {
      res.status(401).send({ auth: false, "message": "Unauthorizess" });
    }
  } else {
    res.status(401).send({ auth: false, "message": "Unauthorizeaa" });
  }
}
/**
 * Error handler Middleware to handle errors
 * @param {*} err-error comes in any db operation 
 * @param {*} req- req body 
 * @param {*} res -res body
 */
function errorHandler(err, req, res, next) {
  //log error
  logger.log({
    level: 'error',
    message: err.message
  });
  if (process.env.APP_ENV !== 'development') {
    delete err.stack;
  }
  //send error response
  res.status(err.status || 500);
  res.send({ message: err.message })
}

// Angular DIST output folder
app.use(express.static(path.join(__dirname, 'dist')));

// Send all other requests to the Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/Motorola-CM-Dashboard/index.html'));
});

//Set Port
// const port = process.env.PORT || '3000';
const port = process.env.APP_PORT;
app.set('port', port);

const server = http.createServer(app);
//const server = https.createServer(options, app);//to run on https

server.listen(port, () => console.log(`Running on localhost:${port}`));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
 
//  apply to all requests
app.use(limiter);