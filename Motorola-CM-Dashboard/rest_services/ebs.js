const express = require('express');
const router = express.Router();
const conn = require('../app_configuration/db_operations');
const response = require('../app_configuration/response');

//EBS Data implemented by Vishal Sehgal as on 8/2/2019
router.get('/ebs_contract_state', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `SELECT status, 
      SUM (mediandays :: INTEGER) AS mediandays, 
      SUM(contractperstatus)      AS contractscount,
      territory,
      arrival_type 
FROM   (SELECT to_status              AS Status, 
              Median(daysinstatus)   AS MedianDays, 
              Count(contract_number) AS contractPerStatus, 
              territory,
              arrival_type 
       FROM   (SELECT contract_number, 
                      to_status, 
                      Min(sts_changed_on), 
                      datemoved, 
                      To_number(Trim(To_char(datemoved - Min(sts_changed_on), 
                                     'DD')), 
                      '99G999D9S') AS 
                      DaysInStatus, 
                      territory,
                      arrival_type 
               FROM   (SELECT A2.contract_number, 
                              A2.to_status, 
                              A2.sts_changed_on, 
                              territory,
                              arrival_type, 
                              Coalesce((SELECT Max(A1.sts_changed_on) 
                                        FROM   ebs_contracts_state_master A1 
                                        WHERE  A1.contract_number = 
                                               A2.contract_number 
                                               AND A1.from_status = 
                                                   A2.to_status), 
                              current_date) AS 
                                      DateMoved 
                       FROM   ebs_contracts_state_master A2 
                       ORDER  BY contract_number, 
                                 sts_changed_on) resultset 
               GROUP  BY contract_number, 
                         to_status, 
                         datemoved, 
                         territory,arrival_type)R2 
       GROUP  BY to_status, 
                 territory,arrival_type 
       ORDER  BY to_status) R3 
WHERE  status IN ( 'Generate PO', 'PO Issued', 'QA Hold', 'Modify PO' )  
GROUP  BY status,territory,arrival_type;`, [],
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


// API for ebs_territories
router.get('/ebs_territories', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `SELECT DISTINCT( territory ) 
      FROM   ebs_contracts_state_master 
      ORDER  BY territory ASC`, [],
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
// API for ebs_workflow_status
router.get('/ebs_workflow_status', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `SELECT DISTINCT( to_status ) 
      FROM   ebs_contracts_state_master 
      WHERE  to_status IN ( 'Generate PO', 'PO Issued', 'QA Hold', 'Modify PO' ) `, [],
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

// API for ebs_workflow_status
router.post('/ebs_contracts_drilldown', (req, res, next) => {
  //call doConnect method in db_operations
  var status =  req.query;
  //console.log("the status passed is:"+JSON.stringify(status));
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      "Select distinct contract_number,customer_name,contract_owner,contract_creation_date,to_status,sts_changed_on from ebs_contracts_state_master where date_trunc('day',contract_creation_date)  BETWEEN'"+ req.body.first +"' AND '" + req.body.last + "' ", [],
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

// API for ebs_workflow_status
router.get('/ebs_dates_max_min', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      "Select TO_CHAR(MAX(contract_creation_date), 'yyyy-mm-dd') as max_date_cases, TO_CHAR(MIN(contract_creation_date), 'yyyy-mm-dd')  as min_date_cases from ebs_contracts_state_master", [],
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



// // API for ebs_workflow_status
// router.get('/ebs_contracts_status_avg', (req, res, next) => {
//   //call doConnect method in db_operations
//   conn.doConnect((err, dbConn) => {
//     if (err) { return next(err); }
//     //execute query using using connection instance returned by doConnect method
//     conn.doExecute(dbConn,
//       "Select TO_CHAR(MAX(contract_creation_date), 'yyyy-mm-dd') as max_date_cases, TO_CHAR(MIN(contract_creation_date), 'yyyy-mm-dd')  as min_date_cases from ebs_contracts_state_master", [],
//       function (err, result) {
//         if (err) {
//           conn.doRelease(dbConn);
//           //call error handler
//           return next(err);
//         }
//         response.data = result.rows;
//         res.json(response);
//         //release connection back to pool
//         conn.doRelease(dbConn);
//       });
//   });
// });



// // API for arrival_type
router.get('/ebs_arrival_type', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `SELECT DISTINCT( arrival_type ) 
      FROM   ebs_contracts_state_master 
      ORDER  BY arrival_type ASC`, [],
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
// API for ebs_contract_state_avg
router.get('/ebs_contract_state_avg', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    var postgresql ="select to_status as status,count(contract_number) as contracts_count,Avg(q.days) averagedays,territory,TO_CHAR(MAX(contract_creation_date), 'yyyy-mm-dd')  as Contract_creation_date  from(select contract_number,to_status,territory,contract_creation_date, date_signed, CASE WHEN date_signed is not null THEN date_signed::date-contract_creation_date::date ELSE current_date::date-contract_creation_date::date END as days from ebs_contracts_state_master)q   group by to_status,territory,contract_creation_date";
    //console.log("the query for avg is:"+JSON.stringify(postgresql));
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      postgresql, [],
      function (err, result) {
        if (err) {
          conn.doRelease(dbConn);
          //call error handler
          //console.log("error---" + err);
          return next(err);
        }
        response.data = result.rows;
        res.json(response);
        //release connection back to pool
        conn.doRelease(dbConn);
      });
  });
});

router.post('/ebs_cycle_times', (req, res, next) => {
  var status =  req.body;
 // console.log("the status passed is:"+JSON.stringify(status));
  //call doConnect method in db_operations
  var postgresql = "select to_status as status,count(contract_number) as contracts_count,median(q.days) median_days,territory,TO_CHAR(MAX(contract_creation_date), 'yyyy-mm-dd')  as Contract_creation_date  from(select contract_number,to_status,territory,contract_creation_date, date_signed, CASE WHEN date_signed is not null THEN date_signed::date-contract_creation_date::date ELSE current_date::date-contract_creation_date::date END as days from ebs_contracts_state_master)q   WHERE  to_status IN ( 'GENERATE_PO', 'PO_ISSUED', 'QA_HOLD', 'MODIFY_PO' )  AND  date_trunc('day',contract_creation_date) BETWEEN '"+req.body.from+"' AND '"+req.body.to+"' group by to_status,territory,contract_creation_date";
  //console.log("the query is:"+postgresql)
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      postgresql, [],
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
