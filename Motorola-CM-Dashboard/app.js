const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const app = express();
//for app logging
const logger = require('./app_configuration/logger');
const { Pool } = require('pg')
const connectionString = 'postgresql://sofbang_admin:Sofbang2019@sofbanginstance.cxbsn39rr5kp.us-east-2.rds.amazonaws.com/contract_dash';
//create postgre sql connection pool
const pool = new Pool({
  connectionString: connectionString
})
//pass pool object to db_operations
require('./app_configuration/db_operations')(pool);
//our rest services
const lookup = require('./rest_services/lookup');
app.use('/Motorola-CM-Dashboard/api', lookup, errorHandler);


/**
 * Error handler Middleware to handle errors
 * @param {*} err-error comes in any db operation 
 * @param {*} req- req body 
 * @param {*} res -res body
 */
function errorHandler(err, req, res) {
  //log error
  logger.log({
    level: 'error',
    message: err.message
  });
  if (req.app.get('env') !== 'development') {
    delete err.stack;
  }
  //send error response
  res.status(err.status || 500);
  res.send({ message: err.message })
}
// Parsers
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

// Angular DIST output folder
app.use(express.static(path.join(__dirname, 'dist')));
//create a cors middleware
app.use(function (req, res, next) {
  //set headers to allow cross origin request.
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// Send all other requests to the Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/Motorola-CM-Dashboard/index.html'));
});

//Set Port
// const port = process.env.PORT || '3000';
const port = process.env.PORT || '4000';
app.set('port', port);

const server = http.createServer(app);
//const server = https.createServer(options, app);//to run on https

server.listen(port, () => console.log(`Running on localhost:${port}`));
