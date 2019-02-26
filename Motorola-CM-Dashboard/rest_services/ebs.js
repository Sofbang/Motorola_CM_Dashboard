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
      territory 
FROM   (SELECT to_status              AS Status, 
              Median(daysinstatus)   AS MedianDays, 
              Count(contract_number) AS contractPerStatus, 
              territory 
       FROM   (SELECT contract_number, 
                      to_status, 
                      Min(sts_changed_on), 
                      datemoved, 
                      To_number(Trim(To_char(datemoved - Min(sts_changed_on), 
                                     'DD')), 
                      '99G999D9S') AS 
                      DaysInStatus, 
                      territory 
               FROM   (SELECT A2.contract_number, 
                              A2.to_status, 
                              A2.sts_changed_on, 
                              territory, 
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
                         territory)R2 
       GROUP  BY to_status, 
                 territory 
       ORDER  BY to_status) R3 
WHERE  status IN ( 'GENERATE_PO', 'PO_ISSUED', 'QA_HOLD', 'MODIFY_PO' ) 
     -- AND territory IN ( " + territory + " ) 
GROUP  BY status,territory;`, [],
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
      WHERE  to_status IN ( 'GENERATE_PO', 'PO_ISSUED', 'QA_HOLD', 'MODIFY_PO' )`, [],
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


// // API for arrival_type
router.get('/arrival_type', (req, res, next) => {
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
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `select to_status as Status, trim(to_char(avg(DaysInStatus)::interval, 'DD')) as AverageDays,   
      count(contract_number) as contractPerStatus, TERRITORY  from
        (
          select contract_number, to_status, min(sts_changed_on), DateMoved,  
          DateMoved - min(sts_changed_on) as DaysInStatus, TERRITORY    from 
            (
              select A2.contract_number, A2.to_status, A2.sts_changed_on,TERRITORY,
              coalesce(
                (
                  select max(A1.sts_changed_on) from ebs_contracts_state_master A1 
                  where A1.contract_number = A2.contract_number
                  and A1.from_STATUS = A2.to_status),
                  current_date
                 ) as DateMoved 
              from ebs_contracts_state_master A2 order by contract_number, sts_changed_on  
            ) resultset group by contract_number, to_status, DateMoved, TERRITORY
        )R2 WHERE  to_status IN ( 'GENERATE_PO', 'PO_ISSUED', 'QA_HOLD', 'MODIFY_PO' ) 
        group by to_status, TERRITORY ORDER BY TO_STATUS`, [],
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

module.exports = router;
