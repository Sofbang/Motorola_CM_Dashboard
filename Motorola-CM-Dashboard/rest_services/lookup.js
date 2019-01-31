const express = require('express');
const router = express.Router();
const conn = require('../app_configuration/db_operations');
const response=require('../app_configuration/response');
// Response handling
//get lookupvalues by lookuptype(foreg,:ELEMENT_DATA_TYPE)
router.get('/lookup', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err,dbConn) => {
    if(err){return;}
    //execute query using using connection instance returned by doConnect method
     conn.doExecute(dbConn,
      `select max_conn,used,res_for_super,max_conn-used-res_for_super res_for_normal 
      from 
        (select count(*) used from pg_stat_activity) t1,
        (select setting::int res_for_super from pg_settings where name=$$superuser_reserved_connections$$) t2,
        (select setting::int max_conn from pg_settings where name=$$max_connections$$) t3`,[],
      function (err, result) {
        if (err) {
          conn.doRelease(dbConn);
          //call error handler
          return next(err);
        }
        response.data = result.rows;
        res.json(response);
        //release connection back to pool
        conn.doRelease(dbConn);
      });
  });
});
module.exports = router;
